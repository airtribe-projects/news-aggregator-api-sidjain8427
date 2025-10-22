// Simple in-memory user store for demo/testing purposes
// In a real app, replace with a database layer

let seq = 1;
const users = [];

function create({ name, email, passwordHash, preferences = [] }) {
	const user = {
		id: String(seq++),
		name,
		email: email.toLowerCase(),
		passwordHash,
		preferences: Array.isArray(preferences) ? preferences : [],
		readArticles: [],
		favoriteArticles: [],
	};
	users.push(user);
	return { ...user };
}

function findByEmail(email) {
	return users.find((u) => u.email === String(email).toLowerCase());
}

function findById(id) {
	return users.find((u) => u.id === String(id));
}

function update(id, patch) {
	const user = findById(id);
	if (!user) return null;
	Object.assign(user, patch);
	return { ...user };
}

function addRead(id, articleId) {
	const user = findById(id);
	if (!user) return null;
	if (!user.readArticles.includes(articleId)) user.readArticles.push(articleId);
	return { ...user };
}

function addFavorite(id, articleId) {
	const user = findById(id);
	if (!user) return null;
	if (!user.favoriteArticles.includes(articleId)) user.favoriteArticles.push(articleId);
	return { ...user };
}

module.exports = {
	create,
	findByEmail,
	findById,
	update,
	addRead,
	addFavorite,
};
