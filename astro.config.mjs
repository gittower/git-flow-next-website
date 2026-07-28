// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  site: 'https://git-flow.sh',
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inria Sans',
      cssVariable: '--font-inria-sans',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [sitemap()],
});
