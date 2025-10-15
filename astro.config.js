// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import db from "@astrojs/db";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://docs.astro.build/en/guides/markdown-content/#heading-ids-and-plugins
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import autolinkHeadings from "rehype-autolink-headings";

import {
  transformerMetaDiff,
  transformerMetaHighlight,
} from "./src/lib/shiki/transformerMeta";
import { transformerCodeBlock } from "./src/lib/shiki/transformerCodeBlock";

export default defineConfig({
  markdown: {
    rehypePlugins: [autolinkHeadings],
    shikiConfig: {
      theme: "dark-plus",
      transformers: [
        transformerMetaDiff(),
        transformerMetaHighlight(),
        transformerCodeBlock(),
      ],
    },
  },
  site: "https://portfolio-astro-jet-delta.vercel.app/",
  integrations: [
    mdx({
      rehypePlugins: [
        rehypeHeadingIds,
        () =>
          autolinkHeadings({
            behavior: "prepend",
            content: {
              type: "text",
              value: "#",
            },
            properties: {
              class: `not-prose px-1 transition-opacity select-none
              group-target:opacity-100 focus:opacity-100 max-sm:hidden
              sm:absolute sm:-translate-x-full sm:opacity-0
              sm:group-hover:opacity-100`,
            },
            headingProperties: { class: "group relative text-balance" },
          }),
      ],
      optimize: {
        ignoreElementNames: ["h1", "pre", "img"],
      },
    }),
    sitemap({
      changefreq: "weekly",
    }),
    react(),
    db(),
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
