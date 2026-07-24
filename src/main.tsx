import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './style.css'

// PWA: register service worker (vite-plugin-pwa injects register helper)
import { registerSW } from 'virtual:pwa-register'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Register service worker with auto-update
const updateSW = registerSW({
  onRegistered(r) {
    // r is the registration
  },
  onNeedRefresh() {
    // app has new content available
  }
})
