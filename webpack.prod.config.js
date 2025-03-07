const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-prod');

config.module.rules[0].exclude = /node_modules\/(?!(fastest-levenshtein|@edx))/;

module.exports = config;
