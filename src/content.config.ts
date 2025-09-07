import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			publicationDate: z.coerce.date(),
			modificationDate: z.coerce.date().optional(),
			cover: image().optional(),
			tags: z.array(z.string().min(1)).optional(),
			authors: z.array(reference("authors")).min(1).default(['nikolailehbrink']),
		}),
});

const authors = defineCollection({
	loader: file("src/data/authors/authors.json"), schema: ({image}) => z.object({
		name: z.string(),
		image: image().optional(),
		x: z.string().url().refine(arg => arg.includes("x.com"), {
  message: "URL must contain x.com"
}).optional(),
github: z.string().url().refine(arg => arg.includes("github.com"), {
  message: "URL must contain github.com"
}).optional(),
linkedin: z.string().url().refine(arg => arg.includes("linkedin.com"), {
	message: "URL must contain linkedin.com"
}).optional(),
}),

})

export const collections = { blog, authors };
