const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'integration',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/integration/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/coverage/',
    '__tests__/(?!integration)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.integration.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth|jose|uuid|nanoid|@panva|preact-render-to-string|preact|oauth4webapi)/)',
  ],
}

module.exports = createJestConfig(customJestConfig)
