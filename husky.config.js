module.exports = {
  hooks: {
    'pre-commit': 'echo "Running pre-commit checks. If your commit fails, check for lint errors, test failures, or dependency warnings below." && lint-staged -c lint-staged.json',
  },
};
