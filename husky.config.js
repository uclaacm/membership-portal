module.exports = {
  hooks: {
    "pre-commit": "lint-staged -c lint-staged.json",
  }
}