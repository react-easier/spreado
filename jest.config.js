module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', `<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)`],
  setupFilesAfterEnv: ['<rootDir>/configs/setupAfterEnv.ts'],
};
