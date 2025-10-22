## News Aggregator API

Modular Express.js API with user authentication (JWT), preferences, and news fetching via NewsAPI, built for the Backend Engineering Launchpad assignment.

### Features

-   User signup/login with bcrypt password hashing and JWT auth
-   Store and update user news preferences
-   Fetch news based on preferences with optional caching
-   Optional: mark news as read/favorite, search by keyword

### Tech Stack

-   Node.js, Express.js
-   JWT (jsonwebtoken), bcrypt
-   Axios for HTTP calls, NodeCache for caching
-   express-validator for input validation
-   dotenv for environment variables

### Getting Started

1. Install dependencies

```bash
npm install
```

2. Create an `.env` file from the example

```bash
cp .env.example .env
```

Populate values:

```
PORT=3000
JWT_SECRET=change_me
GNEWS_API_KEY=your_gnews_api_key_here
# Optional fallback provider
NEWS_API_KEY=your_newsapi_key_here
```

3. Run the server

```bash
npm start
```

4. Run tests

```bash
npm test
```

### API Endpoints

Auth and preferences (all paths prefixed with `/users`):

-   POST `/users/signup` { name, email, password, preferences? }
-   POST `/users/login` { email, password } -> { token }
-   GET `/users/preferences` (auth) -> { preferences }
-   PUT `/users/preferences` (auth) { preferences: string[] }

News:

-   GET `/news` (auth) -> { news: Article[] }
-   GET `/news/search/:keyword` (auth)
-   POST `/news/:id/read` (auth)
-   POST `/news/:id/favorite` (auth)
-   GET `/news/read` (auth)
-   GET `/news/favorites` (auth)

If neither `GNEWS_API_KEY` nor `NEWS_API_KEY` is set, the API will return a sample news item for development/testing. When both are present, GNews is preferred.

### Notes

-   This project uses an in-memory store for simplicity. Replace `src/store/usersStore.js` with a database for production use.
-   The app is modular: routes/controllers/services/middleware for clarity and testability.
