import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/types.ts', 'test/**', 'vitest.config.ts'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 90,
        lines: 75,
      },
    },
    environment: 'node',
    include: ['test/**/*.test.ts'],
    restoreMocks: true,
  },
});
