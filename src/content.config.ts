import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const photos = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/photos" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      location: z.string().optional(),
      date: z.coerce.date(),
      cover: image(),
      /** Used as the alt text; the title is the fallback. */
      description: z.string().optional(),
    }),
});

export const collections = { blog, photos };
