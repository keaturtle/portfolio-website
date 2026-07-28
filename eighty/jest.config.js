/**
 * App-level test config (data layer, templates). The engine keeps its own isolated
 * jest setup in engine/package.json with a 100% coverage gate — this config must
 * never absorb those tests or dilute that gate.
 *
 * Tests live in tests/ (outside src/) so the app's tsconfig / Metro bundle never
 * see them; ts-jest type-checks them with the inline config below.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^expo-sqlite$': '<rootDir>/tests/expoSqliteMock.ts',
    '^@engine$': '<rootDir>/engine/src/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          types: ['node', 'jest'],
          baseUrl: '.',
          paths: {
            '@engine': ['engine/src/index.ts'],
            '@/*': ['src/*'],
          },
        },
      },
    ],
  },
};
