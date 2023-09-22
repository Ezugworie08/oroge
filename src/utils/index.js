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
        fs.accessSync(logDirPath, fs.constants.R_OK);
        return true;
    } catch (error) {
        console.error("Error accessing log directory:", error);
        return false;
    }
};

const isPathWithinDirectory = async (inputPath, targetDirectory) => {
    try {
        const absoluteInputPath = path.resolve(inputPath);
        const absoluteTargetDirectory = path.resolve(targetDirectory);
    
        try {
            await fsp.access(absoluteInputPath); // Check if input path exists
            return absoluteInputPath.startsWith(absoluteTargetDirectory);
        } catch (error) {
            throw new Error('An error occurred while accessing the file system.');
        }
    } catch (error) {
        console.error(error.message);
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

                try {

                    const stats = await fsp.stat(filePath);

                    if (stats.isDirectory()) {
                        await walk(filePath); // Recurse into subdirectories
                    } else if (stats.isFile()) {
                        results.push(filePath);
                    }
                } catch (error) {
                    console.error("Error reading file/directory:", filePath, error);
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
    if (!fileExists(filePath)) {
        throw new Error("Provided file path does not exist");
    }

    const results = [];
    const isValidSearchQuery = validateSearchQuery(searchQuery);
 
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath), 
            crlfDelay: Infinity
        });

        let processingLine = false;
    
        rl.on('line', async (line) => {
            if (processingLine) {
                await new Promise((resolve) => rl.once('pause', resolve));
            }

            processingLine = true;

            if (!isValidSearchQuery || findSearchString(line, searchQuery)) {
                results.push(line);

                if (results.length > nLines) {
                    results.shift();
                }
            }

            processingLine = false;
            rl.resume();
        });

        await new Promise((resolve) => {
            rl.on('close', resolve);
        });

        return results.reverse();
    } catch (error) {
        console.error("Error reading provided log file:", error);
        throw new Error(err.message || "Error reading provided log file");
    }
};


module.exports = {
    findSearchString,
    hasLogDirReadAccess,
    isPathWithinDirectory,
    readLastNLines, 
    traverseDir,
};
