// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: (process.env.VERCEL_PROJECT_PRODUCTION_URL ??=
    "https://www.nikolailehbr.ink"),
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Local preview doesnt work with Vercel adapter, but with Node
  adapter: process.env.VERCEL
    ? vercel()
    : node({
        mode: "standalone",
      }),
});
