module.exports = {
  extends: 'airbnb/base',
  env: {
    jest: true,
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
  },
};
