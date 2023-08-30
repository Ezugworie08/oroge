// config.js
const path = require('path');
const { hasLogDirReadAccess } = require('./utils');
const { WINDOWS_ROOT_DIR, UNIX_ROOT_DIR, TEST_ROOT_DIR } = require('./utils/constants');

const ROOT_DIR = process.platform === 'win32' ? path.resolve(__dirname, WINDOWS_ROOT_DIR) : path.resolve(__dirname, UNIX_ROOT_DIR)
const logDir = hasLogDirReadAccess(ROOT_DIR) ? ROOT_DIR : path.resolve(__dirname, TEST_ROOT_DIR)

module.exports = {
    logDir,
};
