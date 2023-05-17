import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  clean: true,
  tsconfig: 'tsconfig.emit.json',
  dts: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  legacyOutput: true,
});
