import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    ignores: ['node_modules', '.next', 'build', 'dist', '.git', 'coverage']
  }
];

export default config;
