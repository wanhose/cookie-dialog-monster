const { pathsToModuleNameMapper } = require('ts-jest');
const tsconfig = require('./tsconfig.json');

module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  setupFiles: ['jest-webextension-mock'],
  testRegex: '^.+\\.test.tsx?$',
  transform: {
    '\\.tsx?$': 'ts-jest',
  },
};
