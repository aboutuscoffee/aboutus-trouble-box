import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/aboutus-trouble-box/',
  server: { port: 5183 },
});
