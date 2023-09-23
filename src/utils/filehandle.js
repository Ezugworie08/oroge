const { EOL} = require('os');
const { access, open, stat } = require('fs/promises');

const validateSearchQuery = (searchQuery) => !!searchQuery && typeof searchQuery !== 'undefined' && searchQuery.length > 0;

async function checkFilePathExists(filePath) {
    try {
        await access(filePath);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
  }

async function getFileStats(filePath) {
    try {
        return await stat(filePath);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function openFile(filePath) {
    try {
        return await open(filePath, 'r');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function closeFile(fileHandle) {
    try {
        await fileHandle.close();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function readChunk(fileHandle, position, bytesToRead) {
    try {
        const buffer = Buffer.alloc(bytesToRead);
        await fileHandle.read(buffer, 0, bytesToRead, position);
        return buffer;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

function extractLinesFromBuffer(buffer, searchString, isValidSearchString, partialLine) {

    let incompleteLine = partialLine;
    const lines = [];    
    const bufferString = buffer.toString();
    const combinedString = bufferString + incompleteLine;
    const relevantStringArray = combinedString.split(EOL);

    // The first element in relevantStringArray might be an incomplete line, so pop it
    incompleteLine = relevantStringArray.shift();

    for (const line of relevantStringArray) {
        if (!isValidSearchString || line.indexOf(searchString) > -1) {
            lines.unshift(line);
        }
    }

    return { lines, incompleteLine };
}

async function fileHandleReadLastNLines({filePath, nLines, searchQuery}) {

    if (!await checkFilePathExists(filePath)) {
        throw new Error("Provided file path does not exist");
    }

    const results = [];
    const isValidSearchQuery = validateSearchQuery(searchQuery);

    try {
        const fileStat = await getFileStats(filePath);
        const bufferSize = 1024;
        let position = fileStat.size;
        let incompleteLine = '';
        const fileHandle = await openFile(filePath);

        while (position > 0 && results.length < nLines) {
            const bytesToRead = Math.min(bufferSize, position);
            position -= bytesToRead;

            const buffer = await readChunk(fileHandle, position, bytesToRead);

            if (results.length >= nLines) {
                break;
            }

            const { 
                lines: chunkLines, 
                incompleteLine: chunkIncompleteLine 
            } = extractLinesFromBuffer(buffer, searchQuery, isValidSearchQuery, incompleteLine); //  pass the incomplete line into the extract function

            incompleteLine = chunkIncompleteLine;

            results.push(...chunkLines);
        }

        await closeFile(fileHandle);

        return results;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {fileHandleReadLastNLines};

