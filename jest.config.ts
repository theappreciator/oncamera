/** @type {import('ts-jest').JestConfigWithTsJest} */
import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules'
  ],
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '<rootDir>/packages/**/src/**/*.ts',
    '<rootDir>/packages/**/source/**/*.ts'
  ],
  coverageReporters: [
    'json', 'lcov', 'html', 'text', 'text-summary'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/common/source/mocks',
    '<rootDir>/packages/watcher-cli/source/index.ts'
  ],
  projects: [
    {
      displayName: 'common',
      testEnvironment: 'node',
      transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
      testMatch: [
        '<rootDir>/packages/common/tests/**/*.test.ts',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/packages/common/dist',
        '<rootDir>/packages/common/source/mocks'
      ],
      coveragePathIgnorePatterns: [
        '<rootDir>/packages/common/source/mocks'
      ]
    },
    {
      displayName: 'watcher-cli',
      testEnvironment: 'node',
      transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
      testMatch: [
        '<rootDir>/packages/watcher-cli/tests/**/*.test.ts',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/packages/watcher-cli/dist',
        '<rootDir>/packages/watcher-cli/source/index.ts'
      ],
      coveragePathIgnorePatterns: [
        '<rootDir>/packages/watcher-cli/source/index.ts'
      ]
    },
    {
      displayName: 'status-api',
      testEnvironment: 'node',
      transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
      testMatch: [
        '<rootDir>/packages/status-api/tests/**/*.test.ts',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/packages/status-api/dist'
      ],
    }
  ]
}

export default config;