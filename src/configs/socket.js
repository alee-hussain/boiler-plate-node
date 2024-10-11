const socket = require("socket.io");

const connectSocket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: "*",
    },
  });
};

module.exports = connectSocket;
