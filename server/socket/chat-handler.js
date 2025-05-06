/**
 * Socket.io handlers for chat functionality
 */
const { storeMessage, fetchRoomHistory, setupMessageHandler } = require('../services/redis');
const { indexMessage, searchMessages } = require('../services/elasticsearch');
const logger = require('../utils/logger');

/**
 * Set up all socket.io event handlers
 * @param {Object} io - Socket.io instance
 */
function setupSocketHandlers(io) {
    // Set up Redis message handler with io instance
    setupMessageHandler(io);

    io.on('connection', (socket) => {
        logger.info('New user connected:', socket.id);

        // Handle user joining a room
        socket.on('join room', async (data) => {
            const { username, room } = data;

            // Join the specified room
            socket.join(room);

            // Notify everyone in the room
            const joinMessage = {
                username: 'System',
                message: `${username} has joined the room`,
                room,
                timestamp: new Date().toISOString()
            };

            io.to(room).emit('user joined', joinMessage);
            logger.info(`${username} joined room: ${room}`);

            try {
                // Send last messages from this room
                const messages = await fetchRoomHistory(room);
                socket.emit('room history', messages);
            } catch (error) {
                logger.error('Error fetching room history:', error);
                socket.emit('error', { message: 'Failed to fetch room history' });
            }
        });

        // Handle chat messages
        socket.on('chat message', async (data) => {
            try {
                const messageData = {
                    username: data.username,
                    message: data.message,
                    room: data.room,
                    timestamp: new Date().toISOString()
                };

                // Store message in Redis and Elasticsearch
                await Promise.all([
                    storeMessage(messageData),
                    indexMessage(messageData)
                ]);

            } catch (error) {
                logger.error('Error handling message:', error);
                socket.emit('error', { message: 'Failed to process message' });
            }
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            logger.info('User disconnected:', socket.id);
        });

        // Handle search request
        socket.on('search messages', async (data) => {
            try {
                const { query, room } = data;

                if (!query || !room) {
                    return socket.emit('search error', { message: 'Query and room are required' });
                }

                const results = await searchMessages(query, room);
                socket.emit('search results', results);
            } catch (error) {
                logger.error('Search error:', error);
                socket.emit('search error', { message: 'Search failed' });
            }
        });
    });
}

module.exports = setupSocketHandlers;