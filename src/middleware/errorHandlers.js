function notFoundHandler(req, res, _next) {
	res.status(404).json({ error: 'Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
	const status = err.status || 500;
	const message = err.message || 'Internal Server Error';
	if (process.env.NODE_ENV !== 'test') {
		// Avoid noisy logs when tests run
		// eslint-disable-next-line no-console
		console.error(err);
	}
	res.status(status).json({ error: message });
}

module.exports = { notFoundHandler, errorHandler };
