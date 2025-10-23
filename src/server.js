// Dedicated server entry to start listening
require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, (err) => {
	if (err) {
		console.error('Server failed to start', err);
		process.exit(1);
	}
	console.log(`Server listening on port ${PORT}`);
});

module.exports = server;
