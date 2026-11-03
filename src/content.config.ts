import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 用户手册：按章拆分，来自 openheron 仓库的 docs/user-manual_zh.md 与 docs/user-manual.md。
 * 内容由 scripts/build-content.mjs 在构建时生成，不在本站手工维护。
 *
 * 目录按语言分：src/content/manual/zh/ 与 src/content/manual/en/。
 */
const manual = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/manual' }),
  schema: z.object({
    title: z.string(),
    chapter: z.string(),
    order: z.number(),
    /** 语言无关的语义 slug —— 同一章在中英文下相同 */
    chapterSlug: z.string(),
    lang: z.enum(['zh', 'en']),
    kind: z.string(),
    sourceFile: z.string(),
  }),
});

export const collections = { manual };
