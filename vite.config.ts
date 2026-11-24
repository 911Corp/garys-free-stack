import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base './' keeps assets relative: works on GitHub Pages project URLs and locally.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { chunkSizeWarningLimit: 700, outDir: mode === 'single' ? 'dist-single' : 'dist' },
  test: { environment: 'node' },
}));
