import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import Navbar from "../components/Navbar";
import { resumes } from "~/constants";
import ResumeCard from "~/components/ResumeCard";
import { requireUser } from "~/lib/session.server";

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

    const averageScore = resumes.length > 0
        ? Math.round(resumes.reduce((sum, r) => sum + r.feedback.overallScore, 0) / resumes.length)
        : 0;

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Track your applications and resume ratings</h1>
                <h2>Welcome back, {user.name}. Review your submissions and check AI-powered feedback</h2>
            </div>

            {resumes.length > 0 && (
                <div className="stats-row">
                    <div className="stat-tile gradient-border">
                        <span className="stat-tile-value">{resumes.length}</span>
                        <span className="stat-tile-label">Applications</span>
                    </div>
                    <div className="stat-tile gradient-border">
                        <span className="stat-tile-value">{averageScore}</span>
                        <span className="stat-tile-label">Average score</span>
                    </div>
                </div>
            )}

            {resumes.length > 0 ? (
                <div className="w-full max-w-[1850px]">
                    <h3 className="mb-4 text-xl font-semibold text-dark-200">Your applications</h3>
                    <div className="resumes-section">
                        {
                            resumes.map((resume) => (
                                <ResumeCard key={resume.id} resume={resume}/>
                            ))
                        }
                    </div>
                </div>
            ) : (
                <div className="empty-state gradient-border">
                    <h3 className="text-xl font-semibold">No applications yet</h3>
                    <p className="text-dark-200">Upload a resume and job description to get your first AI-powered fit report.</p>
                    <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
                </div>
            )}

        </section>
    </main>
}
