// Load environment variables early
require('dotenv').config();

// Export the configured Express app without starting the server
const app = require('./src/app');

module.exports = app;