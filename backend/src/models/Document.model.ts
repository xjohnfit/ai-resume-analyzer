import { Schema, model, Types } from 'mongoose';
import {
    contactInfoSchema,
    workHistorySchema,
    projectSchema,
    educationSchema,
    certificationSchema,
    skillCategorySchema,
} from './Profile.model';
import type { ResumeContent } from './Profile.model';

export type DocumentType = 'resume' | 'coverLetter';

export interface DocumentRecord {
    userId: Types.ObjectId;
    applicationId: Types.ObjectId;
    type: DocumentType;
    version: number;
    templateId: string;
    contentSnapshot: ResumeContent;
}

const documentSchema = new Schema<DocumentRecord>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
        type: { type: String, enum: ['resume', 'coverLetter'], default: 'resume' },
        version: { type: Number, required: true, default: 1 },
        templateId: { type: String, default: 'classic' },
        contentSnapshot: {
            contactInfo: { type: contactInfoSchema, default: () => ({}) },
            summary: { type: String, default: '' },
            workHistory: { type: [workHistorySchema], default: [] },
            projects: { type: [projectSchema], default: [] },
            skills: { type: [skillCategorySchema], default: [] },
            education: { type: [educationSchema], default: [] },
            certifications: { type: [certificationSchema], default: [] },
        },
    },
    { timestamps: true },
);

export const Document = model<DocumentRecord>('Document', documentSchema);
