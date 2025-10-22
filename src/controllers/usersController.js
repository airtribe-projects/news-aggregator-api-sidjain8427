const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const usersStore = require('../store/usersStore');

async function signup(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, email, password, preferences = [] } = req.body;

	const existing = usersStore.findByEmail(email);
	if (existing) {
		return res.status(409).json({ error: 'User already exists' });
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const user = usersStore.create({ name, email, passwordHash, preferences });
	return res.status(200).json({ id: user.id, name: user.name, email: user.email });
}

async function login(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email, password } = req.body;
	const user = usersStore.findByEmail(email);
	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' });

	// Set JWT as HttpOnly cookie for clients that don't send Authorization header
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 2 * 60 * 60 * 1000, // 2 hours
	};
	res.cookie('token', token, cookieOptions);

	return res.status(200).json({ token });
}

async function getPreferences(req, res) {
	const user = usersStore.findById(req.user.id);
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ preferences: user.preferences || [] });
}

async function updatePreferences(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	const { preferences } = req.body;
	const user = usersStore.update(req.user.id, { preferences });
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ preferences: user.preferences });
}

module.exports = {
	signup,
	login,
	getPreferences,
	updatePreferences,
};
