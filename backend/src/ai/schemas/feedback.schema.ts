import { z } from 'zod';

const tipSchema = z.object({
    type: z.enum(['good', 'improve']),
    tip: z.string().describe('A short, title-style summary of the tip'),
    explanation: z.string().describe('A detailed explanation of the tip'),
});

const categoryFeedbackSchema = z.object({
    score: z.number().min(0).max(100),
    tips: z.array(tipSchema).min(3).max(4).describe('3-4 tips for this category'),
});

export const feedbackSchema = z.object({
    overallScore: z.number().min(0).max(100),
    ATS: categoryFeedbackSchema.describe(
        'How well this resume would perform in an Applicant Tracking System',
    ),
    toneAndStyle: categoryFeedbackSchema,
    content: categoryFeedbackSchema,
    structure: categoryFeedbackSchema,
    skills: categoryFeedbackSchema,
});
