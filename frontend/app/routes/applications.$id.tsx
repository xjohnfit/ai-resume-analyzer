import { useState } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { ArrowLeft, ChevronDown, Download, Eye, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Route } from "./+types/applications.$id";
import Navbar from "~/components/Navbar";
import MobileNavbar from "~/components/MobileNavbar";
import ScoreCircle from "~/components/ScoreCircle";
import AnalyzingModal from "~/components/AnalyzingModal";
import Modal from "~/components/Modal";
import PdfPreview from "~/components/PdfPreview.client";
import { statusBadgeClasses, statusLabel } from "~/components/ResumeCard";
import { apiFetch, apiFetchWithAuthRetry } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";

const categoryOrder: { key: keyof Omit<Feedback, "overallScore">; label: string; bgClass: string }[] = [
    { key: "ATS", label: "ATS Compatibility", bgClass: "bg-violet-100" },
    { key: "toneAndStyle", label: "Tone & Style", bgClass: "bg-indigo-100" },
    { key: "content", label: "Content", bgClass: "bg-sky-100" },
    { key: "structure", label: "Structure", bgClass: "bg-teal-100" },
    { key: "skills", label: "Skills", bgClass: "bg-purple-100" },
];

export async function loader({ request, params }: Route.LoaderArgs) {
    await requireUser(request);

    const applicationResponse = await apiFetch(request, `/api/applications/${params.id}`);
    if (applicationResponse.status === 404) {
        throw new Response("Application not found", { status: 404 });
    }
    if (!applicationResponse.ok) {
        throw new Response("Failed to load application", { status: 500 });
    }
    const application: Application = await applicationResponse.json();

    let feedback: FeedbackReport | null = null;
    if (application.currentFeedbackReportId) {
        const feedbackResponse = await apiFetch(request, `/api/applications/${params.id}/feedback`);
        feedback = feedbackResponse.ok ? await feedbackResponse.json() : null;
    }

    return { application, feedback };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "updateStatus") {
        const { response, refreshedCookies } = await apiFetchWithAuthRetry(
            request,
            `/api/applications/${params.id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: formData.get("status") }),
            },
        );

        const headers = new Headers();
        for (const cookie of refreshedCookies) {
            headers.append("Set-Cookie", cookie);
        }

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            return Response.json({ error: body.error ?? "Failed to update status. Please try again." }, { headers });
        }
        return Response.json({ success: true }, { headers });
    }

    const { response, refreshedCookies } = await apiFetchWithAuthRetry(
        request,
        `/api/applications/${params.id}/analyze`,
        { method: "POST" },
    );

    const headers = new Headers();
    for (const cookie of refreshedCookies) {
        headers.append("Set-Cookie", cookie);
    }

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return Response.json({ error: body.error ?? "Analysis failed. Please try again." }, { headers });
    }
    return Response.json({ success: true }, { headers });
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Application — Applyze" }];
}

export default function ApplicationDetail({ loaderData }: Route.ComponentProps) {
    const { application, feedback } = loaderData;
    const [searchParams] = useSearchParams();
    const analyzeError = searchParams.get("analyzeError");
    // Typed explicitly rather than inferred from `typeof action` — the action now
    // returns a Response (to carry Set-Cookie headers on a silent token refresh), which
    // loses the plain-object type inference `useFetcher` relies on.
    const fetcher = useFetcher<{ error?: string; success?: boolean }>();
    const isAnalyzing = fetcher.state !== "idle";
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const statusFetcher = useFetcher<{ error?: string; success?: boolean }>();
    const isUpdatingStatus = statusFetcher.state !== "idle";
    const statusOptions: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <MobileNavbar />
            <section className="main-section items-stretch">
                <div className="w-full max-w-300 mx-auto flex flex-col gap-6">
                    <Link to="/dashboard" className="back-button w-fit">
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </Link>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-black! text-2xl font-semibold">{application.companyName}</h1>
                                <div className="relative w-fit">
                                    <select
                                        value={application.status}
                                        disabled={isUpdatingStatus}
                                        onChange={(e) =>
                                            statusFetcher.submit(
                                                { intent: "updateStatus", status: e.target.value },
                                                { method: "post" },
                                            )
                                        }
                                        aria-label="Application status"
                                        className={`w-fit appearance-none rounded-full py-1 pr-8 pl-3 text-sm font-medium focus:outline-none ${statusBadgeClasses[application.status]}`}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {statusLabel[status]}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />
                                </div>
                            </div>
                            {statusFetcher.data?.error && (
                                <p className="text-xs text-badge-red-text">{statusFetcher.data.error}</p>
                            )}
                            <h2 className="text-base text-gray-500">{application.jobTitle}</h2>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                            <fetcher.Form method="post" className="w-fit">
                                <button
                                    className="secondary-button w-fit border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
                                    type="submit"
                                    disabled={isAnalyzing}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                                    {isAnalyzing
                                        ? "Analyzing…"
                                        : feedback
                                            ? "Re-run analysis"
                                            : "Run analysis"}
                                </button>
                            </fetcher.Form>
                            {application.currentDocumentId && (
                                <>
                                    <button
                                        type="button"
                                        className="secondary-button w-fit border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
                                        onClick={() => setIsPreviewOpen(true)}
                                    >
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </button>
                                    <a
                                        href={`/documents/${application.currentDocumentId}/download`}
                                        className="primary-button w-fit"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download tailored resume
                                    </a>
                                </>
                            )}
                            {feedback && <ScoreCircle score={feedback.overallScore} size={72} />}
                        </div>
                    </div>

                    {(analyzeError || fetcher.data?.error) && (
                        <p className="rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">
                            {fetcher.data?.error ?? analyzeError}
                        </p>
                    )}

                    <div className="profile-category-card bg-blue-100">
                        <h3 className="text-base font-semibold">Job description</h3>
                        <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-dark-200">
                            {application.jobDescriptionText}
                        </p>
                    </div>

                    {feedback ? (
                        <div className="flex flex-col gap-4">
                            {categoryOrder.map(({ key, label, bgClass }) => {
                                const category = feedback[key];
                                return (
                                    <div key={key} className={`profile-category-card ${bgClass}`}>
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-base font-semibold">{label}</h3>
                                            <span className="text-sm font-semibold text-dark-200">{category.score}/100</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {category.tips.map((tip, i) => (
                                                <div key={i} className="profile-entry-card">
                                                    <div className="flex items-start gap-2">
                                                        {tip.type === "good" ? (
                                                            <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-badge-green-text" />
                                                        ) : (
                                                            <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-badge-yellow-text" />
                                                        )}
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="text-sm font-semibold">{tip.tip}</p>
                                                            <p className="text-xs text-dark-200">{tip.explanation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        !isAnalyzing && (
                            <div className="empty-state gradient-border">
                                <p className="text-dark-200">
                                    This application hasn't been analyzed yet. Run an analysis to get a fit score,
                                    ATS feedback, and a resume tailored to this job description.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </section>

            <AnalyzingModal active={isAnalyzing} />

            {application.currentDocumentId && (
                <Modal
                    open={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    title="Resume preview"
                    maxWidth="max-w-4xl"
                >
                    <PdfPreview url={`/documents/${application.currentDocumentId}/download`} />
                </Modal>
            )}
        </main>
    );
}
