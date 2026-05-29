const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const { PORT, CLIENT } = require("./utils/constants.js");

// Helper: safely serve a file
function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".ico": "image/x-icon",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml"
    }[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let filePath = req.url;

  // Always serve index.html for root
  if (filePath === "/") {
    return serveFile(res, path.join(__dirname, "public/index.html"));
  }

  // Serve favicon correctly
  if (filePath === "/favicon.ico") {
    return serveFile(res, path.join(__dirname, "public/favicon.ico"));
  }

  // Serve /public/* files
  if (filePath.startsWith("/public/")) {
    return serveFile(res, path.join(__dirname, filePath));
  }

  // Serve /utils/* files
  if (filePath.startsWith("/utils/")) {
    return serveFile(res, path.join(__dirname, filePath));
  }

  // Fallback: 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

// WebSocket server
const wsServer = new WebSocket.Server({ server });

wsServer.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (data) => {
    const msg = JSON.parse(data);

    switch (msg.type) {
      case CLIENT.MESSAGE.NEW_USER:
        broadcast({
          type: CLIENT.MESSAGE.NEW_USER,
          payload: msg.payload
        });
        break;

      case CLIENT.MESSAGE.NEW_MESSAGE:
        broadcast({
          type: CLIENT.MESSAGE.NEW_MESSAGE,
          payload: msg.payload
        });
        break;
    }
  });

  socket.on("close", () => console.log("Client disconnected"));
});

function broadcast(message) {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



