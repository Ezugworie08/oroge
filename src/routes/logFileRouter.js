const express = require('express');
const { logDir } = require('../config');
const { isPathWithinDirectory, readLastNLines } = require('../utils');
const { fileHandleReadLastNLines } = require('../utils/filehandle');

const logFileRouter = express.Router();

logFileRouter.get('/', async (req, res, next) => {
    try {
        const decodedFilePath = decodeURIComponent(req.query.filepath);
        const searchQuery =!!req.query.q? decodeURIComponent(req.query.q) : '';
        const limit = req.query.limit? req.query.limit : 100;

        const isValidFilePath = await isPathWithinDirectory(decodedFilePath, logDir);
   
        if (!isValidFilePath) {
            console.error(`Log file ${decodedFilePath} not found`);
            throw new Error(`Provided Log file is INVALID`);
        }

        const lines = await fileHandleReadLastNLines({
            filePath: decodedFilePath, 
            nLines: limit, 
            searchQuery
        });
        
        res.status(200).json({lines});
    } catch (error){
        console.error('Log File Router Error ->', error.message);
        next(error);
    }
});

module.exports = logFileRouter;
