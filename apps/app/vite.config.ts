import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tsconfigPaths()],
  chunkSizeWarningLimit: false,
  optimizeDeps: {
    exclude: ['node_modules'],
  },
}));
