interface Job {
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
}

type ApplicationStatus =
    | "saved"
    | "applied"
    | "interviewing"
    | "offer"
    | "rejected"
    | "withdrawn";

interface Application {
    _id: string;
    companyName: string;
    jobTitle: string;
    jobDescriptionText: string;
    status: ApplicationStatus;
    currentDocumentId?: string;
    currentFeedbackReportId?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface FeedbackReport extends Feedback {
    _id: string;
    applicationId: string;
    modelUsed: string;
    createdAt: string;
}

interface RecurringPattern {
    id: string;
    title: string;
    frequency: number;
    companies: string[];
    note: string;
}

interface RecommendedTechnology {
    id: string;
    name: string;
    reason: string;
    relatedGapId: string;
}

interface LearningRoadmapStep {
    id: string;
    order: number;
    title: string;
    description: string;
    relatedGapId: string;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}