import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().optional(),
    }),
});

const products = defineCollection({
  loader: glob({ base: "./src/content/products", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      coverImage: image().optional(),
      link: z.string().optional(),
      githubUrl: z.string().optional(),
      order: z.number().optional(),
      displayMode: z.enum(["page", "blank"]).default("page"),
    }),
});

const blocks = defineCollection({
  loader: glob({ base: "./src/content/blocks", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["text", "video"]).default("text"),
    video: z
      .object({
        title: z.string(),
        url: z.string(),
        caption: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { blog, products, blocks };
