const express = require('express');
const path = require('path');
const { logDir } = require('../config');
const { traverseDir } = require('../utils');


const logFilesRouter = express.Router();

logFilesRouter.get('/', async (req, res, next) => {
    console.log('Getting log files...');
    try {
        const logFiles = await traverseDir(logDir);
        const formattedLogFiles = logFiles
           .map(({filePath, fileURL, encodedFilePath}) => {
                const { base, dir } = path.parse(filePath);
                const baseDir = dir.split(logDir).pop();
                const qFilePath = path.join(baseDir, base);
                return { qFilePath, fileURL, encodedFilePath};
            })
           .sort((a, b) => a.qFilePath.localeCompare(b.qFilePath, 'en', {sensitivity: 'base'}));

        res.json({logFiles: formattedLogFiles});
    } catch (error){
        console.error('Error', error);
        next(error);
    }
});

module.exports = logFilesRouter;
