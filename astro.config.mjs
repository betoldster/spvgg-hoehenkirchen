// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: 'middleware' }),
  integrations: [react(), keystatic()],
})
