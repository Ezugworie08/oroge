const express = require('express');
const { logDir } = require('../config');
const { traverseDir, readLastNLines } = require('../utils');

const logFileRouter = express.Router();

logFileRouter.get('/', async (req, res, next) => {
    try {
        const decodedFilePath = decodeURIComponent(req.query.filepath);
        const searchQuery =!!req.query.q? decodeURIComponent(req.query.q) : '';
        const limit = req.query.limit? req.query.limit : 10;

        const logFilesPaths = await traverseDir(logDir);
        const isValidFilePath = logFilesPaths.some(({ filePath }) => filePath === decodedFilePath); // check if the file exists in the logs directory

        if (!isValidFilePath) {
            console.error(`Log file ${decodeFilePath} not found`);
            res.status(404).json({error: 'Log file not found'});
            return;
        }

        const lines = await readLastNLines({
            filePath: decodedFilePath, 
            nLines: limit, 
            searchQuery
        });
        
        res.json({lines});
    } catch (error){
        console.error('Error', error);
        next(error);
    }
});

module.exports = logFileRouter;
