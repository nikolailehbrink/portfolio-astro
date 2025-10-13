import { db, ViewCount } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(ViewCount).values([
    {
      pathname: "/blog/syntax-highlighting-shiki-next-js",
      views: 29,
    },
    {
      pathname: "/blog/tailwindcss-v3-tips",
      views: 1234,
    },
    {
      pathname: "/blog/tailwindcss-v4-tips",
      views: 123,
    },
    {
      pathname: "/blog/realistic-button-design-css",
      views: 456,
    },
    {
      pathname: "/blog/robots-txt-react-router-7",
      views: 789,
    },
    {
      pathname: "/blog/sitemap-react-router-7",
      views: 1011,
    },
    {
      pathname: "/blog/fonts-remix-react-router-7",
      views: 1213,
    },
    {
      pathname: "/blog/batch-mails-deno-postmark",
      views: 1415,
    },
    {
      pathname: "/blog/enhance-mdx-typescript",
      views: 1617,
    },
  ]);
}
