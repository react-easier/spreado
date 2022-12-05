const testPath = process.env.JEST_TEST_PATH;

module.exports = {
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'].map((p) => {
    if (testPath) {
      p = `<rootDir>/${testPath}/${p}`;
    }
    return p;
  }),
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
  setupFilesAfterEnv: ['<rootDir>/additional-configs/setupAfterEnv.ts'],
};
