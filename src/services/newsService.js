const axios = require('axios');
const NodeCache = require('node-cache');

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes

function buildCacheKey(preferences) {
	return `news:${preferences.sort().join(',').toLowerCase()}`;
}

function sampleArticles() {
	return [
		{
			id: 'sample-1',
			title: 'Sample News Item',
			description: 'Set GNEWS_API_KEY (preferred) or NEWS_API_KEY to fetch live news.',
			url: 'https://example.com/news/sample',
			source: 'sample',
			publishedAt: new Date().toISOString(),
		},
	];
}

async function fetchFromGNews(query) {
	if (!GNEWS_API_KEY) return null; // not configured

	const url = 'https://gnews.io/api/v4/search';
	const params = {
		q: query,
		lang: 'en',
		max: 20,
		sortby: 'publishedAt',
		token: GNEWS_API_KEY,
	};
	const response = await axios.get(url, { params });
	const articles = response.data.articles || [];
	return articles.map((a) => ({
		id: a.url,
		title: a.title,
		description: a.description,
		url: a.url,
		source: a.source?.name || 'unknown',
		publishedAt: a.publishedAt,
	}));
}

async function fetchFromNewsApi(query) {
	if (!NEWS_API_KEY) return null; // not configured

	const url = 'https://newsapi.org/v2/everything';
	const params = {
		q: query,
		sortBy: 'publishedAt',
		language: 'en',
		pageSize: 20,
		apiKey: NEWS_API_KEY,
	};

	const response = await axios.get(url, { params });
	const articles = response.data.articles || [];
	return articles.map((a) => ({
		id: a.url, // using URL as a stable id surrogate
		title: a.title,
		description: a.description,
		url: a.url,
		source: a.source?.name || 'unknown',
		publishedAt: a.publishedAt,
	}));
}

async function fetchFromProviders(query) {
	// Prefer GNews when configured
	if (GNEWS_API_KEY) {
		try {
			const data = await fetchFromGNews(query);
			if (data) return data;
		} catch (e) {
			// fall through to other providers or sample
		}
	}
	if (NEWS_API_KEY) {
		try {
			const data = await fetchFromNewsApi(query);
			if (data) return data;
		} catch (e) {
			// fall through to sample
		}
	}
	return sampleArticles();
}

async function fetchNewsForPreferences(preferences = []) {
	const prefs = Array.isArray(preferences) ? preferences : [];
	const key = buildCacheKey(prefs);
	const cached = cache.get(key);
	if (cached) return cached;

	const query = prefs.length ? prefs.join(' OR ') : 'technology OR world';
	const news = await fetchFromProviders(query);
	cache.set(key, news);
	return news;
}

module.exports = { fetchNewsForPreferences };
