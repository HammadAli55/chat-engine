/**
 * Logger utility for consistent logging
 */

/**
 * Log an info message
 * @param  {...any} args - Arguments to log
 */
function info(...args) {
    console.log(new Date().toISOString(), '[INFO]', ...args);
}

/**
 * Log an error message
 * @param  {...any} args - Arguments to log
 */
function error(...args) {
    console.error(new Date().toISOString(), '[ERROR]', ...args);
}

/**
 * Log a warning message
 * @param  {...any} args - Arguments to log
 */
function warn(...args) {
    console.warn(new Date().toISOString(), '[WARN]', ...args);
}

/**
 * Log a debug message
 * @param  {...any} args - Arguments to log
 */
function debug(...args) {
    if (process.env.DEBUG) {
        console.debug(new Date().toISOString(), '[DEBUG]', ...args);
    }
}

module.exports = {
    info,
    error,
    warn,
    debug
};