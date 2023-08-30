const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const readline = require('readline');
const {URL} = require('url');


const validateSearchQuery = (searchQuery) => !!searchQuery && typeof searchQuery !== 'undefined' && searchQuery.length > 0;
const findSearchString = (logLine, searchString) => validateSearchQuery(searchString) && String(logLine).indexOf(String(searchString)) > -1;
const isValidFile = (filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile();
const isValidDirectoryPath = (dirPath) => fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();

const traverseDir = async (rootDir) => {
    const results = [];

    if (!isValidDirectoryPath(rootDir)) {
        throw new Error("Provided directory path does not exist");
    }

    async function walk(currentDir) {
        try {
            const files = await fsp.readdir(currentDir);

            for (const file of files) {
                const filePath = path.join(currentDir, file);
                const stats = await fsp.stat(filePath);

                if (stats.isDirectory()) {
                    await walk(filePath); // Recurse into subdirectories
                } else if (stats.isFile()) {
                    const fileURL = new URL(`file://${filePath}`);
                    const encodedFilePath = encodeURIComponent(filePath);
                    results.push({filePath, fileURL, encodedFilePath});
                }
            }

        } catch (err) {
            console.error("Error walking the provided directory:", err);
            throw new Error(err.message || "Error walking the provided directory");
        }
    };

    try {
        await walk(rootDir);
        return results;
    } catch (err) {
        console.error("Error listing files in provided directory:", err);
        throw new Error(err.message || "Error listing files in provided directory");
    }
};

const readLastNLines = async ({filePath, nLines, searchQuery}) => {
    const results = [];
    const isValidSearchQuery = validateSearchQuery(searchQuery);
 
    if (!isValidFile(filePath)) {
        throw new Error("Provided file path does not exist");
    }

    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath), 
            crlfDelay: Infinity
        });

        for await (const line of rl) {

            if (isValidSearchQuery) {
                const foundSearchString = findSearchString(line, searchQuery);

                if (foundSearchString) {
                    results.push(line);
                } 
            } else {
                results.push(line);
            } 

            if (results.length > nLines) {
                results.shift();
            }
        }

        return results;
    } catch (err) {
        console.error("Error reading log file:", err);
        throw new Error(err.message || "Error reading log file");
    }
};


module.exports = {
    findSearchString, 
    isValidFile, 
    isValidDirectoryPath,
    readLastNLines, 
    traverseDir,
};
