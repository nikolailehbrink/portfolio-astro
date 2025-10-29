import { getCollection } from "astro:content";
import { slugify } from "./utils";
import type { MarkdownHeading } from "astro";
import { estimateReadingTime } from "./readingTime";

// Type for blog posts with reading time
type BlogPost = {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: {
    title: string;
    description: string;
    draft?: boolean;
    publicationDate: Date;
    modificationDate?: Date;
    tags?: Array<string>;
    authors?: Array<string>;
  };
  readingTime: number;
};

// Cache for processed posts to avoid reprocessing
let postsCache: Array<BlogPost> | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function getPosts(options?: {
  take?: number;
  tag?: string | null;
}) {
  const now = Date.now();
  
  // Use cached posts if available and not expired (except in development)
  if (postsCache && import.meta.env.PROD && (now - lastCacheTime) < CACHE_DURATION) {
    return filterAndSortPosts(postsCache, options);
  }

  const posts = (
    await getCollection("blog", ({ data }) =>
      import.meta.env.PROD ? data.draft !== true : true,
    )
  ).map((post) => ({
    ...post,
    readingTime: estimateReadingTime(post.body),
  }));

  // Cache the processed posts in production
  if (import.meta.env.PROD) {
    postsCache = posts;
    lastCacheTime = now;
  }

  return filterAndSortPosts(posts, options);
}

function filterAndSortPosts(posts: Array<BlogPost>, options?: {
  take?: number;
  tag?: string | null;
}) {
  const { tag, take } = options || {};

  // Start with original array reference for efficiency
  let filteredPosts = posts;

  // Only filter if tag is specified
  if (tag) {
    filteredPosts = posts.filter((post) => post.data.tags?.includes(tag));
  }

  // Only sort if we have multiple posts and they need sorting
  if (filteredPosts.length > 1) {
    // Check if already sorted to avoid unnecessary work
    const isSorted = filteredPosts.every((post, i) => 
      i === 0 || filteredPosts[i - 1].data.publicationDate >= post.data.publicationDate
    );
    
    if (!isSorted) {
      // Create copy only when we need to sort
      filteredPosts = [...filteredPosts].sort((a, b) => {
        return (
          b.data.publicationDate.getTime() - a.data.publicationDate.getTime()
        );
      });
    }
  }

  // Apply limit if specified
  if (take && take > 0 && filteredPosts.length > take) {
    filteredPosts = filteredPosts.slice(0, take);
  }

  return filteredPosts;
}

export async function getBlogTags() {
  const posts = await getCollection("blog");
  const tags = new Set<string>();
  posts.forEach(({ data }) => {
    data.tags?.forEach((tag) => tags.add(tag));
  });
  const tagList = [...tags]
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({
      name: tag,
      slug: slugify(tag),
    }));
  return tagList;
}

export type TocEntry = MarkdownHeading & { children: Array<TocEntry> };

function diveChildren(item: TocEntry, depth: number): Array<TocEntry> {
  if (depth === 1) {
    return item.children;
  } else {
    // e.g., 2
    return diveChildren(item.children[item.children.length - 1], depth - 1);
  }
}

function generateNestedHeadings(
  headings: Array<MarkdownHeading>,
  options?: { maxDepth?: number },
) {
  headings = headings.filter(
    ({ depth }) => depth > 1 && depth <= (options?.maxDepth || 3),
  );

  const toc: Array<TocEntry> = [];

  for (const heading of headings) {
    if (toc.length === 0) {
      toc.push({
        ...heading,
        children: [],
      });
    } else {
      const lastItemInToc = toc[toc.length - 1];
      if (heading.depth < lastItemInToc.depth) {
        throw new Error(`Orphan heading found: ${heading.text}.`);
      }
      if (heading.depth === lastItemInToc.depth) {
        // same depth
        toc.push({
          ...heading,
          children: [],
        });
      } else {
        // higher depth
        // push into children, or children' children alike
        const gap = heading.depth - lastItemInToc.depth;
        const target = diveChildren(lastItemInToc, gap);
        target.push({
          ...heading,
          children: [],
        });
      }
    }
  }
  return toc;
}

export function generatePostHeadings(
  headings: Array<MarkdownHeading>,
): Array<TocEntry> {
  const sanitizedHeadings = headings.map((heading) =>
    heading.text.startsWith("#")
      ? { ...heading, text: heading.text.substring(1) }
      : heading,
  );
  return generateNestedHeadings(sanitizedHeadings);
}
