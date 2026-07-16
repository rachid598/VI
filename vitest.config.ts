import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Config de test isolée (ne charge pas les plugins Tailwind/PWA).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
