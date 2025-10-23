const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function authMiddleware(req, res, next) {
	// Try Authorization header first
	const authHeader = req.headers['authorization'] || '';
	let token = null;
	if (authHeader) {
		const [scheme, credentials] = authHeader.split(' ');
		if (scheme === 'Bearer' && credentials) {
			token = credentials;
		}
	}

	// Fallback to cookie named "token"
	if (!token && req.cookies && req.cookies.token) {
		token = req.cookies.token;
	}

	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = { id: payload.userId };
		return next();
	} catch (_err) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

module.exports = {
	authMiddleware,
	JWT_SECRET,
};
