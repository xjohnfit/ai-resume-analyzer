import { Request, Response } from 'express';
import { z } from 'zod';
import { Application } from '../models/Application.model';
import { Document } from '../models/Document.model';
import { FeedbackReport } from '../models/FeedbackReport.model';
import { Profile } from '../models/Profile.model';
import { User } from '../models/User.model';
import { analyzeAndTailorResume, CLAUDE_MODEL } from '../ai/chains/analyzeApplication.chain';
import { incrementUsage } from '../services/usage.service';

export async function analyzeApplication(req: Request, res: Response) {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!application) {
        return res.status(404).json({ error: 'Application not found.' });
    }

    const profile = await Profile.findOne({ userId: req.user!.userId });
    if (!profile) {
        return res.status(400).json({ error: 'Create your profile before running an analysis.' });
    }

    let result;
    try {
        result = await analyzeAndTailorResume({
            jobTitle: application.jobTitle,
            jobDescriptionText: application.jobDescriptionText,
            profile,
        });
    } catch (err) {
        console.error('analyze failed:', err);
        return res.status(502).json({ error: 'Failed to analyze application. Please try again.' });
    }

    const existingDocumentCount = await Document.countDocuments({ applicationId: application._id });

    // `location` never goes through the AI (same reasoning as contactInfo/education/certifications —
    // it's a fact, not something worth tailoring) so it has to be reattached here by matching each
    // tailored role back to the real profile entry it came from.
    const locationByCompany = new Map(profile.workHistory.map((job) => [job.company, job.location]));
    const tailoredWorkHistory = result.tailoredResume.workHistory.map((job) => ({
        ...job,
        location: locationByCompany.get(job.company),
    }));

    const document = await Document.create({
        userId: req.user!.userId,
        applicationId: application._id,
        type: 'resume',
        version: existingDocumentCount + 1,
        templateId: 'classic',
        contentSnapshot: {
            contactInfo: profile.contactInfo,
            summary: result.tailoredResume.summary,
            workHistory: tailoredWorkHistory,
            projects: result.tailoredResume.projects,
            skills: result.tailoredResume.skills,
            education: profile.education,
            certifications: profile.certifications,
        },
    });

    const feedbackReport = await FeedbackReport.create({
        userId: req.user!.userId,
        applicationId: application._id,
        ...result.feedback,
        modelUsed: CLAUDE_MODEL,
    });

    application.currentDocumentId = document._id;
    application.currentFeedbackReportId = feedbackReport._id;
    await application.save();

    const user = await User.findById(req.user!.userId);
    if (user) {
        await incrementUsage(user);
    }

    res.json({ feedbackReport, document });
}

export async function getApplicationFeedback(req: Request, res: Response) {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!application) {
        return res.status(404).json({ error: 'Application not found.' });
    }
    if (!application.currentFeedbackReportId) {
        return res.status(404).json({ error: 'This application has not been analyzed yet.' });
    }

    const feedbackReport = await FeedbackReport.findById(application.currentFeedbackReportId);
    res.json(feedbackReport);
}



const createApplicationSchema = z.object({
    companyName: z.string().min(1),
    jobTitle: z.string().min(1),
    jobDescriptionText: z.string().min(1),
    notes: z.string().optional(),
});

export async function createApplication(req: Request, res: Response) {
    const parsed = createApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const application = await Application.create({
        userId: req.user!.userId,
        ...parsed.data,
    });

    res.status(201).json(application);
}

export async function listApplications(req: Request, res: Response) {
    const applications = await Application.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json(applications);
}

export async function getApplication(req: Request, res: Response) {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!application) {
        return res.status(404).json({ error: 'Application not found.' });
    }
    res.json(application);
}

const updateApplicationSchema = z.object({
    companyName: z.string().min(1).optional(),
    jobTitle: z.string().min(1).optional(),
    jobDescriptionText: z.string().min(1).optional(),
    status: z.enum(['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn']).optional(),
    notes: z.string().optional(),
});

export async function updateApplication(req: Request, res: Response) {
    const parsed = updateApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const application = await Application.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!.userId },
        { $set: parsed.data },
        { new: true },
    );
    if (!application) {
        return res.status(404).json({ error: 'Application not found.' });
    }
    res.json(application);
}

export async function deleteApplication(req: Request, res: Response) {
    const application = await Application.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!application) {
        return res.status(404).json({ error: 'Application not found.' });
    }

    await Promise.all([
        Document.deleteMany({ applicationId: application._id }),
        FeedbackReport.deleteMany({ applicationId: application._id }),
        application.deleteOne(),
    ]);

    res.status(204).send();
}
