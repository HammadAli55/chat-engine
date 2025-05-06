/**
 * Server configuration
 */
module.exports = {
    // Server port
    PORT: process.env.PORT || 3000,

    // Socket.io configuration options
    socketOptions: {
        cors: {
            origin: process.env.CORS_ORIGIN || ["http://localhost:4200"],
            methods: ["GET", "POST"],
            credentials: true
        }
    }
};