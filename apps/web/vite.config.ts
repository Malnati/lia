import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const publicBasePath = process.env.VITE_PUBLIC_BASE_PATH ?? '/';
const base = publicBasePath.endsWith('/') ? publicBasePath : `${publicBasePath}/`;
const navigateFallback = `${base}index.html`.replace('//', '/');

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Lia — Moldes para Prótese Dentária',
        short_name: 'Lia',
        description:
          'PWA offline-first para pedidos, retirada, entrega e pagamento de moldes para prótese dentária.',
        theme_color: '#087f83',
        background_color: '#ffffff',
        display: 'standalone',
        scope: base,
        start_url: base,
        icons: [
          {
            src: 'icon.svg',
            sizes: '64x64 192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback,
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lia-pages',
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ]
});
