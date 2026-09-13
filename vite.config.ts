import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  /* El sitio se publica en https://ebarrera2019263.github.io/agrologico/,
     así que los recursos cuelgan de /agrologico/ y no de la raíz.
     Si algún día se mueve a un dominio propio, esto vuelve a '/'. */
  base: '/agrologico/',

  server: {
    // Permite servir a través del túnel temporal de Cloudflare.
    allowedHosts: ['.trycloudflare.com'],
  },
})
