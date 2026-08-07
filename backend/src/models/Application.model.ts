import { Schema, model, Types } from 'mongoose';

export type ApplicationStatus =
    | 'saved'
    | 'applied'
    | 'interviewing'
    | 'offer'
    | 'rejected'
    | 'withdrawn';

export interface ApplicationDocument {
    userId: Types.ObjectId;
    companyName: string;
    jobTitle: string;
    jobDescriptionText: string;
    status: ApplicationStatus;
    currentDocumentId?: Types.ObjectId;
    currentFeedbackReportId?: Types.ObjectId;
    notes?: string;
}

const applicationSchema = new Schema<ApplicationDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        companyName: { type: String, required: true, trim: true },
        jobTitle: { type: String, required: true, trim: true },
        jobDescriptionText: { type: String, required: true },
        status: {
            type: String,
            enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
            default: 'saved',
        },
        currentDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
        currentFeedbackReportId: { type: Schema.Types.ObjectId, ref: 'FeedbackReport' },
        notes: { type: String, trim: true },
    },
    { timestamps: true },
);

export const Application = model<ApplicationDocument>('Application', applicationSchema);
