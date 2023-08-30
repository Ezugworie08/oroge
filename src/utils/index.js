const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const readline = require('readline');


const validateSearchQuery = (searchQuery) => !!searchQuery && typeof searchQuery !== 'undefined' && searchQuery.length > 0;
const findSearchString = (logLine, searchString) => validateSearchQuery(searchString) && String(logLine).indexOf(String(searchString)) > -1;
const fileExists = (filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile();
const dirExists = (dirPath) => fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();

const hasLogDirReadAccess = (logDirPath) => {
    try {
        return fs.accessSync(logDirPath, fs.constants.R_OK);
    } catch (error) {
        console.error("Error accessing log directory:", error);
        return false;
    }
};

const traverseDir = async (rootDir) => {
    const results = [];

    if (!dirExists(rootDir)) {
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
                    results.push(filePath);
                }
            }

        } catch (error) {
            console.error("Error walking the provided directory:", error);
            throw new Error(error.message || "Error walking the provided directory");
        }
    };

    await walk(rootDir);
    return results;    
};

const readLastNLines = async ({filePath, nLines, searchQuery}) => {
    const results = [];
    const isValidSearchQuery = validateSearchQuery(searchQuery);
 
    if (!fileExists(filePath)) {
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
    } catch (error) {
        console.error("Error reading provided log file:", error);
        throw new Error(err.message || "Error reading provided log file");
    }
};


module.exports = {
    hasLogDirReadAccess,
    findSearchString, 
    readLastNLines, 
    traverseDir,
};
