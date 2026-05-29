const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const { PORT, CLIENT } = require("./utils/constants.js");

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = req.url;

  // Serve index.html for root
  if (filePath === "/") {
    filePath = "/public/index.html";
  }

  // Special case: favicon.ico (Render requests this automatically)
  if (filePath === "/favicon.ico") {
    filePath = "/public/favicon.ico";
  }

  // Build absolute path
  const absolutePath = path.join(__dirname, filePath);

  // Determine MIME type
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Stream file safely
  fs.createReadStream(absolutePath)
    .on("error", () => {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    })
    .on("open", () => {
      res.writeHead(200, { "Content-Type": contentType });
    })
    .pipe(res);
});

// Create WebSocket server
const wsServer = new WebSocket.Server({ server });

// Handle WebSocket connections
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

      default:
        console.log("Unknown message type:", msg.type);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

// Broadcast helper
function broadcast(message) {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


