module.exports = {
  extends: "airbnb",
  env: {
    jest: true,
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"]
      }
    }
  },
  rules: {
    "react/prefer-stateless-function": "off",
  }
};