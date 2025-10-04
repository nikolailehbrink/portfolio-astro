// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";

import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
} from "@shikijs/transformers";
import { transformerMetaDiff } from "./src/lib/shiki/transformerMetaDiff";
import { transformerCodeBlock } from "./src/lib/shiki/transformerCodeBlock";

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "dark-plus",
      },
      transformers: [
        transformerMetaHighlight(),
        transformerMetaWordHighlight(),
        transformerMetaDiff(),
        transformerCodeBlock(),
      ],
    },
  },
  site: "https://portfolio-astro-jet-delta.vercel.app/",
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    open: true,
    host: true,
  },
  // Local preview doesnt work with Vercel adapter, but with Node
  adapter: process.env.VERCEL
    ? vercel({
        imageService: true,
        skewProtection: true,
      })
    : node({
        mode: "standalone",
      }),
});
