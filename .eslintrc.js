// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('eslint', {
  rules: {
    // Temporarily update the 'indent', 'template-curly-spacing' and
    // 'no-multiple-empty-lines' rules since they are causing eslint
    // to fail for no apparent reason since upgrading
    // @edx/frontend-build from v3 to v5:
    // - TypeError: Cannot read property 'range' of null
    indent: [
      'error',
      2,
      { ignoredNodes: ['TemplateLiteral', 'SwitchCase'] },
    ],
    'template-curly-spacing': 'off',
    'jsx-a11y/label-has-associated-control': ['error', {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: 'htmlFor',
      depth: 25,
    }],
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['sibling', 'parent'],
          'index',
        ],
        pathGroups: [
          {
            pattern: '@(react|react-dom|react-redux)',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'function-paren-newline': 'off',
    'no-import-assign': 'off',
    'react/no-unstable-nested-components': 'off',
  },
});
