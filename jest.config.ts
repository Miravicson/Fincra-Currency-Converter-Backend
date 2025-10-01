import type { JestConfigWithTsJest } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import { pathsToModuleNameMapper } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(ts|js|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(ts|js|tsx)'],
  coverageDirectory: '../coverage',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};

export default jestConfig;
