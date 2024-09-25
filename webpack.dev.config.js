const path = require('path');

const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev');

config.resolve.modules = [
  path.resolve(__dirname, './src'),
  'node_modules',
];

config.module.rules[0].exclude = /node_modules\/(?!(fastest-levenshtein|@edx))/;

module.exports = config;
