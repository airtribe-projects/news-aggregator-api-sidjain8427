const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getNews, searchNews, markRead, markFavorite, getRead, getFavorites } = require('../controllers/newsController');

const router = Router();

// GET /news -> protected
router.get('/', authMiddleware, getNews);

// Optional extensions
router.get('/search/:keyword', authMiddleware, searchNews);
router.post('/:id/read', authMiddleware, markRead);
router.post('/:id/favorite', authMiddleware, markFavorite);
router.get('/read', authMiddleware, getRead);
router.get('/favorites', authMiddleware, getFavorites);

module.exports = router;
