/**
 * Main entry point for the chat application server
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Import configurations and services
const serverConfig = require('./config/server');
const { setupElasticsearch } = require('./services/elasticsearch');
const { setupRedis } = require('./services/redis');
const apiRoutes = require('./routes/api');
const setupSocketHandlers = require('./socket/chat-handler');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, serverConfig.socketOptions);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.use('/api', apiRoutes);

// Setup databases and socket handlers
async function initializeApp() {
  try {
    // Setup databases
    await setupElasticsearch();
    await setupRedis();
    
    // Setup socket handlers
    setupSocketHandlers(io);
    
    // Start the server
    server.listen(serverConfig.PORT, () => {
      logger.info(`Server running on port ${serverConfig.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = server; // Export for testing