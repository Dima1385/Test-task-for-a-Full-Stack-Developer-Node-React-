const http = require('http');
const app = require('./app');
const { createWebSocketServer } = require('./websocket');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket available on ws://localhost:${PORT}`);
});
