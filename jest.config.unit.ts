import { JestConfigWithTsJest } from 'ts-jest';
import sharedConfig from './jest.config';

const jestUnitConfig: JestConfigWithTsJest = {
  ...sharedConfig,
  collectCoverageFrom: ['src/**/*.ts', '!*/node_modules/**'],
};

export default jestUnitConfig;
