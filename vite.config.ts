import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Beloved Calendar',
        short_name: 'BelovedCal',
        description: 'Track birthdays and gift ideas — inspired by Stardew Valley calendar aesthetics.',
        start_url: '.',
        display: 'standalone',
        background_color: '#f3efe6',
        theme_color: '#c38f6f',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ]
})
