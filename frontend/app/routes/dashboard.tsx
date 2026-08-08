import { useState } from "react";
import { Link } from "react-router";
import { Briefcase, TrendingUp, Inbox, Sparkles } from "lucide-react";
import type { Route } from "./+types/dashboard";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import ResumeCard from "~/components/ResumeCard";
import { requireUser } from "~/lib/session.server";
import { apiFetch } from "~/lib/api.server";

type Tab = "all" | ApplicationStatus;

const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "saved", label: "Saved" },
    { key: "applied", label: "Applied" },
    { key: "interviewing", label: "Interviewing" },
    { key: "offer", label: "Offer" },
    { key: "rejected", label: "Rejected" },
    { key: "withdrawn", label: "Withdrawn" },
];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const applicationsResponse = await apiFetch(request, "/api/applications");
    const applications: Application[] = applicationsResponse.ok ? await applicationsResponse.json() : [];

    // Application doesn't embed its score — fetch each analyzed application's
    // FeedbackReport in parallel so cards can show a score without an extra round trip per click.
    const scoreEntries = await Promise.all(
        applications
            .filter((application) => application.currentFeedbackReportId)
            .map(async (application) => {
                const response = await apiFetch(request, `/api/applications/${application._id}/feedback`);
                if (!response.ok) return null;
                const feedback: FeedbackReport = await response.json();
                return [application._id, feedback.overallScore] as const;
            }),
    );

    const scores = Object.fromEntries(
        scoreEntries.filter((entry): entry is readonly [string, number] => entry !== null),
    );

    return { user, applications, scores };
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard | Applyze" },
        { name: "description", content: "Smart feedback for your dream job." },
    ];
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const { user, applications, scores } = loaderData;
    const [activeTab, setActiveTab] = useState<Tab>("all");

    const scoredApplications = applications.filter((application) => scores[application._id] !== undefined);
    const averageScore = scoredApplications.length > 0
        ? Math.round(
            scoredApplications.reduce((sum, application) => sum + scores[application._id], 0) / scoredApplications.length,
        )
        : 0;

    const filteredApplications = activeTab === "all"
        ? applications
        : applications.filter((application) => application.status === activeTab);

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <MobileNavbar/>
        <section className="main-section items-stretch">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title md:text-3xl">Welcome back, {user.name}</h1>
                    <p className="dashboard-subtitle">Review your submissions and check AI-powered feedback.</p>
                    {applications.length > 0 && (
                        <p className="dashboard-stats-inline">
                            <Briefcase className="h-3.5 w-3.5" />
                            {applications.length} application{applications.length === 1 ? "" : "s"}
                            {scoredApplications.length > 0 && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {averageScore} avg. score
                                </>
                            )}
                        </p>
                    )}
                    {applications.length > 0 && (
                        <div className="dashboard-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`tab-button ${activeTab === tab.key ? "tab-button-active" : ""}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Link to="/applications/new" className="primary-button w-fit shrink-0">
                    Start New Analysis
                </Link>
            </div>

            {applications.length > 0 ? (
                <div className="w-full max-w-300 mx-auto">
                    <div className="resumes-section">
                        {filteredApplications.map((application) => (
                            <ResumeCard
                                key={application._id}
                                application={application}
                                overallScore={scores[application._id]}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#606beb]/10">
                        <Inbox className="h-7 w-7 text-[#606beb]" />
                    </div>
                    <h3 className="text-xl font-semibold">No applications yet</h3>
                    <p className="text-dark-200">Start a new analysis with a job description to get your first tailored resume and AI-powered fit report.</p>
                    <Link to="/applications/new" className="primary-button w-fit">
                        <Sparkles className="h-4 w-4" />
                        Start New Analysis
                    </Link>
                </div>
            )}

        </section>
    </main>
}
