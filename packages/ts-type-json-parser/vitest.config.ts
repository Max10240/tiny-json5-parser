import { defineConfig } from 'vitest/config'
import path from "path";

export default defineConfig({
  test: {
    include: ['test/**/*.{test,spec}.ts'],
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
