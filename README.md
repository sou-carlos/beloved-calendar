# Beloved Calendar

Beloved Calendar — PWA para registrar aniversários e ideias de presentes. MVP offline-first (IndexedDB), aparência inspirada no calendário de Stardew Valley.

Quick start

- Install dependencies: npm install
- Run dev server: npm run dev
- Build: npm run build
- Preview production build: npm run preview
- Run tests: npm run test

Project structure (high level)

- src/
  - main.tsx — app entry, router and SW registration
  - App.tsx — routes and layout
  - pages/ — CalendarPage, PeoplePage, PersonForm, GiftList
  - components/ — Calendar, PersonCard, styles (CSS Modules)
  - lib/db.ts — IndexedDB wrapper (idb)
  - models.ts — TypeScript models
- public/ — manifest, icons and public assets

Notes

- Offline persistence: uses IndexedDB (idb). No backend in MVP.
- PWA: configured with vite-plugin-pwa (service worker auto-update).

Development notes

- The app was scaffolded with Vite + React + TypeScript.
- Styling uses CSS Modules and theme CSS variables (Stardew-inspired palette).

Next steps

- Add/replace assets and icons with final artwork
- Implement notifications and export/import features
- (Optional) Add cloud sync/auth for multi-device sync
