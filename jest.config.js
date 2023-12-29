const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/index.jsx',
    'MainApp.jsx',
  ],
  testEnvironment: 'jsdom',
});
