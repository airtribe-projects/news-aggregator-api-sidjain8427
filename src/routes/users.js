const { Router } = require('express');
const { body } = require('express-validator');
const { signup, login, getPreferences, updatePreferences } = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

// POST /users/signup
router.post(
	'/signup',
	[
		body('name').trim().notEmpty().withMessage('name is required'),
		body('email').isEmail().withMessage('valid email is required'),
		body('password').isLength({ min: 6 }).withMessage('password min length 6'),
		body('preferences').optional().isArray().withMessage('preferences must be an array of strings'),
	],
	signup
);

// POST /users/login
router.post(
	'/login',
	[
		body('email').isEmail().withMessage('valid email is required'),
		body('password').isString().withMessage('password is required'),
	],
	login
);

// GET /users/preferences
router.get('/preferences', authMiddleware, getPreferences);

// PUT /users/preferences
router.put(
	'/preferences',
	authMiddleware,
	[body('preferences').isArray().withMessage('preferences must be an array of strings')],
	updatePreferences
);

module.exports = router;
