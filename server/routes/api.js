/**
 * API routes for the chat application
 */
const express = require('express');
const router = express.Router();
const { searchMessages } = require('../services/elasticsearch');
const logger = require('../utils/logger');

/**
 * @route   GET /api/search
 * @desc    Search for messages
 * @access  Public
 */
router.get('/search', async (req, res) => {
    try {
        const { query, room } = req.query;

        // Validate required parameters
        if (!query || !room) {
            return res.status(400).json({
                error: 'Query and room parameters are required'
            });
        }

        const results = await searchMessages(query, room);
        res.json(results);
    } catch (error) {
        logger.error('Search API error:', error);
        res.status(500).json({
            error: 'Search failed',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = router;