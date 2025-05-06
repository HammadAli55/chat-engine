/**
 * Redis service for real-time messaging and recent message storage
 */
const Redis = require('ioredis');
const { redis: redisConfig } = require('../config/database');
const logger = require('../utils/logger');

// Initialize Redis clients
const redisClient = new Redis(redisConfig.url);
const redisSubscriber = new Redis(redisConfig.url);

/**
 * Setup Redis subscriptions
 */
async function setupRedis() {
    try {
        // Subscribe to the chat channel
        await redisSubscriber.subscribe('chat');

        // Log successful connection
        logger.info('Redis subscriptions established');
        return true;
    } catch (error) {
        logger.error('Redis setup error:', error);
        throw error;
    }
}

/**
 * Get message handler for Redis pubsub
 * @param {Object} io - Socket.io instance
 * @returns {Function} Message handler function
 */
function getMessageHandler(io) {
    return async (channel, message) => {
        try {
            const messageData = JSON.parse(message);
            // Broadcast the message to all connected clients in the specific room
            io.to(messageData.room).emit('chat message', messageData);
        } catch (error) {
            logger.error('Redis message handling error:', error);
        }
    };
}

/**
 * Set up the message handler for Redis subscriber
 * @param {Object} io - Socket.io instance 
 */
function setupMessageHandler(io) {
    redisSubscriber.on('message', getMessageHandler(io));
}

/**
 * Store a chat message in Redis
 * @param {Object} messageData - Message data object
 */
async function storeMessage(messageData) {
    try {
        const roomKey = `room:${messageData.room}:messages`;
        await redisClient.lpush(roomKey, JSON.stringify(messageData));
        await redisClient.ltrim(roomKey, 0, redisConfig.messageHistoryLimit - 1);
        await redisClient.publish('chat', JSON.stringify(messageData));
    } catch (error) {
        logger.error('Redis store message error:', error);
        throw error;
    }
}

/**
 * Fetch recent message history for a room
 * @param {string} room - Room ID
 * @param {number} count - Number of messages to fetch (default from config)
 * @returns {Array} Array of message objects
 */
async function fetchRoomHistory(room, count = redisConfig.defaultFetchCount) {
    try {
        const messages = await redisClient.lrange(`room:${room}:messages`, 0, count - 1);
        return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (error) {
        logger.error('Error fetching room history:', error);
        return [];
    }
}

module.exports = {
    redisClient,
    redisSubscriber,
    setupRedis,
    setupMessageHandler,
    storeMessage,
    fetchRoomHistory
};