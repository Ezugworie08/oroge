const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const { logDir } = require('../../src/config');
const { findSearchString, readLastNLines, traverseDir } = require('../../src/utils');

describe('findSearchString', () => {
    it('should find search string in log line', () => {
        const logLine = 'Error: Something went wrong';
        const searchString = 'Error';
        assert.strictEqual(findSearchString(logLine, searchString), true);
    });

    it('should not find search string in log line', () => {
        const logLine = 'Info: Process completed successfully';
        const searchString = 'Error';
        assert.strictEqual(findSearchString(logLine, searchString), false);
    });
});

describe('readLastNLines', () => {
    it('should read last N lines from a file', async () => {
        const filePath = path.join(`${logDir}`, 'hdfs_2k.log');
        const nLines = 2;
        const searchQuery = 'WARN';
        const lines = await readLastNLines({ filePath, nLines, searchQuery });
        assert.strictEqual(lines.length, nLines);
    });

    it('should handle non-existent file', async () => {
        const filePath = path.join(`${logDir}`, 'nonexistent.log');
        const nLines = 2;
        const searchQuery = 'Error';
        await assert.rejects(async () => {
            await readLastNLines({ filePath, nLines, searchQuery });
        }, /Provided file path does not exist/);
    });
});

describe('traverseDir', () => {
    it('should traverse a directory and return file paths', async () => {
        const rootDir = path.join(`${logDir}`);
        const results = await traverseDir(rootDir);
        const expectedFilePaths = [
            path.join(rootDir, 'hdfs_2k.log'),
            path.join(rootDir, 'hdfs_2k2.log')
        ];
        assert.deepStrictEqual(results.map(result => result), expectedFilePaths);
    });

    it('should handle non-existent directory', async () => {
        const rootDir = path.join(__dirname, '../test-files');
        await assert.rejects(async () => {
            await traverseDir(rootDir);
        }, /Provided directory path does not exist/);
    });
});