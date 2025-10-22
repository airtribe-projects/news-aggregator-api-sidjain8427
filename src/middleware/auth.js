const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function authMiddleware(req, res, next) {
	const authHeader = req.headers['authorization'] || '';
	const [scheme, token] = authHeader.split(' ');

	if (!token || scheme !== 'Bearer') {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = { id: payload.userId };
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

module.exports = {
	authMiddleware,
	JWT_SECRET,
};
