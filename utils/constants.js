const CLIENT = {
  MESSAGE: {
    NEW_USER: 'NEW_USER',
    NEW_MESSAGE: 'NEW_MESSAGE'
  }
};

// Export for server-side use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PORT: process.env.PORT || 8080,
    CLIENT
  };
}

