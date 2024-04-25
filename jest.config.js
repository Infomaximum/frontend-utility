/**
 * @type {import("jest").Config}
 */
module.exports = {
  setupFilesAfterEnv: ["jest-canvas-mock"],
  testEnvironment: "jest-environment-jsdom-global",
  moduleDirectories: ["node_modules", "src"],
};
