import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // Integration tests drive userEvent typing inside jsdom; under parallel file
    // execution the default 5s budget is too tight and causes spurious timeouts.
    testTimeout: 15000,
  },
})
