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
  },
};
