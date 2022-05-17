module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  setupFilesAfterEnv: ['<rootDir>/configs/setupAfterEnv.ts'],
};
