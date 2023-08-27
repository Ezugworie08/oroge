const fs = require('fs').promises;
const path = require('path');

const listFiles = async (rootDir) => {
    const results = [];

    async function walk(currentDir) {
        try {
            const files = await fs.readdir(currentDir);

            console.log(`Found ${files.length} files in directory ${currentDir}`);

            for (const file of files) {
                const filePath = path.join(currentDir, file);
                const stats = await fs.stat(filePath);

                if (stats.isDirectory()) {
                    await walk(filePath); // Recurse into subdirectories
                } else if (stats.isFile()) {
                    const { base, dir } = path.parse(filePath);
                    const baseDir = dir.split(rootDir).pop();
                    const qFilePath = path.join(baseDir, base);
                    results.push(qFilePath);
                }
            }

        } catch (err) {
            console.log("Error walking the logs directory:", err);
            return err.message;
        }
    };

    try {
        await walk(rootDir);
        return results;
    } catch (err) {
        console.log("Error reading log files:", err);
        return err.message;
    }
};

module.exports = {
    listFiles
};
