import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: '/alloy/' for production builds (GitHub Pages serves at /<repo>/), '/' for local
// dev so `npm run dev` stays at http://localhost:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/alloy/' : '/',
  plugins: [react()],
}))
