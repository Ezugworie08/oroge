const express = require('express');
const morgan = require('morgan'); // Import morgan for logging

const { notFoundMiddleware, errorHandlerMiddleware } = require('./middleware');
const { logFileRouter, logFilesRouter } = require('./routes');

const app = express();

// Use morgan for logging HTTP requests
app.use(morgan('dev'));

// Parse JSON bodies for incoming requests
app.use(express.json());

// Define routes
app.use('/logFiles', logFilesRouter); // Use plural form for consistency
app.use('/logFile', logFileRouter);

// Middleware for handling 404 Not Found
app.use(notFoundMiddleware);

// Middleware for handling errors
app.use(errorHandlerMiddleware);

module.exports = app;