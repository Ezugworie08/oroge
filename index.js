const fs = require('fs').promises;
const path = require('path');

const express = require('express');

const { listFiles } = require('./utils/index');


const app = express();
const port = process.env.PORT || 3000;
const rootDir = process.env.ROOT_DIR || './logs';
const logDir = path.resolve(__dirname, rootDir);

app.use(express.json());

// This endpoint will return all the log files in the provided logs directory
app.get('/', async (req, res) => {

    try {
        const logFiles = await listFiles(logDir);
        console.log(logFiles);
        res.json({logFiles});
    } catch (err){
        res.status(500).json({error: err});
    }
  
});


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});
  
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
        message: err.message
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});