// config.js
const path = require('path');
const { ROOT_DIR } = require('./utils/constants');

module.exports = {
    logDir: path.resolve(__dirname, ROOT_DIR)
};
