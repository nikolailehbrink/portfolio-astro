import { getEntry } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import type { APIRoute } from "astro";
import { getPosts } from "@/lib/posts";

// TODO: Add the The rssSchema validator: https://github.com/withastro/astro/tree/main/packages/astro-rss#the-rssschema-validator
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const items = await Promise.all(
    posts.map(async ({ data, id }) => {
      const author = await getEntry(data.authors[0]);
      return {
        author: author.data.email,
        title: data.title,
        pubDate: data.publicationDate,
        description: data.description,
        categories: data.tags,
        commentsUrl: `/blog/${id}#comments`,
        link: `/blog/${id}`,
      };
    }),
  );
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: site ?? "",
    items,
  });
};
