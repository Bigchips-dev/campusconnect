let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register user to a room of their userId
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined room`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
};
