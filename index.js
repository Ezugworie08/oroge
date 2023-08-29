const path = require('path');

const express = require('express');

const { traverseDir, readLastNLines } = require('./utils/index');


const app = express();
const port = process.env.PORT || 3000;
const rootDir = process.env.ROOT_DIR || './logs';
const logDir = path.resolve(__dirname, rootDir);

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// This endpoint will return all the log files in the provided logs directory
app.get('/', async (req, res) => {

    try {
        let logFiles = await traverseDir(logDir);

        logFiles = logFiles
            .map(({filePath, fileURL, encodedFilePath}) => {

                const { base, dir } = path.parse(filePath);
                const baseDir = dir.split(logDir).pop();
                const qFilePath = path.join(baseDir, base);
                return { qFilePath, fileURL, encodedFilePath};
            })
            .sort((a, b) => a.qFilePath.localeCompare(b.qFilePath, 'en', {sensitivity: 'base'}));

        res.json({logFiles});
    } catch (err){
        console.error('Error', err);
        res.status(500).json({error: err});
    }
  
});

// This endpoint will return the last n lines of the log file
app.get('/file', async (req, res) => {
    const decodedFilePath = decodeURIComponent(req.query.filepath);
    const searchQuery = !!req.query.q ? decodeURIComponent(req.query.q) : '';
    const limit = req.query.limit ? req.query.limit : 10;

    try {       
        let logFilesPaths = await traverseDir(logDir); // get all the log files in the logs directory
        logFilesPaths = logFilesPaths.map(({filePath}) => filePath); 

        const isValidFilePath = logFilesPaths.includes(decodedFilePath); // check if the file exists in the logs directory

        if (!isValidFilePath) {
            console.error(`Log file ${decodeFilePath} not found`);
            res.status(404).json({error: 'Log file not found'});
        }

        const lines = await readLastNLines({
            filePath: decodedFilePath, 
            nLines: limit, 
            searchQuery
        });
        res.json({lines});
    } catch (err){
        console.error('Error', err);
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
  console.info(`Oroge server is running on port ${port}`);
});