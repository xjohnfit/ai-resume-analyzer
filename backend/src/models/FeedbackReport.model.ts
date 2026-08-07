import { Schema, model, Types } from 'mongoose';

interface Tip {
    type: 'good' | 'improve';
    tip: string;
    explanation: string;
}

const tipSchema = new Schema<Tip>(
    {
        type: { type: String, enum: ['good', 'improve'], required: true },
        tip: { type: String, required: true },
        explanation: { type: String, required: true },
    },
    { _id: false },
);

interface CategoryFeedback {
    score: number;
    tips: Tip[];
}

const categoryFeedbackSchema = new Schema<CategoryFeedback>(
    {
        score: { type: Number, required: true },
        tips: { type: [tipSchema], default: [] },
    },
    { _id: false },
);

export interface FeedbackReportDocument {
    userId: Types.ObjectId;
    applicationId: Types.ObjectId;
    overallScore: number;
    ATS: CategoryFeedback;
    toneAndStyle: CategoryFeedback;
    content: CategoryFeedback;
    structure: CategoryFeedback;
    skills: CategoryFeedback;
    groundingChunkIds: Types.ObjectId[];
    modelUsed: string;
}

const feedbackReportSchema = new Schema<FeedbackReportDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
        overallScore: { type: Number, required: true },
        ATS: { type: categoryFeedbackSchema, required: true },
        toneAndStyle: { type: categoryFeedbackSchema, required: true },
        content: { type: categoryFeedbackSchema, required: true },
        structure: { type: categoryFeedbackSchema, required: true },
        skills: { type: categoryFeedbackSchema, required: true },
        groundingChunkIds: { type: [Schema.Types.ObjectId], default: [] },
        modelUsed: { type: String, required: true },
    },
    { timestamps: true },
);

export const FeedbackReport = model<FeedbackReportDocument>('FeedbackReport', feedbackReportSchema);
