import { Request, Response } from 'express';
import { z } from 'zod';
import { Profile } from '../models/Profile.model';

const contactInfoSchema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
});

const workHistorySchema = z.object({
    company: z.string().min(1),
    title: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    bullets: z.array(z.string()).default([]),
});

const projectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    bullets: z.array(z.string()).default([]),
    link: z.string().optional(),
});

const educationSchema = z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const certificationSchema = z.object({
    name: z.string().min(1),
    issuer: z.string().optional(),
    date: z.string().optional(),
});

const profileUpdateSchema = z.object({
    contactInfo: contactInfoSchema,
    summary: z.string().default(""),
    workHistory: z.array(workHistorySchema).default([]),
    projects: z.array(projectSchema).default([]),
    skills: z.array(z.string()).default([]),
    education: z.array(educationSchema).default([]),
    certifications: z.array(certificationSchema).default([]),
});

export async function getProfile(req: Request, res: Response) {
    const profile = await Profile.findOne({ userId: req.user!.userId });
    res.json(profile);
}

export async function updateProfile(req: Request, res: Response) {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const profile = await Profile.findOneAndUpdate(
        { userId: req.user!.userId },
        { $set: parsed.data },
        { new: true, upsert: true },
    );

    res.json(profile);
}
