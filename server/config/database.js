/**
 * Database configuration
 */
module.exports = {
    // Redis configuration
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        messageHistoryLimit: 100, // Keep only last 100 messages per room
        defaultFetchCount: 10     // Default number of messages to fetch for history
    },

    // Elasticsearch configuration
    elasticsearch: {
        node: process.env.ES_NODE || 'http://localhost:9200',
        index: 'chat_messages',
        mappings: {
            properties: {
                username: { type: 'keyword' },
                message: { type: 'text' },
                room: { type: 'keyword' },
                timestamp: { type: 'date' }
            }
        },
        searchResultLimit: 10 // Default number of search results to return
    }
};