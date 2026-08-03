import { useEffect } from "react";
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

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const response = await apiFetch(request, "/api/profile");
    const profile = response.ok ? await response.json() : null;
    return { user, profile };
}

function stripEmptyBullets<T extends { bullets: string[] }>(entries: T[]): T[] {
    return entries.map((entry) => ({ ...entry, bullets: entry.bullets.filter(Boolean) }));
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const payload = {
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
    const updateContactInfo = useProfileFormStore((state) => state.updateContactInfo);
    const updateSummary = useProfileFormStore((state) => state.updateSummary);
    const updateSkills = useProfileFormStore((state) => state.updateSkills);
    const setWorkHistory = useProfileFormStore((state) => state.setWorkHistory);
    const setProjects = useProfileFormStore((state) => state.setProjects);
    const setEducation = useProfileFormStore((state) => state.setEducation);
    const setCertifications = useProfileFormStore((state) => state.setCertifications);

    useEffect(() => {
        setDraft(mapProfileToDraft(profile));
    }, [profile, setDraft]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <MobileNavbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Your profile</h1>
                    <h2>Keep this up to date — the more current your profile, the better your tailored resumes and AI feedback will be.</h2>
                </div>

                {actionData?.error && (
                    <p className="rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">{actionData.error}</p>
                )}
                {actionData?.success && (
                    <p className="rounded-lg bg-badge-green px-4 py-2 text-sm text-badge-green-text">Profile saved.</p>
                )}

                <Form method="post" className="profile-form gradient-border w-full p-6">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <IdCard className="h-5 w-5 text-[#606beb]" />
                        Contact info
                    </h3>
                    <div className="profile-form-grid lg:grid-cols-3">
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

                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <FileText className="h-5 w-5 text-[#606beb]" />
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

                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Sparkles className="h-5 w-5 text-[#606beb]" />
                        Skills
                    </h3>
                    <div className="form-div">
                        <label htmlFor="skills">Skills (comma-separated)</label>
                        <input
                            id="skills"
                            name="skills"
                            value={draft.skills.join(", ")}
                            onChange={(e) =>
                                updateSkills(e.target.value.split(",").map((skill) => skill.trim()))
                            }
                        />
                    </div>

                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Briefcase className="h-5 w-5 text-[#606beb]" />
                        Work history
                    </h3>
                    {draft.workHistory.map((entry, index) => (
                        <div key={index} className="profile-entry-card gradient-border">
                            <div className="profile-form-grid">
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
                                className="secondary-button w-fit"
                                onClick={() => setWorkHistory(removeAt(draft.workHistory, index))}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit"
                        onClick={() => setWorkHistory([...draft.workHistory, emptyWorkHistoryEntry])}
                    >
                        <Plus className="h-4 w-4" />
                        Add work history
                    </button>

                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <FolderKanban className="h-5 w-5 text-[#606beb]" />
                        Projects
                    </h3>
                    {draft.projects.map((entry, index) => (
                        <div key={index} className="profile-entry-card gradient-border">
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
                                className="secondary-button w-fit"
                                onClick={() => setProjects(removeAt(draft.projects, index))}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit"
                        onClick={() => setProjects([...draft.projects, emptyProjectEntry])}
                    >
                        <Plus className="h-4 w-4" />
                        Add project
                    </button>

                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <GraduationCap className="h-5 w-5 text-[#606beb]" />
                        Education
                    </h3>
                    {draft.education.map((entry, index) => (
                        <div key={index} className="profile-entry-card gradient-border">
                            <div className="profile-form-grid">
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
                                className="secondary-button w-fit"
                                onClick={() => setEducation(removeAt(draft.education, index))}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit"
                        onClick={() => setEducation([...draft.education, emptyEducationEntry])}
                    >
                        <Plus className="h-4 w-4" />
                        Add education
                    </button>

                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Award className="h-5 w-5 text-[#606beb]" />
                        Certifications
                    </h3>
                    {draft.certifications.map((entry, index) => (
                        <div key={index} className="profile-entry-card gradient-border">
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
                                className="secondary-button w-fit"
                                onClick={() => setCertifications(removeAt(draft.certifications, index))}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="secondary-button w-fit"
                        onClick={() => setCertifications([...draft.certifications, emptyCertificationEntry])}
                    >
                        <Plus className="h-4 w-4" />
                        Add certification
                    </button>

                    <input type="hidden" name="workHistory" value={JSON.stringify(draft.workHistory)} />
                    <input type="hidden" name="projects" value={JSON.stringify(draft.projects)} />
                    <input type="hidden" name="education" value={JSON.stringify(draft.education)} />
                    <input type="hidden" name="certifications" value={JSON.stringify(draft.certifications)} />

                    <button className="primary-button w-fit" type="submit" disabled={isSubmitting}>
                        <Save className="h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save profile"}
                    </button>
                </Form>
            </section>
        </main>
    );
}
