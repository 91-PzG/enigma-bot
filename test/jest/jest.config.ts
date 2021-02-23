// jest.config.ts
import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testTimeout: 10000,
  globalSetup: './jest/setup.ts',
  globalTeardown: './jest/teardown.ts',
  testRunner: 'jest-circus/runner',
  maxWorkers: 1,
  globals: {
    __port: 3333,
  },
};
export default config;
