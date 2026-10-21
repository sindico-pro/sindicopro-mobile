/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  watchman: false,
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*-test.ts', '**/*-test.tsx'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation)',
  ],
}
