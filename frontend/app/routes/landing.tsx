import { useEffect } from "react";
import { Link, Outlet, redirect, useLocation, useNavigate } from "react-router";
import { Sparkles, UserCog, FileText, LayoutDashboard, Check, X } from "lucide-react";
import type { Route } from "./+types/landing";
import { getUser } from "~/lib/session.server";


export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUser(request);
    if (user) {
        throw redirect("/dashboard");
    }
    return null;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Applyze — AI resume feedback & application tracker" },
        { name: "description", content: "Track your job applications and get AI-generated, RAG-grounded resume feedback for every one." },
    ];
}

const features = [
    {
        title: "AI resume scoring",
        description: "Submit a resume and job description and get an instant AI-generated score covering ATS compatibility, tone, content, structure, and skills match.",
        icon: Sparkles,
    },
    {
        title: "Build your profile your way",
        description: "Paste your introduction, work history, education, skills, and projects directly — or upload your existing resume as a PDF and have it parsed and pre-filled automatically.",
        icon: UserCog,
    },
    {
        title: "A tailored PDF for every job",
        description: "Applyze generates a dedicated, properly formatted resume PDF for each job description you submit — ready to download.",
        icon: FileText,
    },
    {
        title: "A page for every application",
        description: "Every generated resume gets its own page with its score, feedback, and download link. See them all listed by job application and date on your dashboard.",
        icon: LayoutDashboard,
    },
];

const plans = [
    {
        name: "Free",
        price: "$0",
        detail: "3 AI analyses per month",
    },
    {
        name: "Pro",
        price: "$9/mo",
        detail: "Unlimited AI analyses, billed monthly or ~$79/yr",
    },
];

export default function Landing() {

    const location = useLocation();
    const navigate = useNavigate();
    const isModalOpen = location.pathname === "/login" || location.pathname === "/signup";

    useEffect(() => {
        if (!isModalOpen) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") navigate("/");
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, navigate]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <nav className="navbar">
                <Link to="/">
                    <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                </Link>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="secondary-button">Log in</Link>
                    <Link to="/signup" className="primary-button w-fit">Get started free</Link>
                </div>
            </nav>

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Land your next job with <br />AI-grounded resume feedback</h1>
                    <h2>
                        Maintain one master profile, generate tailored resumes for every application, and get an
                        AI-powered fit &amp; ATS report grounded in your real experience — not invented qualifications.
                    </h2>
                    <Link to="/signup" className="primary-button w-fit">Get started free</Link>
                </div>

                <div className="w-full max-w-[1200px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="gradient-border flex flex-col gap-2 p-6">
                                <feature.icon className="h-6 w-6 text-[#606beb]" />
                                <h3 className="text-xl font-semibold">{feature.title}</h3>
                                <p className="text-dark-200">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="page-heading pt-16">
                    <h1 className="text-4xl!">Simple pricing</h1>
                </div>
                <div className="w-full max-w-[700px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.name} className="gradient-border flex flex-col items-center gap-3 p-8 text-center">
                                <h3 className="text-xl font-semibold">{plan.name}</h3>
                                <p className="text-3xl font-semibold">{plan.price}</p>
                                <p className="flex items-center gap-2 text-dark-200">
                                    <Check className="h-4 w-4 shrink-0 text-[#606beb]" />
                                    {plan.detail}
                                </p>
                                <Link to="/signup" className="primary-button w-fit">Get started</Link>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="pt-16 pb-8 text-dark-200 text-sm">
                    &copy; {new Date().getFullYear()} Applyze. All rights reserved.
                </footer>
            </section>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={() => navigate("/")}
                >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <Outlet />
                    </div>
                </div>
            )}

        </main>
    );
}
