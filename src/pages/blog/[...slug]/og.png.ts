import { getCollection } from "astro:content";
import { generateOG } from "@/lib/og/generate-og";
import type { APIRoute, InferGetStaticPropsType } from "astro";
import type { GetStaticPaths } from "astro";

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props, request }) => {
  const { title, description } = props;
  const url = new URL(request.url);
  const origin = url.origin;
  return generateOG({ title, description, origin });
};

export const getStaticPaths = (async () => {
  const posts = (await getCollection("blog")).filter(
    (post) => !post.data.cover,
  );
  return posts.map(({ id, data: { title, description } }) => ({
    params: {
      slug: id,
    },
    props: {
      title,
      description,
    },
  }));
}) satisfies GetStaticPaths;
