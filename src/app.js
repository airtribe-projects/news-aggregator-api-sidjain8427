const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const usersRouter = require('./routes/users');
const newsRouter = require('./routes/news');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const app = express();

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));

// Routes
app.use('/users', usersRouter);
app.use('/news', newsRouter);

// Health check
app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
