// jest.config.js
const nextJest = require('next/jest')

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' })

// Any custom config you want to pass to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // <---- SETUP FILE

  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  testEnvironment: 'jest-environment-jsdom', // <---- Use JSDOM environment for DOM testing

  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured by nextJest)
    // Example: if you have "@/(.*)": "<rootDir>/src/$1" in tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts", // Exclude type definition files
    "!src/**/index.{js,jsx,ts,tsx}", // Often barrel files, can be excluded if desired
    "!src/app/layout.tsx", // Often minimal logic, can be excluded
    "!src/app/api/**", // API routes, if any, might be tested differently
    // Exclude other files not requiring unit/integration tests if necessary
    "!src/contexts/AuthContext.tsx", // Will be mocked heavily, direct testing might be tricky with localStorage/jwt-decode
    "!src/hoc/withAuth.tsx", // Similar to AuthContext
    "!src/services/api.ts", // Will be mocked for UI tests
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["json", "lcov", "text", "clover", "html"],

  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
