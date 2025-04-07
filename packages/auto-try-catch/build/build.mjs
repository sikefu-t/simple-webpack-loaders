import * as esbuild from 'esbuild'

await esbuild.build({
  bundle: true,
  entryPoints: ['src/index.js'],
  outfile: 'outfile.cjs',
  format: 'cjs',
  platform: 'node',
  target: 'node14',
  external: ['@babel/preset-typescript/package.json'], // 将路径标记为外部依赖
}).catch(() => process.exit(1));
