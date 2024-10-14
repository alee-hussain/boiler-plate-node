const socket = require("socket.io");

const connect_socket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: "*",
    },
  });
};

module.exports = connect_socket;
