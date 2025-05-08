// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  site: 'https://git-flow.sh',
  integrations: [sitemap()],
});
