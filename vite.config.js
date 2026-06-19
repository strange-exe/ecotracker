/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    headers: {
      // Security: Content Security Policy — prevents XSS / clickjacking in dev
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +  // Vite HMR requires inline in dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob:; " +
        "connect-src 'self' ws: wss:;",           // WebSocket for HMR
      // Security: Prevent MIME-sniffing
      'X-Content-Type-Options': 'nosniff',
      // Security: Prevent clickjacking
      'X-Frame-Options': 'DENY',
      // Security: Disable referrer leakage
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    coverage: {
      reporter: ['text', 'html'],
      include: [
        // Domain and services are the critical testable layers
        'src/domain/**/*.js',
        'src/services/**/*.js',
        // Keep utils coverage too for tiltHandlers
        'src/utils/**/*.js'
      ],
      exclude: ['src/__tests__/**']
    }
  }
})
