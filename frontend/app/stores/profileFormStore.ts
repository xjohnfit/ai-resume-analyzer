import { create } from "zustand";

export interface WorkHistoryEntry {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
}

export interface ProjectEntry {
    name: string;
    description: string;
    bullets: string[];
    link: string;
}

export interface EducationEntry {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
}

export interface CertificationEntry {
    name: string;
    issuer: string;
    date: string;
}

export interface ProfileDraft {
    contactInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        website: string;
    };
    summary: string;
    workHistory: WorkHistoryEntry[];
    projects: ProjectEntry[];
    skills: string[];
    education: EducationEntry[];
    certifications: CertificationEntry[];
}

export const emptyProfileDraft: ProfileDraft = {
    contactInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", website: "" },
    summary: "",
    workHistory: [],
    projects: [],
    skills: [],
    education: [],
    certifications: [],
};

interface ProfileFormState {
    draft: ProfileDraft;
    setDraft: (draft: ProfileDraft) => void;
    updateContactInfo: (patch: Partial<ProfileDraft["contactInfo"]>) => void;
    updateSummary: (summary: string) => void;
    updateSkills: (skills: string[]) => void;
    setWorkHistory: (workHistory: WorkHistoryEntry[]) => void;
    setProjects: (projects: ProjectEntry[]) => void;
    setEducation: (education: EducationEntry[]) => void;
    setCertifications: (certifications: CertificationEntry[]) => void;
}

export const useProfileFormStore = create<ProfileFormState>((set) => ({
    draft: emptyProfileDraft,
    setDraft: (draft) => set({ draft }),
    updateContactInfo: (patch) =>
        set((state) => ({ draft: { ...state.draft, contactInfo: { ...state.draft.contactInfo, ...patch } } })),
    updateSummary: (summary) => set((state) => ({ draft: { ...state.draft, summary } })),
    updateSkills: (skills) => set((state) => ({ draft: { ...state.draft, skills } })),
    setWorkHistory: (workHistory) => set((state) => ({ draft: { ...state.draft, workHistory } })),
    setProjects: (projects) => set((state) => ({ draft: { ...state.draft, projects } })),
    setEducation: (education) => set((state) => ({ draft: { ...state.draft, education } })),
    setCertifications: (certifications) => set((state) => ({ draft: { ...state.draft, certifications } })),
}));
