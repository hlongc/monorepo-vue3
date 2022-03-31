import ts from "rollup-plugin-typescript2";
import resolvePlugin from "@rollup/plugin-node-resolve";
import path from "path";

const dirPath = path.resolve(__dirname, "packages");
const packagePath = path.resolve(dirPath, process.env.TARGET);

const resolve = (target) => path.resolve(packagePath, target);

// 引入package.json
const pkg = require(resolve("package.json"));
// 拿到当前package的打包配置
const buildOptions = pkg.buildOptions;

// 获取最后一级目录
const name = path.basename(packagePath);

// 每种格式输出不同的打包文件
const outputConfig = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};

const createConfig = (type, output) => {
  output.name = buildOptions.name; // iife打包，需要把打包结果挂载到全局对象上面，如window.VueReactivity
  output.sourcemap = true;
  return {
    input: resolve("src/index.ts"),
    output,
    plugins: [
      ts({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
        tsconfigOverride: {
          compilerOptions: {
            declaration: true, // 生成.d.ts文件
          },
        },
      }),
      resolvePlugin(),
    ],
  };
};

export default buildOptions.format.map((format) =>
  createConfig(format, outputConfig[format])
);
