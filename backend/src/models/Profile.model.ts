import { Schema, model, Types } from 'mongoose';

interface ContactInfo {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
}

const contactInfoSchema = new Schema<ContactInfo>(
    {
        fullName: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        location: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        website: { type: String, trim: true },
    },
    { _id: false },
);

interface WorkHistoryEntry {
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
}

const workHistorySchema = new Schema<WorkHistoryEntry>({
    company: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
});

interface ProjectEntry {
    name: string;
    description?: string;
    bullets: string[];
    link?: string;
}

const projectSchema = new Schema<ProjectEntry>({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    bullets: { type: [String], default: [] },
    link: { type: String, trim: true },
});

interface EducationEntry {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
}

const educationSchema = new Schema<EducationEntry>(
    {
        institution: { type: String, required: true, trim: true },
        degree: { type: String, required: true, trim: true },
        fieldOfStudy: { type: String, trim: true },
        startDate: { type: String },
        endDate: { type: String },
    },
    { _id: false },
);

interface CertificationEntry {
    name: string;
    issuer?: string;
    date?: string;
}

const certificationSchema = new Schema<CertificationEntry>(
    {
        name: { type: String, required: true, trim: true },
        issuer: { type: String, trim: true },
        date: { type: String },
    },
    { _id: false },
);

export interface ProfileDocument {
    userId: Types.ObjectId;
    photoUrl?: string;
    contactInfo: ContactInfo;
    summary: string;
    workHistory: WorkHistoryEntry[];
    projects: ProjectEntry[];
    skills: string[];
    education: EducationEntry[];
    certifications: CertificationEntry[];
}

const profileSchema = new Schema<ProfileDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        photoUrl: { type: String, default: '' },
        contactInfo: { type: contactInfoSchema, default: () => ({}) },
        summary: { type: String, default: '', trim: true },
        workHistory: { type: [workHistorySchema], default: [] },
        projects: { type: [projectSchema], default: [] },
        skills: { type: [String], default: [] },
        education: { type: [educationSchema], default: [] },
        certifications: { type: [certificationSchema], default: [] },
    },
    { timestamps: true },
);

export const Profile = model<ProfileDocument>('Profile', profileSchema);
