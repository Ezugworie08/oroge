const express = require('express');
const path = require('path');
const { logDir } = require('../config');
const { traverseDir } = require('../utils');


const logFilesRouter = express.Router();

logFilesRouter.get('/', async (req, res, next) => {
    try {
        const logFiles = await traverseDir(logDir);
        const formattedLogFiles = logFiles
           .map((filePath) => {
                const encodedFilePath = encodeURIComponent(filePath);
                const { base, dir } = path.parse(filePath);
                const baseDir = dir.split(logDir).pop();
                const relativeFilePath = path.join(baseDir, base);
                return { 
                    relativeFilePath, 
                    encodedFilePath
                };
            })
           .sort((a, b) => a.relativeFilePath.localeCompare(b.relativeFilePath, 'en', {sensitivity: 'base'}));

        res.status(200).json({logFiles: formattedLogFiles});
    } catch (error){
        console.error('Log Files Router Error ->', error);
        next(error);
    }
});

module.exports = logFilesRouter;
