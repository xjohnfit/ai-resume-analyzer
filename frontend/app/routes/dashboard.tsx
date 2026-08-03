import { useState } from "react";
import { Link } from "react-router";
import { Briefcase, TrendingUp, Inbox, Sparkles } from "lucide-react";
import type { Route } from "./+types/dashboard";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { resumes } from "~/constants";
import ResumeCard from "~/components/ResumeCard";
import { requireUser } from "~/lib/session.server";

type Tab = "all" | ApplicationStatus;

const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live" },
    { key: "rejected", label: "Rejected" },
    { key: "sent", label: "Built & Sent" },
    { key: "skipped", label: "Skipped" },
];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return { user };
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard | Applyze" },
        { name: "description", content: "Smart feedback for your dream job." },
    ];
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    const [activeTab, setActiveTab] = useState<Tab>("all");

    const averageScore = resumes.length > 0
        ? Math.round(resumes.reduce((sum, r) => sum + r.feedback.overallScore, 0) / resumes.length)
        : 0;

    const filteredResumes = activeTab === "all"
        ? resumes
        : resumes.filter((resume) => resume.status === activeTab);

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <MobileNavbar/>
        <section className="main-section items-stretch">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title md:text-3xl">Welcome back, {user.name}</h1>
                    <p className="dashboard-subtitle">Review your submissions and check AI-powered feedback.</p>
                    {resumes.length > 0 && (
                        <p className="dashboard-stats-inline">
                            <Briefcase className="h-3.5 w-3.5" />
                            {resumes.length} application{resumes.length === 1 ? "" : "s"}
                            <span aria-hidden="true">·</span>
                            <TrendingUp className="h-3.5 w-3.5" />
                            {averageScore} avg. score
                        </p>
                    )}
                    {resumes.length > 0 && (
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

            {resumes.length > 0 ? (
                <div className="w-full max-w-300 mx-auto">
                    <div className="resumes-section">
                        {filteredResumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume}/>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="empty-state gradient-border">
                    <Inbox className="h-10 w-10 text-[#606beb]" />
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
