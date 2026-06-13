const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const config = require('./src/config');
const { initSocket } = require('./src/socket');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.clientUrl || 'http://localhost:5173',
    credentials: true,
  },
});

initSocket(io);

server.listen(config.port, () => {
  console.log(`🚀 CampusConnect API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Health check: http://localhost:${config.port}/api/health`);
});
