const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'unit',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/unit/**/*.test.{ts,tsx}',
    '**/__tests__/components/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/coverage/',
    '__tests__/integration',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth|jose|uuid|nanoid|@panva|preact-render-to-string|preact|oauth4webapi)/)',
  ],
}

module.exports = createJestConfig(customJestConfig)
