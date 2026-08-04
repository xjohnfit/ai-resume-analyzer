import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import {
    IdCard,
    FileText,
    Sparkles,
    Briefcase,
    FolderKanban,
    GraduationCap,
    Award,
    Plus,
    Trash2,
    Save,
    Upload,
    Camera,
    UserRound,
} from "lucide-react";
import type { Route } from "./+types/profile";
import { apiFetch } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";
import {
    useProfileFormStore,
    type ProfileDraft,
    type WorkHistoryEntry,
    type ProjectEntry,
    type EducationEntry,
    type CertificationEntry,
} from "~/stores/profileFormStore";
import Navbar from "~/components/Navbar";
import MobileNavbar from "~/components/MobileNavbar";
import { extractTextFromPdf } from "~/lib/extractResumeText.client";
import { useToastStore } from "~/stores/toastStore";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const response = await apiFetch(request, "/api/profile");
    const profile = response.ok ? await response.json() : null;
    return { user, profile };
}

function stripEmptyBullets<T extends { bullets: string[]; }>(entries: T[]): T[] {
    return entries.map((entry) => ({ ...entry, bullets: entry.bullets.filter(Boolean) }));
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const payload = {
        photoUrl: String(formData.get("photoUrl") ?? ""),
        contactInfo: {
            fullName: String(formData.get("fullName") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            location: String(formData.get("location") ?? ""),
            linkedin: String(formData.get("linkedin") ?? ""),
            website: String(formData.get("website") ?? ""),
        },
        summary: String(formData.get("summary") ?? ""),
        skills: String(formData.get("skills") ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        workHistory: stripEmptyBullets(JSON.parse(String(formData.get("workHistory") ?? "[]"))),
        projects: stripEmptyBullets(JSON.parse(String(formData.get("projects") ?? "[]"))),
        education: JSON.parse(String(formData.get("education") ?? "[]")),
        certifications: JSON.parse(String(formData.get("certifications") ?? "[]")),
    };

    const response = await apiFetch(request, "/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return { error: "Failed to save profile. Please try again." };
    }

    return { success: true };
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Your Profile — Applyze" }];
}

function mapProfileToDraft(profile: any): ProfileDraft {
    return {
        photoUrl: profile?.photoUrl ?? "",
        contactInfo: {
            fullName: profile?.contactInfo?.fullName ?? "",
            email: profile?.contactInfo?.email ?? "",
            phone: profile?.contactInfo?.phone ?? "",
            location: profile?.contactInfo?.location ?? "",
            linkedin: profile?.contactInfo?.linkedin ?? "",
            website: profile?.contactInfo?.website ?? "",
        },
        summary: profile?.summary ?? "",
        workHistory: profile?.workHistory ?? [],
        projects: profile?.projects ?? [],
        skills: profile?.skills ?? [],
        education: profile?.education ?? [],
        certifications: profile?.certifications ?? [],
    };
}

function updateAt<T>(array: T[], index: number, patch: Partial<T>): T[] {
    return array.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function removeAt<T>(array: T[], index: number): T[] {
    return array.filter((_, i) => i !== index);
}

const emptyWorkHistoryEntry: WorkHistoryEntry = {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [],
};

const emptyProjectEntry: ProjectEntry = { name: "", description: "", bullets: [], link: "" };

const emptyEducationEntry: EducationEntry = {
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
};

const emptyCertificationEntry: CertificationEntry = { name: "", issuer: "", date: "" };

export default function Profile({ loaderData }: Route.ComponentProps) {
    const { profile } = loaderData;
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const draft = useProfileFormStore((state) => state.draft);
    const setDraft = useProfileFormStore((state) => state.setDraft);
    const setPhotoUrl = useProfileFormStore((state) => state.setPhotoUrl);
    const updateContactInfo = useProfileFormStore((state) => state.updateContactInfo);
    const updateSummary = useProfileFormStore((state) => state.updateSummary);
    const updateSkills = useProfileFormStore((state) => state.updateSkills);
    const setWorkHistory = useProfileFormStore((state) => state.setWorkHistory);
    const setProjects = useProfileFormStore((state) => state.setProjects);
    const setEducation = useProfileFormStore((state) => state.setEducation);
    const setCertifications = useProfileFormStore((state) => state.setCertifications);
    const addToast = useToastStore((state) => state.addToast);

    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsingProgress, setParsingProgress] = useState(0);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setIsParsing(true);
        setParseError(null);
        setParsingProgress(0);

        progressIntervalRef.current = setInterval(() => {
            setParsingProgress((prev) => (prev >= 90 ? prev : prev + (90 - prev) * 0.15));
        }, 200);

        try {
            const rawText = await extractTextFromPdf(file);
            const response = await fetch("/profile/parse-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawText }),
            });

            if (!response.ok) {
                throw new Error("Failed to parse resume");
            }

            const data = await response.json();
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setParsingProgress(100);
            setDraft({ ...mapProfileToDraft(data), photoUrl: draft.photoUrl });
            addToast("Resume imported and populated — check the data before saving.", "success");
            await new Promise((resolve) => setTimeout(resolve, 400));
        } catch {
            setParseError("Couldn't read that resume. Please try again or fill the form manually.");
        } finally {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setIsParsing(false);
        }
    }

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setIsUploadingPhoto(true);
        setPhotoError(null);

        try {
            const sigResponse = await fetch("/profile/photo-upload-signature");
            if (!sigResponse.ok) {
                throw new Error("Failed to get upload signature");
            }
            const { signature, timestamp, apiKey, cloudName, folder } = await sigResponse.json();

            const uploadForm = new FormData();
            uploadForm.append("file", file);
            uploadForm.append("api_key", apiKey);
            uploadForm.append("timestamp", String(timestamp));
            uploadForm.append("signature", signature);
            uploadForm.append("folder", folder);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: uploadForm,
            });

            if (!uploadResponse.ok) {
                throw new Error("Upload failed");
            }

            const data = await uploadResponse.json();

            const saveResponse = await fetch("/profile/update-photo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ photoUrl: data.secure_url }),
            });

            if (!saveResponse.ok) {
                throw new Error("Failed to save photo");
            }

            setPhotoUrl(data.secure_url);
            addToast("Profile photo updated.", "success");
        } catch {
            setPhotoError("Couldn't upload photo. Please try again.");
        } finally {
            setIsUploadingPhoto(false);
        }
    }

    useEffect(() => {
        setDraft(mapProfileToDraft(profile));
    }, [profile, setDraft]);

    useEffect(() => {
        if (actionData?.success) {
            addToast("Profile saved.", "success");
        } else if (actionData?.error) {
            addToast(actionData.error, "error");
        }
    }, [actionData, addToast]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            {isParsing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-1 text-base font-semibold text-black">Analyzing your resume...</h3>
                        <p className="mb-4 text-sm text-dark-200">This usually takes a few seconds.</p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-[#606beb] transition-all duration-300 ease-out"
                                style={{ width: `${parsingProgress}%` }}
                            />
                        </div>
                        <p className="mt-2 text-right text-xs text-dark-200">{Math.round(parsingProgress)}%</p>
                    </div>
                </div>
            )}
            <Navbar />
            <MobileNavbar />
            <section className="main-section gap-3 pt-6 pb-4">
                <div className="flex w-full max-w-300 items-stretch justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="group relative shrink-0">
                            <label htmlFor="profilePhoto" className="block cursor-pointer">
                                {draft.photoUrl ? (
                                    <img
                                        src={draft.photoUrl}
                                        alt="Profile photo"
                                        className="h-36 w-36 rounded-full border border-gray-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-36 w-36 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-dark-200">
                                        <UserRound className="h-6 w-6" />
                                    </div>
                                )}
                                <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#606beb] text-white">
                                    <Camera className="h-3 w-3" />
                                </span>
                            </label>
                            <input
                                id="profilePhoto"
                                type="file"
                                accept="image/*"
                                disabled={isUploadingPhoto}
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-2xl font-semibold text-black tracking-wide">Your profile</h1>
                            <p className="max-w-2xl text-sm text-dark-200">
                                Keep this up to date — the AI uses your current profile data to generate high-match, tailored resumes for each job description, and may reword content to match the role's keywords.
                            </p>
                            {isUploadingPhoto && <p className="text-xs text-dark-200">Uploading photo...</p>}
                            {photoError && <p className="text-xs text-badge-red-text">{photoError}</p>}
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col justify-center">
                        <button className="primary-button w-fit" type="submit" form="profile-form" disabled={isSubmitting}>
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Saving..." : "Save profile"}
                        </button>
                    </div>
                </div>

                <Form method="post" id="profile-form" className="profile-form w-full">
                    <input type="hidden" name="photoUrl" value={draft.photoUrl} />

                    <div className="profile-category-card lg:col-span-2" style={{ backgroundColor: "#606beb" }}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-white">
                                <Upload className="h-4 w-4" />
                                <p className="text-sm font-medium">
                                    Have a resume? Import it to populate the fields automatically.
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <label
                                    htmlFor="resumeUpload"
                                    className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#606beb] transition-colors hover:bg-white/90"
                                >
                                    {isParsing ? "Analyzing resume..." : "Import from resume"}
                                </label>
                                <p className="text-[10px] text-white/70">PDF only</p>
                            </div>
                            <input
                                id="resumeUpload"
                                type="file"
                                accept="application/pdf"
                                disabled={isParsing}
                                onChange={handleResumeUpload}
                                className="hidden"
                            />
                        </div>
                        {parseError && <p className="text-xs text-white">{parseError}</p>}
                    </div>

                    <div className="profile-category-card bg-blue-100 lg:col-span-2">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <IdCard className="h-4 w-4 text-[#606beb]" />
                        Contact info
                    </h3>
                    <div className="profile-form-grid lg:grid-cols-6">
                        <div className="form-div">
                            <label htmlFor="fullName">Full name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                value={draft.contactInfo.fullName}
                                onChange={(e) => updateContactInfo({ fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={draft.contactInfo.email}
                                onChange={(e) => updateContactInfo({ email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="phone">Phone</label>
                            <input
                                id="phone"
                                name="phone"
                                value={draft.contactInfo.phone}
                                onChange={(e) => updateContactInfo({ phone: e.target.value })}
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="location">Location</label>
                            <input
                                id="location"
                                name="location"
                                value={draft.contactInfo.location}
                                onChange={(e) => updateContactInfo({ location: e.target.value })}
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="linkedin">LinkedIn</label>
                            <input
                                id="linkedin"
                                name="linkedin"
                                value={draft.contactInfo.linkedin}
                                onChange={(e) => updateContactInfo({ linkedin: e.target.value })}
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="website">Website</label>
                            <input
                                id="website"
                                name="website"
                                value={draft.contactInfo.website}
                                onChange={(e) => updateContactInfo({ website: e.target.value })}
                            />
                        </div>
                    </div>
                    </div>

                    <div className="profile-category-card bg-violet-100">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <FileText className="h-4 w-4 text-[#606beb]" />
                        Summary
                    </h3>
                    <div className="form-div">
                        <label htmlFor="summary">Professional summary</label>
                        <textarea
                            id="summary"
                            name="summary"
                            rows={4}
                            value={draft.summary}
                            onChange={(e) => updateSummary(e.target.value)}
                        />
                    </div>
                    </div>

                    <div className="profile-category-card bg-indigo-100">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <Sparkles className="h-4 w-4 text-[#606beb]" />
                        Skills
                    </h3>
                    <div className="form-div flex-1">
                        <label htmlFor="skills">Skills (comma-separated)</label>
                        <textarea
                            id="skills"
                            name="skills"
                            rows={4}
                            className="flex-1 resize-none"
                            value={draft.skills.join(", ")}
                            onChange={(e) =>
                                updateSkills(e.target.value.split(",").map((skill) => skill.trim()))
                            }
                        />
                    </div>
                    </div>

                    <div className="profile-category-card bg-sky-100 lg:col-span-2">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <Briefcase className="h-4 w-4 text-[#606beb]" />
                        Work history
                    </h3>
                    {draft.workHistory.map((entry, index) => (
                        <div key={index} className="profile-entry-card">
                            <div className="profile-form-grid lg:grid-cols-4">
                                <div className="form-div">
                                    <label htmlFor={`workHistory-${index}-company`}>Company</label>
                                    <input
                                        id={`workHistory-${index}-company`}
                                        value={entry.company}
                                        onChange={(e) =>
                                            setWorkHistory(updateAt(draft.workHistory, index, { company: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`workHistory-${index}-title`}>Title</label>
                                    <input
                                        id={`workHistory-${index}-title`}
                                        value={entry.title}
                                        onChange={(e) =>
                                            setWorkHistory(updateAt(draft.workHistory, index, { title: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`workHistory-${index}-startDate`}>Start date</label>
                                    <input
                                        id={`workHistory-${index}-startDate`}
                                        placeholder="2023-01"
                                        value={entry.startDate}
                                        onChange={(e) =>
                                            setWorkHistory(updateAt(draft.workHistory, index, { startDate: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`workHistory-${index}-endDate`}>End date</label>
                                    <input
                                        id={`workHistory-${index}-endDate`}
                                        placeholder="2024-06"
                                        value={entry.endDate}
                                        disabled={entry.current}
                                        onChange={(e) =>
                                            setWorkHistory(updateAt(draft.workHistory, index, { endDate: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <label className="flex w-fit items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={entry.current}
                                    onChange={(e) =>
                                        setWorkHistory(
                                            updateAt(draft.workHistory, index, {
                                                current: e.target.checked,
                                                endDate: e.target.checked ? "" : entry.endDate,
                                            }),
                                        )
                                    }
                                />
                                I currently work here
                            </label>
                            <div className="form-div">
                                <label htmlFor={`workHistory-${index}-bullets`}>Bullet points (one per line)</label>
                                <textarea
                                    id={`workHistory-${index}-bullets`}
                                    rows={3}
                                    value={entry.bullets.join("\n")}
                                    onChange={(e) =>
                                        setWorkHistory(
                                            updateAt(draft.workHistory, index, { bullets: e.target.value.split("\n") }),
                                        )
                                    }
                                />
                            </div>
                            <button
                                type="button"
                                className="secondary-button w-fit px-3 py-1.5 text-xs"
                                onClick={() => setWorkHistory(removeAt(draft.workHistory, index))}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit px-3 py-1.5 text-xs"
                        onClick={() => setWorkHistory([...draft.workHistory, emptyWorkHistoryEntry])}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add work history
                    </button>
                    </div>

                    <div className="profile-category-card bg-teal-100">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <FolderKanban className="h-4 w-4 text-[#606beb]" />
                        Projects
                    </h3>
                    {draft.projects.map((entry, index) => (
                        <div key={index} className="profile-entry-card">
                            <div className="profile-form-grid">
                                <div className="form-div">
                                    <label htmlFor={`projects-${index}-name`}>Name</label>
                                    <input
                                        id={`projects-${index}-name`}
                                        value={entry.name}
                                        onChange={(e) =>
                                            setProjects(updateAt(draft.projects, index, { name: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`projects-${index}-link`}>Link</label>
                                    <input
                                        id={`projects-${index}-link`}
                                        value={entry.link}
                                        onChange={(e) =>
                                            setProjects(updateAt(draft.projects, index, { link: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-div">
                                <label htmlFor={`projects-${index}-description`}>Description</label>
                                <input
                                    id={`projects-${index}-description`}
                                    value={entry.description}
                                    onChange={(e) =>
                                        setProjects(updateAt(draft.projects, index, { description: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor={`projects-${index}-bullets`}>Bullet points (one per line)</label>
                                <textarea
                                    id={`projects-${index}-bullets`}
                                    rows={3}
                                    value={entry.bullets.join("\n")}
                                    onChange={(e) =>
                                        setProjects(
                                            updateAt(draft.projects, index, { bullets: e.target.value.split("\n") }),
                                        )
                                    }
                                />
                            </div>
                            <button
                                type="button"
                                className="secondary-button w-fit px-3 py-1.5 text-xs"
                                onClick={() => setProjects(removeAt(draft.projects, index))}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit px-3 py-1.5 text-xs"
                        onClick={() => setProjects([...draft.projects, emptyProjectEntry])}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add project
                    </button>
                    </div>

                    <div className="profile-category-card bg-purple-100">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <GraduationCap className="h-4 w-4 text-[#606beb]" />
                        Education
                    </h3>
                    {draft.education.map((entry, index) => (
                        <div key={index} className="profile-entry-card">
                            <div className="profile-form-grid lg:grid-cols-3">
                                <div className="form-div">
                                    <label htmlFor={`education-${index}-institution`}>Institution</label>
                                    <input
                                        id={`education-${index}-institution`}
                                        value={entry.institution}
                                        onChange={(e) =>
                                            setEducation(updateAt(draft.education, index, { institution: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`education-${index}-degree`}>Degree</label>
                                    <input
                                        id={`education-${index}-degree`}
                                        value={entry.degree}
                                        onChange={(e) =>
                                            setEducation(updateAt(draft.education, index, { degree: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`education-${index}-fieldOfStudy`}>Field of study</label>
                                    <input
                                        id={`education-${index}-fieldOfStudy`}
                                        value={entry.fieldOfStudy}
                                        onChange={(e) =>
                                            setEducation(updateAt(draft.education, index, { fieldOfStudy: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`education-${index}-startDate`}>Start date</label>
                                    <input
                                        id={`education-${index}-startDate`}
                                        placeholder="2018-09"
                                        value={entry.startDate}
                                        onChange={(e) =>
                                            setEducation(updateAt(draft.education, index, { startDate: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`education-${index}-endDate`}>End date</label>
                                    <input
                                        id={`education-${index}-endDate`}
                                        placeholder="2022-05"
                                        value={entry.endDate}
                                        onChange={(e) =>
                                            setEducation(updateAt(draft.education, index, { endDate: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="secondary-button w-fit px-3 py-1.5 text-xs"
                                onClick={() => setEducation(removeAt(draft.education, index))}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit px-3 py-1.5 text-xs"
                        onClick={() => setEducation([...draft.education, emptyEducationEntry])}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add education
                    </button>
                    </div>

                    <div className="profile-category-card bg-amber-100 lg:col-span-2">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                        <Award className="h-4 w-4 text-[#606beb]" />
                        Certifications
                    </h3>
                    {draft.certifications.map((entry, index) => (
                        <div key={index} className="profile-entry-card">
                            <div className="profile-form-grid lg:grid-cols-3">
                                <div className="form-div">
                                    <label htmlFor={`certifications-${index}-name`}>Name</label>
                                    <input
                                        id={`certifications-${index}-name`}
                                        value={entry.name}
                                        onChange={(e) =>
                                            setCertifications(updateAt(draft.certifications, index, { name: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`certifications-${index}-issuer`}>Issuer</label>
                                    <input
                                        id={`certifications-${index}-issuer`}
                                        value={entry.issuer}
                                        onChange={(e) =>
                                            setCertifications(updateAt(draft.certifications, index, { issuer: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor={`certifications-${index}-date`}>Date</label>
                                    <input
                                        id={`certifications-${index}-date`}
                                        placeholder="2023-03"
                                        value={entry.date}
                                        onChange={(e) =>
                                            setCertifications(updateAt(draft.certifications, index, { date: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="secondary-button w-fit px-3 py-1.5 text-xs"
                                onClick={() => setCertifications(removeAt(draft.certifications, index))}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit px-3 py-1.5 text-xs"
                        onClick={() => setCertifications([...draft.certifications, emptyCertificationEntry])}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add certification
                    </button>
                    </div>

                    <input type="hidden" name="workHistory" value={JSON.stringify(draft.workHistory)} />
                    <input type="hidden" name="projects" value={JSON.stringify(draft.projects)} />
                    <input type="hidden" name="education" value={JSON.stringify(draft.education)} />
                    <input type="hidden" name="certifications" value={JSON.stringify(draft.certifications)} />
                </Form>
            </section>
        </main>
    );
}
