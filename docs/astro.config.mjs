import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://react.semantic-ui.com',
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        'semantic-ui-react': '../../src/index.ts',
      },
    },
  },
  output: 'static',
})
