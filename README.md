# News Aggregator API

Minimal Express.js API that lets users sign up, log in, manage content preferences, and fetch aggregated news articles from external providers (GNews preferred, NewsAPI as fallback). Users can also mark articles as read or favorite.

-   App entry: [src/app.js](src/app.js)
-   Server entry: [src/server.js](src/server.js)
-   Users routes: [src/routes/users.js](src/routes/users.js) via [`usersController.*`](src/controllers/usersController.js)
-   News routes: [src/routes/news.js](src/routes/news.js) via [`newsController.*`](src/controllers/newsController.js)
-   Auth: [`authMiddleware`](src/middleware/auth.js)
-   Error handling: [`errorHandlers.notFoundHandler`](src/middleware/errorHandlers.js), [`errorHandlers.errorHandler`](src/middleware/errorHandlers.js)
-   News service: [`newsService.fetchNewsForPreferences`](src/services/newsService.js)
-   In-memory store: [`usersStore.*`](src/store/usersStore.js)
-   Tests: [test/server.test.js](test/server.test.js)

Note: User data is stored in-memory for demo/testing. Restarting the server resets data.

## Quick start

-   Requirements: Node.js >= 18
-   Clone and install:

```bash
git clone <your-fork-or-repo-url> news-aggregator-api
cd news-aggregator-api
cp .env.example .env
# Edit .env and set JWT_SECRET, and (recommended) GNEWS_API_KEY or NEWS_API_KEY
npm install
npm run dev
```

-   Default port: 3000 (configurable via `PORT` in `.env`)
-   Health check: GET http://localhost:3000/health → `{ "status": "ok" }`

## Environment variables

Copy [.env.example](.env.example) to `.env` and set:

-   PORT: HTTP port (default 3000)
-   JWT_SECRET: secret for signing JWTs (required)
-   GNEWS_API_KEY: API key from https://gnews.io/ (preferred provider)
-   NEWS_API_KEY: API key from https://newsapi.org/ (fallback provider)

If no provider key is configured, the API returns a sample placeholder article from [`newsService`](src/services/newsService.js).

## Run, dev, and test

-   Start: `npm start` (runs [src/server.js](src/server.js))
-   Dev (reload): `npm run dev` (requires `nodemon`)
-   Test: `npm test` (runs [test/server.test.js](test/server.test.js))

## Authentication

-   Sign up to create a user.
-   Log in to receive a JWT. The API also sets an HttpOnly cookie named `token` for clients that prefer cookie auth.
-   Send auth either as:
    -   Header: `Authorization: Bearer <JWT>`
    -   Or carry the `token` cookie set by POST /users/login.

Implemented by [`authMiddleware`](src/middleware/auth.js).

## Caching

News responses are cached per-preference-set in-memory for 5 minutes using `node-cache`. See [`newsService.fetchNewsForPreferences`](src/services/newsService.js).

## API reference

Base URL: `http://localhost:3000`

-   Users
    -   POST /users/signup
    -   POST /users/login
    -   GET /users/preferences
    -   PUT /users/preferences
-   News
    -   GET /news
    -   GET /news/search/:keyword
    -   POST /news/:id/read
    -   POST /news/:id/favorite
    -   GET /news/read
    -   GET /news/favorites

### Users

1. POST /users/signup  
   Creates a new user.

Request body:

```json
{
	"name": "Clark Kent",
	"email": "clark@superman.com",
	"password": "Krypt()n8",
	"preferences": ["movies", "comics"]
}
```

Success 200:

```json
{ "id": "1", "name": "Clark Kent", "email": "clark@superman.com" }
```

Validation errors 400, conflict 409.  
Handler: [`usersController.signup`](src/controllers/usersController.js)

2. POST /users/login  
   Authenticates a user and returns a JWT. Also sets an HttpOnly cookie `token`.

Request body:

```json
{ "email": "clark@superman.com", "password": "Krypt()n8" }
```

Success 200:

```json
{ "token": "<jwt>" }
```

Errors: 400 (validation), 401 (invalid credentials).  
Handler: [`usersController.login`](src/controllers/usersController.js)

3. GET /users/preferences (auth)  
   Returns current user's preferences.

Success 200:

```json
{ "preferences": ["movies", "comics"] }
```

Errors: 401 (no/invalid token), 404 (user not found).  
Handler: [`usersController.getPreferences`](src/controllers/usersController.js)

4. PUT /users/preferences (auth)  
   Updates preferences.

Request body:

```json
{ "preferences": ["movies", "comics", "games"] }
```

Success 200:

```json
{ "preferences": ["movies", "comics", "games"] }
```

Errors: 400 (validation), 401, 404.  
Handler: [`usersController.updatePreferences`](src/controllers/usersController.js)

