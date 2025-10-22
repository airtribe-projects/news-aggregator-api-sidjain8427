const newsService = require('../services/newsService');
const usersStore = require('../store/usersStore');

async function getNews(req, res) {
	const user = usersStore.findById(req.user.id);
	if (!user) return res.status(404).json({ error: 'User not found' });

	try {
		const news = await newsService.fetchNewsForPreferences(user.preferences || []);
		return res.status(200).json({ news });
	} catch (err) {
		return res.status(502).json({ error: 'Failed to fetch news' });
	}
}

async function searchNews(req, res) {
	const { keyword } = req.params;
	try {
		const news = await newsService.fetchNewsForPreferences([keyword]);
		return res.status(200).json({ news });
	} catch (e) {
		return res.status(502).json({ error: 'Failed to fetch news' });
	}
}

async function markRead(req, res) {
	const { id } = req.params;
	const user = usersStore.addRead(req.user.id, id);
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ readArticles: user.readArticles });
}

async function markFavorite(req, res) {
	const { id } = req.params;
	const user = usersStore.addFavorite(req.user.id, id);
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ favoriteArticles: user.favoriteArticles });
}

async function getRead(req, res) {
	const user = usersStore.findById(req.user.id);
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ readArticles: user.readArticles || [] });
}

async function getFavorites(req, res) {
	const user = usersStore.findById(req.user.id);
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ favoriteArticles: user.favoriteArticles || [] });
}

module.exports = {
	getNews,
	searchNews,
	markRead,
	markFavorite,
	getRead,
	getFavorites,
};
