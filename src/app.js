const express = require('express');

const { notFoundMiddleware, errorHandlerMiddleware } = require('./middleware');
const { logFileRouter, logFilesRouter } = require('./routes');
const { DEFAULT_PORT } = require('./utils/constants');


const app = express();
const port = process.env.PORT || DEFAULT_PORT;

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/logFile', logFileRouter);
app.use('/logs', logFilesRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.info(`Oroge server is running on port ${port}`);
});
