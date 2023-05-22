import { defineConfig } from 'vitest/config'
import path from "path";

export default defineConfig({
  test: {
    include: ['test/**/*.{test,spec}.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov'],
      "100": true,
    },
  }
});
