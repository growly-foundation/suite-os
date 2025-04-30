import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindpostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), libInjectCss(), tsconfigPaths(), dts({ include: ['lib'] })],
  css: {
    postcss: {
      plugins: [tailwindpostcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      name: '@growly/widget',
      entry: resolve(__dirname, '@/main.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwindcss'],
      input: Object.fromEntries(
        // https://rollupjs.org/configuration-options/#input
        glob
          .sync('@/**/*.{ts,tsx}', {
            ignore: ['@/**/*.d.ts'],
          })
          .map(file => [
            // 1. The name of the entry point
            // lib/nested/foo.js becomes nested/foo
            relative('lib', file.slice(0, file.length - extname(file).length)),
            // 2. The absolute path to the entry file
            // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
            fileURLToPath(new URL(file, import.meta.url)),
          ])
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
});
