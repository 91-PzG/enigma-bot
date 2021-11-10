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
  globals: {
    __port: 3333,
    __eventOrga:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJldmVudE9yZ2EiLCJ1c2VybmFtZSI6IkV2ZW50T3JnYSIsInJvbGVzIjpbIm1lbWJlciIsImV2ZW50b3JnYSJdLCJpYXQiOjE2MTQyNzEzNjcsImV4cCI6MTYxNDMwNzM2N30.y8szlwyo8LF-LpfR1bN7Qp86bVNc3i43BAEK6Y27d2E',
    __clanrat:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbGFucmF0IiwidXNlcm5hbWUiOiJDbGFucmF0Iiwicm9sZXMiOlsibWVtYmVyIiwiY2xhbnJhdCJdLCJpYXQiOjE2MTQyNzEzOTMsImV4cCI6MTYxNDMwNzM5M30.YVRx85vQLydgp5mtWtqM7gi1Ut-fJHRK3weKGZwj6Vk',
    __hr: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJodW1hblJlc291cmNlcyIsInVzZXJuYW1lIjoiSHVtYW5SZXNvdXJjZXMiLCJyb2xlcyI6WyJtZW1iZXIiLCJociJdLCJpYXQiOjE2MTQyNzE0NDUsImV4cCI6MTYxNDMwNzQ0NX0.IUbayeFgsr2OkHmAHCL3YzDhOwKirX4wt4x8sidf3u8',
    __signIn:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzaWduSW4iLCJ1c2VybmFtZSI6IlNpZ25JbiIsInJvbGVzIjpbIm1lbWJlciJdLCJpYXQiOjE2MTQyODYwNDAsImV4cCI6MTYxNDMyMjA0MH0.HvCN2g3sZU3bHKz00sWFOvqBhYU6WKJ92JtfsLHF3g8',
  },
};
export default config;
