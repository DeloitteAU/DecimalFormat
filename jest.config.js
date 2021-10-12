module.exports = {
  roots: [
    "."
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/target/"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  globals: {
    'ts-jest': {
    }
  },
  moduleNameMapper: {
     '^@deloitte-digital-au/decimalformat/(.*)$': '<rootDir>/$1'
  }
}
