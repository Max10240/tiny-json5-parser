import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'es6',
  splitting: false,
  clean: true,
  tsconfig: 'tsconfig.emit.json',
  dts: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
});
