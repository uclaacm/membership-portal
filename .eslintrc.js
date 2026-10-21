module.exports = {
  extends: 'airbnb/base',
  env: {
    jest: true,
  },
  parserOptions: {
    // Node 18 supports ES2022 syntax (e.g. ?? and ?.); airbnb defaults to ES2018.
    ecmaVersion: 2022,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
      },
    },
  },
  rules: {
    'no-plusplus': 'off',
    'func-names': 'off',
    'max-classes-per-file': 'off',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
  },
  overrides: [
    {
      // Run from the terminal or at container start; printing progress is their job.
      files: [
        'scripts/db-init.js',
        'scripts/seed-internship-test-data.js',
        'scripts/seed-officer-test-applications.js',
        'scripts/migrate-committees-to-db.js',
      ],
      rules: { 'no-console': 'off' },
    },
  ],
};
