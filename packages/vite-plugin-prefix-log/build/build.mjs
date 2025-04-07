import * as esbuild from 'esbuild'
// 定义构建配置
const buildOptions = [
  {
    format: 'esm',
    outfile: 'dist/index.esm.js'
  },
  {
    format: 'cjs',
    outfile: 'dist/index.cjs.js'
  },
];


// 使用 Promise.all 并行执行所有构建任务
Promise.all(buildOptions.map(options =>
  esbuild.build({
    entryPoints: ['src/index.js'], // 入口文件
    // bundle: true,
    platform: 'node',
    minify: true, // 如果需要，可以启用代码压缩
    // external: ['@babel/preset-typescript/package.json'], // 将路径标记为外部依赖
    ...options
  })
)).catch(() => process.exit(1));
