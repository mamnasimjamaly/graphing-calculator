import { cpSync, existsSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        if (existsSync('images')) {
          cpSync('images', 'dist/images', { recursive: true });
        }
        if (existsSync('graph.png')) {
          cpSync('graph.png', 'dist/graph.png');
        }
      },
    },
  ],
});
