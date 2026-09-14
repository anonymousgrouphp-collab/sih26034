import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

export default defineConfig(() => {
  const isHttps = process.env.HTTPS === 'true' || process.argv.includes('--https');
  return {
    root: path.resolve(__dirname),
    plugins: [
      react(),
      ...(isHttps ? [basicSsl()] : []),
    ],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
