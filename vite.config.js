import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'

// Commit count as a build number — increments by 1 on every commit with zero
// manual bumping, so the nav badge (see VersionBadge.jsx) always shows which
// build is actually deployed. Falls back to '0' wherever there's no git repo
// (e.g. some CI checkouts).
function getBuildNumber() {
  try {
    return execSync('git rev-list --count HEAD').toString().trim()
  } catch {
    return '0'
  }
}

export default defineConfig({
  define: {
    __BUILD_NUMBER__: JSON.stringify(getBuildNumber()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register the service worker ourselves in main.jsx (with a
      // periodic update check), instead of the auto-injected script — see
      // the comment there for why: browsers only check for SW updates on
      // navigation, throttled to roughly once/day, so without an explicit
      // poll, an open tab (or one reopened the same day) can keep running
      // code from days-old deploys indefinitely.
      injectRegister: false,
      // Disabled in dev: a service worker here was the source of "my changes
      // aren't showing up" while programming — it caches the module graph
      // independently of Vite's own HMR. main.jsx actively unregisters any
      // leftover dev SW from before this change. Re-enable temporarily only
      // if you specifically need to test offline/PWA behavior locally
      // (prefer `vite build && vite preview` for that instead).
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', '*.glb', 'audio/**/*'],
      manifest: {
        name: 'Oliver Academy',
        short_name: 'Oliver',
        description: 'Plataforma educativa inmersiva con mundo VR',
        theme_color: '#7c3aed',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // VRPage chunk is ~2.4 MB — raise limit to cover it
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Precache all JS/CSS chunks (app shell)
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        // Belt-and-suspenders: explicitly delete any precache from a
        // previous deploy once the new service worker activates, instead of
        // relying on the plugin's default. The other half of "never see a
        // stale build again" is the Cache-Control headers in
        // public/.htaccess — without those, the browser may not even fetch
        // this new sw.js to begin with.
        cleanupOutdatedCaches: true,
        // Runtime caching rules
        runtimeCaching: [
          {
            // 3D models — cache first, they never change once deployed
            urlPattern: /\.glb$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'models-v1',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Audio files — cache first
            urlPattern: /\.(mp3|ogg|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-v1',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Images — stale while revalidate
            urlPattern: /\.(png|jpg|jpeg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'images-v1' },
          },
          {
            // Supabase API — network first, fall back to cache for offline reads
            urlPattern: /supabase\.co/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-v1',
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Google Fonts
            urlPattern: /fonts\.(googleapis|gstatic)\.com/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-v1',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
