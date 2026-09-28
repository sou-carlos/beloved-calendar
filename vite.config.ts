import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      workbox: { globPatterns: ["**/*.{js,css,html,svg,woff,woff2}"] },
      manifest: {
        name: "Beloved · Aniversários e presentes",
        short_name: "Beloved",
        lang: "pt-BR",
        description: "Organize aniversários, preferências e presentes.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffe6aa",
        theme_color: "#a65a30",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
