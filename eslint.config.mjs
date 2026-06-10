import next from 'eslint-config-next';

const nextConfig = [...next, {
  ignores: ['.next/**', 'node_modules/**'],
}];

export default nextConfig;
