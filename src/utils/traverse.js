const fs = require('fs').promises;
const path = require('path');

// Function to check if a directory exists
const dirExists = async (dirPath) => {
    try {
        const stats = await fs.lstat(dirPath);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
};

// Function to traverse a directory recursively
const recursiveDirectoryTraversal = async (rootDir, followSymlinks = false) => {
    const results = [];

    if (!await dirExists(rootDir)) {
        throw new Error("Provided directory path does not exist");
    }

    // Function to process a directory and its contents
    async function walk(currentDir) {
        try {
            const files = await fs.readdir(currentDir);

            for (const file of files) {
                const filePath = path.join(currentDir, file);

                try {
                    const stats = await fs.lstat(filePath);

                    if (stats.isDirectory()) {
                        await walk(filePath); // Recurse into subdirectories
                    } else {
                        if (followSymlinks && stats.isSymbolicLink()) {
                            await processSymbolicLink(filePath);
                        }
                        if (stats.isFile()) {
                            results.push(filePath);
                        }
                    }
                } catch (error) {
                    console.error("Error reading file/directory:", filePath, error);
                }
            }
        } catch (error) {
            console.error("Error walking the provided directory:", error);
            throw new Error(error.message || "Error walking the provided directory");
        }
    }

    // Function to process a symbolic link
    async function processSymbolicLink(filePath) {
        const targetPath = await fs.readlink(filePath);
        const absoluteTargetPath = path.isAbsolute(targetPath)
            ? targetPath
            : path.resolve(path.dirname(filePath), targetPath);
        await walk(absoluteTargetPath);
    }

    await walk(rootDir);
    return results;
};


// Function for iterative directory traversal
const iterativeDirectoryTraversal = async (rootDir, followSymlinks = false) => {
    const results = [];
    const stack = [rootDir];

    async function manageSymbolicLinks(filePath) {
        const targetPath = await fs.readlink(filePath);
        const absoluteTargetPath = path.isAbsolute(targetPath)
            ? targetPath
            : path.resolve(path.dirname(filePath), targetPath);
        return absoluteTargetPath;
    }

    while (stack.length > 0) {
        const currentDir = stack.pop();

        try {
            const files = await fs.readdir(currentDir);

            for (const file of files) {
                const filePath = path.join(currentDir, file);

                try {
                    const stats = await fs.lstat(filePath);

                if (stats.isDirectory()) {
                    // Check if the directory can be read or skip this directory if it's restricted
                    try {
                        await fs.readdir(filePath);
                        stack.push(filePath); // Push subdirectories onto the stack
                    } catch (dirError) {
                        console.error("Error reading directory:", filePath, dirError);
                    }
                } else {
                    if (followSymlinks && stats.isSymbolicLink()) {
                        const targetPath = await manageSymbolicLinks(filePath);
                        stack.push(targetPath); // Push the target path onto the stack
                    } else if (stats.isFile()) {
                        results.push(filePath);
                    }
                }
                } catch (error) {
                    console.error("Error reading file/directory:", filePath, error);
                }
            }
        } catch (error) {
            console.error("Error reading directory:", currentDir, error);
        }
    }

    return results;
};


module.exports = {
    recursiveDirectoryTraversal, 
    iterativeDirectoryTraversal
};
