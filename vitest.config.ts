import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
        perFile: true,
      },
    },
  },
})
