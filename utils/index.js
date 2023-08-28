const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const readline = require('readline');
const url = require('url');


const traverseDir = async (rootDir) => {
    const results = [];

    async function walk(currentDir) {
        try {
            const files = await fsp.readdir(currentDir);

            for (const file of files) {
                const filePath = path.join(currentDir, file);
                const stats = await fsp.stat(filePath);

                if (stats.isDirectory()) {
                    await walk(filePath); // Recurse into subdirectories
                } else if (stats.isFile()) {
                    const fileURL = new url.URL(`file://${filePath}`);
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
    const isValidSearchQuery = !!searchQuery && typeof searchQuery !== 'undefined' && searchQuery.length > 0;

    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath), 
            crlfDelay: Infinity
        });

        for await (const line of rl) {
    
            if (!isValidSearchQuery) {
                results.push(line);
            } else {
                const foundSearchString = String(line).includes(searchQuery);
                if (foundSearchString) {
                    results.push(line);
                }
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
    traverseDir,
    readLastNLines,
};
