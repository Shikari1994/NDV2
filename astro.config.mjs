import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

// site — заглушка домена; заменить на реальный перед публикацией
// (используется для canonical, OG и sitemap)
export default defineConfig({
  site: 'https://geotehnavigatsiya.ru',
  integrations: [react(), sitemap()],
  server: { host: true, port: 5173 },
})
