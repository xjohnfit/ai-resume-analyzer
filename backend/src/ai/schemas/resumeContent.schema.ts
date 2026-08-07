import { z } from 'zod';

export const resumeContentSchema = z.object({
    summary: z
        .string()
        .describe(
            'A completely rewritten 2-4 sentence professional summary in fresh wording — not a lightly-edited copy of the candidate\'s original summary. Lead with the qualifications most relevant to this specific job, using the job description\'s own terminology where it honestly applies. Every fact must already be true of the candidate, but the sentences themselves should read as newly written for this job, not reused from the source.',
        ),
    workHistory: z
        .array(
            z.object({
                company: z.string(),
                title: z.string(),
                startDate: z.string(),
                endDate: z.string().optional(),
                current: z.boolean().default(false),
                bullets: z
                    .array(z.string())
                    .describe(
                        "Each bullet rewritten in fresh phrasing, not copied verbatim or near-verbatim from the source bullet — restructure the sentence, lead with whichever part of the achievement is most relevant to this job, and substitute in the job description's own terminology wherever it honestly describes the same real work. A bullet that reads almost identically to its source is a mistake, not a safe choice. The underlying facts, numbers, technologies, and outcomes must stay exactly true — only the wording, structure, and emphasis change. Never invent metrics, technologies, or responsibilities not already present in the source bullets.",
                    ),
            }),
        )
        .describe(
            'The same roles as the candidate profile, in the same order, with bullets substantively rewritten (not just lightly edited) to match this job description.',
        ),
    projects: z
        .array(
            z.object({
                name: z.string(),
                description: z.string().optional(),
                bullets: z
                    .array(z.string())
                    .describe(
                        'Each bullet rewritten in fresh phrasing for this job description, same standard as work history bullets above — restructure the sentence and use the job description\'s own terminology where it honestly applies, never inventing anything not already in the source bullet.',
                    ),
                link: z.string().optional(),
            }),
        )
        .describe(
            'Only the projects most relevant to this job description, most relevant first',
        ),
    skills: z
        .array(
            z.object({
                category: z.string(),
                items: z
                    .array(z.string())
                    .describe(
                        "This category's real skills, reordered so the ones most relevant to this job description come first — never add or invent a skill not already in this category",
                    ),
            }),
        )
        .describe(
            "The candidate's real skill categories, in the same categories and order as the candidate profile — only the items within each category are reordered for relevance, categories themselves are not added, removed, or renamed",
        ),
});
