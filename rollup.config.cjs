const typescript = require("@rollup/plugin-typescript");
const { optimizeLodashImports } = require("@optimize-lodash/rollup-plugin");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const packageJSON = require("./package.json");

const externalPackages = [
  ...Object.keys(packageJSON.dependencies || {}),
  ...Object.keys(packageJSON.peerDependencies || {}),
];

const regexesOfPackages = externalPackages.map(
  (packageName) => new RegExp(`^${packageName}(\/.*)?`)
);

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [typescript(), optimizeLodashImports(), resolve(), commonjs()],
    external: regexesOfPackages,
  },
];

module.exports = config;
