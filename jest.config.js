module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  setupFilesAfterEnv: ['<rootDir>/configs/setupAfterEnv.ts'],
};
