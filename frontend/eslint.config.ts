import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "AssignmentExpression[left.type='MemberExpression'][left.property.name='defaultProps']",
        message: 'React 19 ignores defaultProps on function components. Use default parameters, or `static defaultProps` in a class.',
      }],
      // A `= []` / `= {}` default is a new object every render; hoist it to a module constant.
      'react/no-object-type-as-default-prop': 'error',
    },
  },
  {
    ignores: ['node_modules', '.next', 'build', 'dist', '.git', 'coverage']
  }
];

export default config;
