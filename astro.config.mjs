// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://abhi.now',

  adapter: cloudflare({
      platformProxy: {
          enabled: true,
      },

      imageService: 'cloudflare',
	}),

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});