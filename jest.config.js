const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/legacy/i18n',
    'src/redesign/i18n',
    'src/index.jsx',
    'src/legacy/index.jsx',
    'src/redesign/index.jsx',
  ],
});