### News

All endpoints require authentication.

1. GET /news  
   Returns news for the authenticated user's preferences.

Success 200:

```json
{
	"news": [
		{
			"id": "https://example.com/article",
			"title": "Some Title",
			"description": "Summary...",
			"url": "https://example.com/article",
			"source": "Provider",
			"publishedAt": "2024-01-01T00:00:00.000Z"
		}
	]
}
```

Errors: 401, 404 (user), 502 (provider fetch error).  
Handler: [`newsController.getNews`](src/controllers/newsController.js)

2. GET /news/search/:keyword  
   Fetches news for a provided keyword.

Success 200: same shape as GET /news.  
Handler: [`newsController.searchNews`](src/controllers/newsController.js)

3. POST /news/:id/read  
   Marks an article as read.

Success 200:

```json
{ "readArticles": ["<id-1>", "<id-2>"] }
```

Handler: [`newsController.markRead`](src/controllers/newsController.js)

4. POST /news/:id/favorite  
   Marks an article as favorite.

Success 200:

```json
{ "favoriteArticles": ["<id-1>", "<id-2>"] }
```

Handler: [`newsController.markFavorite`](src/controllers/newsController.js)

5. GET /news/read  
   Returns read articles IDs.

Success 200:

```json
{ "readArticles": ["<id-1>", "<id-2>"] }
```

Handler: [`newsController.getRead`](src/controllers/newsController.js)

6. GET /news/favorites  
   Returns favorite articles IDs.

Success 200:

```json
{ "favoriteArticles": ["<id-1>", "<id-2>"] }
```

Handler: [`newsController.getFavorites`](src/controllers/newsController.js)

## Curl examples

1. Sign up:

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Clark Kent","email":"clark@superman.com","password":"Krypt()n8","preferences":["movies","comics"]}'
```

2. Log in:

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clark@superman.com","password":"Krypt()n8"}'
```

Copy the "token" value from the response.

3. Get preferences:

```bash
curl http://localhost:3000/users/preferences \
  -H "Authorization: Bearer <jwt>"
```

4. Update preferences:

```bash
curl -X PUT http://localhost:3000/users/preferences \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"preferences":["movies","comics","games"]}'
```

5. Get news:

```bash
curl http://localhost:3000/news \
  -H "Authorization: Bearer <jwt>"
```

## Project structure

```
.env
.env.example
app.js                # Exposes configured app for tests
package.json
src/
  app.js              # Express app setup, routes, middleware
  server.js           # HTTP server bootstrap
  routes/
    users.js          # /users endpoints
    news.js           # /news endpoints
  controllers/
    usersController.js
    newsController.js
  middleware/
    auth.js           # JWT auth
    errorHandlers.js  # 404 + error handler
  services/
    newsService.js    # Provider calls + caching
  store/
    usersStore.js     # In-memory users
test/
  server.test.js      # e2e tests using tap + supertest
```

Key symbols:

-   Users: [`usersController.signup`](src/controllers/usersController.js), [`usersController.login`](src/controllers/usersController.js), [`usersController.getPreferences`](src/controllers/usersController.js), [`usersController.updatePreferences`](src/controllers/usersController.js)
-   News: [`newsController.getNews`](src/controllers/newsController.js), [`newsController.searchNews`](src/controllers/newsController.js), [`newsController.markRead`](src/controllers/newsController.js), [`newsController.markFavorite`](src/controllers/newsController.js), [`newsController.getRead`](src/controllers/newsController.js), [`newsController.getFavorites`](src/controllers/newsController.js)
-   Auth: [`authMiddleware`](src/middleware/auth.js)
-   Errors: [`errorHandlers.notFoundHandler`](src/middleware/errorHandlers.js), [`errorHandlers.errorHandler`](src/middleware/errorHandlers.js)
-   Store: [`usersStore.create`](src/store/usersStore.js), [`usersStore.findByEmail`](src/store/usersStore.js), [`usersStore.findById`](src/store/usersStore.js), [`usersStore.update`](src/store/usersStore.js), [`usersStore.addRead`](src/store/usersStore.js), [`usersStore.addFavorite`](src/store/usersStore.js)
-   Service: [`newsService.fetchNewsForPreferences`](src/services/newsService.js)

## Troubleshooting

-   401 Unauthorized: Ensure you send `Authorization: Bearer <jwt>` or have the `token` cookie set from login.
-   502 Failed to fetch news: Check `GNEWS_API_KEY` or `NEWS_API_KEY` in `.env`.
-   Port in use: Change `PORT` in `.env`.
-   Node version: Ensure Node >= 18 (`node -v`).

## License

ISC (see [package.json](package.json)).
