import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// site/base управляются env, чтобы один репозиторий собирался и под реальный
// домен (корень), и под GitHub Pages (под-путь /NDV2/).
// Локально и для прод-домена: base='/'. Для Pages CI задаёт BASE_PATH=/NDV2.
export default defineConfig({
  site: process.env.SITE || 'https://geotehnavigatsiya.ru',
  base: process.env.BASE_PATH || '/',
  integrations: [sitemap()],
  server: { host: true, port: 5173 },
})
