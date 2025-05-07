/**
 * Elasticsearch service for message storage and search
 */
const { Client } = require('@elastic/elasticsearch');
const { elasticsearch: esConfig } = require('../config/database');
const logger = require('../utils/logger');

// Initialize Elasticsearch client
const esClient = new Client({
    node: esConfig.node
});

/**
 * Set up Elasticsearch index for chat messages
 */
async function setupElasticsearch() {
    try {
        // esConfig.index -> return 'chat_messages'
        const indexExists = await esClient.indices.exists({
            index: esConfig.index
        });

        if (!indexExists) {
            await esClient.indices.create({
                index: esConfig.index,
                body: {
                    mappings: {
                        properties: esConfig.mappings.properties
                    }
                }
            });
            logger.info(`Created Elasticsearch index: ${esConfig.index}`);
        }
        return true;
    } catch (error) {
        logger.error('Elasticsearch setup error:', error);
        throw error;
    }
}

/**
 * Store a message in Elasticsearch
 * @param {Object} messageData - Message data object
 * @returns {Object} Elasticsearch response
 */
async function indexMessage(messageData) {
    try {
        const response = await esClient.index({
            index: esConfig.index,
            body: messageData
        });
        return response;
    } catch (error) {
        logger.error('Elasticsearch index error:', error);
        throw error;
    }
}

/**
 * Search for messages in Elasticsearch
 * @param {string} query - Search query
 * @param {string} room - Room ID to search in
 * @returns {Array} Array of search results
 */
async function searchMessages(query, room) {
    try {
        const response = await esClient.search({
            index: esConfig.index,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { message: query } },
                            { match: { room: room } }
                        ]
                    }
                },
                sort: [{ timestamp: { order: 'desc' } }],
                size: esConfig.searchResultLimit
            }
        });

        return response.hits.hits.map(hit => hit._source);
    } catch (error) {
        logger.error('Elasticsearch search error:', error);
        return [];
    }
}

module.exports = {
    esClient,
    setupElasticsearch,
    indexMessage,
    searchMessages
};