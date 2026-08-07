import { z } from 'zod';

export const profileParseSchema = z.object({
    contactInfo: z.object({
        fullName: z.string().describe("The candidate's full name"),
        email: z.string().optional().describe('Email address, if present'),
        phone: z.string().optional().describe('Phone number, if present'),
        location: z
            .string()
            .optional()
            .describe('City/state or general location, if present'),
        linkedin: z
            .string()
            .optional()
            .describe('LinkedIn profile URL, if present'),
        website: z
            .string()
            .optional()
            .describe('Personal website or portfolio URL, if present'),
    }),
    summary: z
        .string()
        .optional()
        .describe('Professional summary or objective statement, if present'),
    workHistory: z
        .array(
            z.object({
                company: z.string(),
                title: z.string(),
                location: z
                    .string()
                    .optional()
                    .describe(
                        "The role's location as written, e.g. 'Remote' or 'New York, NY', if present",
                    ),
                startDate: z
                    .string()
                    .describe(
                        "Start date as written on the resume, e.g. 'Jan 2020' or '2020'",
                    ),
                endDate: z
                    .string()
                    .optional()
                    .describe(
                        'End date as written, omit if this is the current role',
                    ),
                current: z
                    .boolean()
                    .default(false)
                    .describe("True if this is the candidate's current role"),
                bullets: z
                    .array(z.string())
                    .default([])
                    .describe(
                        'Bullet points describing responsibilities and achievements',
                    ),
            }),
        )
        .default([])
        .describe('Work experience, most recent first'),
    projects: z
        .array(
            z.object({
                name: z.string(),
                description: z.string().optional(),
                bullets: z.array(z.string()).default([]),
                link: z.string().optional(),
            }),
        )
        .default([])
        .describe(
            'Notable projects, only if listed separately from work history',
        ),
    skills: z
        .array(
            z.object({
                category: z
                    .string()
                    .describe(
                        "The skill category's label, e.g. 'Languages', 'Frontend', 'Cloud & DevOps' — infer sensible groupings from how the resume itself organizes them; if the resume just lists skills with no grouping, use a small number of sensible categories (e.g. 'Languages', 'Frameworks & Libraries', 'Tools & Platforms') rather than one giant uncategorized list",
                    ),
                items: z.array(z.string()).default([]),
            }),
        )
        .default([])
        .describe(
            'Technical and professional skills mentioned anywhere in the resume, grouped into categories',
        ),
    education: z
        .array(
            z.object({
                institution: z.string(),
                degree: z.string(),
                fieldOfStudy: z.string().optional(),
                location: z
                    .string()
                    .optional()
                    .describe("The institution's location as written, if present"),
                startDate: z.string().optional(),
                endDate: z.string().optional(),
            }),
        )
        .default([]),
    certifications: z
        .array(
            z.object({
                name: z.string(),
                issuer: z.string().optional(),
                date: z.string().optional(),
            }),
        )
        .default([]),
});
