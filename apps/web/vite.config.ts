import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const publicBasePath = process.env.VITE_PUBLIC_BASE_PATH ?? '/';
const base = publicBasePath.endsWith('/') ? publicBasePath : `${publicBasePath}/`;

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
