import { useEffect } from "react";
import { Link, Outlet, redirect, useLocation, useNavigate } from "react-router";
import { Sparkles, UserCog, FileText, LayoutDashboard, Check, X, FileUp, Target, Rocket, MessageCircle, CreditCard, Bug, HelpCircle, Mail } from "lucide-react";
import type { Route } from "./+types/landing";
import { getUser } from "~/lib/session.server";
import ContactForm from "~/components/ContactForm";


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

const steps = [
    {
        title: "Build your profile once",
        description: "Paste your work history, education, and skills — or upload your existing resume as a PDF and let Applyze parse and pre-fill it for you.",
        icon: FileUp,
    },
    {
        title: "Submit a job description",
        description: "Paste the job posting you're applying to. Applyze compares it against your real profile — no invented experience, no generic advice.",
        icon: Target,
    },
    {
        title: "Get your tailored resume & score",
        description: "Download a properly formatted PDF built for that job, plus an instant score covering ATS compatibility, tone, structure, and skills match.",
        icon: Rocket,
    },
];

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

const contactTopics = [
    {
        title: "Subscription & billing",
        description: "Questions about plans, upgrading, downgrading, or an invoice.",
        icon: CreditCard,
    },
    {
        title: "Report a bug",
        description: "Something not working the way it should? Tell us what happened.",
        icon: Bug,
    },
    {
        title: "General questions",
        description: "Not sure where to start, or curious how a feature works.",
        icon: HelpCircle,
    },
];

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        detail: "3 AI resume analyses per month",
        cta: "Get started free",
        highlight: false,
    },
    {
        name: "Pro Monthly",
        price: "$9",
        period: "/mo",
        detail: "Unlimited AI analyses, billed monthly. Cancel anytime.",
        cta: "Get started",
        highlight: false,
    },
    {
        name: "Pro Yearly",
        price: "$79",
        period: "/yr",
        detail: "Unlimited AI analyses, billed yearly. Save ~27% vs. monthly.",
        cta: "Get started",
        highlight: true,
        badge: "Best value",
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
            <nav className="navbar max-sm:mx-4 max-sm:w-auto max-sm:px-4 pr-5">
                <Link to="/">
                    <p className="text-2xl font-bold text-gradient max-sm:text-lg">APPLYZE</p>
                </Link>
                <div className="flex items-center gap-3 max-sm:gap-1.5">
                    <a href="#pricing" className="secondary-button hidden sm:inline-flex">Pricing</a>
                    <Link to="/login" className="secondary-button max-sm:px-3 max-sm:py-1.5 max-sm:text-xs">Log in</Link>
                    <Link to="/signup" className="primary-button w-fit max-sm:px-3 max-sm:py-1.5 max-sm:text-xs">Get started free</Link>
                </div>
            </nav>

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1 className="max-sm:text-4xl">Land your next job with <br className="hidden sm:inline" />AI-grounded resume feedback</h1>
                    <h2>
                        Maintain one master profile, generate a tailored resume for every application, and get an
                        AI-powered fit &amp; ATS report grounded in your real experience — not invented qualifications.
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link to="/signup" className="primary-button w-fit">Get started free</Link>
                        <a href="#pricing" className="secondary-button w-fit">See pricing</a>
                    </div>
                    <p className="text-sm text-dark-200">No credit card required to start &middot; 3 free AI analyses every month</p>
                </div>

                <div className="w-full max-w-300">
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl font-semibold">How Applyze works</h3>
                        <p className="text-dark-200">Three steps between your resume and your next interview.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={step.title} className="gradient-border flex flex-col gap-2 p-6">
                                <div className="flex items-center gap-2">
                                    <step.icon className="h-6 w-6 text-[#606beb]" />
                                    <span className="text-sm font-semibold text-dark-200">Step {index + 1}</span>
                                </div>
                                <h3 className="text-xl font-semibold">{step.title}</h3>
                                <p className="text-dark-200">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-300 pt-16">
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl font-semibold">Everything you need to apply with confidence</h3>
                        <p className="text-dark-200">One profile. Unlimited tailored resumes. Real, grounded feedback.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="gradient-border flex flex-col gap-2 p-6 max-sm:bg-none max-sm:bg-white/70">
                                <div className="flex items-center gap-2">
                                    <feature.icon className="h-6 w-6 shrink-0 text-[#606beb]" />
                                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                                </div>
                                <p className="text-dark-200">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div id="pricing" className="page-heading pt-16">
                    <h1 className="text-4xl!">Simple, transparent pricing</h1>
                    <h2>Start free. Upgrade when you're applying to more than a few jobs a month.</h2>
                </div>
                <div className="w-full max-w-300">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`gradient-border relative flex flex-col items-center gap-3 p-8 text-center ${plan.highlight ? "border-[#606beb]" : ""}`}
                            >
                                {plan.badge && (
                                    <span className="absolute -top-3 rounded-full bg-[#606beb] px-3 py-1 text-xs font-semibold text-white">
                                        {plan.badge}
                                    </span>
                                )}
                                <h3 className="text-xl font-semibold">{plan.name}</h3>
                                <p className="text-3xl font-semibold">
                                    {plan.price}
                                    <span className="text-base font-normal text-dark-200"> {plan.period}</span>
                                </p>
                                <p className="flex items-center gap-2 text-dark-200">
                                    <Check className="h-4 w-4 shrink-0 text-[#606beb]" />
                                    {plan.detail}
                                </p>
                                <Link to="/signup" className="primary-button w-fit">{plan.cta}</Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="gradient-border mt-16 flex w-full max-w-300 flex-col items-center gap-4 p-10 text-center">
                    <h3 className="text-2xl font-semibold">Ready to send a resume you're confident in?</h3>
                    <p className="text-dark-200">Create your profile in minutes and get your first AI-grounded resume score for free.</p>
                    <Link to="/signup" className="primary-button w-fit">Get started free</Link>
                </div>

                <div className="grid w-full max-w-300 grid-cols-1 gap-10 pt-16 lg:grid-cols-2">
                    <div className="flex flex-col gap-6 max-sm:items-center max-sm:text-center">
                        <div className="flex flex-col gap-3 max-sm:items-center">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-8 w-8 shrink-0 text-[#606beb]" />
                                <h3 className="text-2xl font-semibold">Still have questions?</h3>
                            </div>
                            <p className="text-dark-200">
                                Whether it's about pricing, a bug you've run into, or just how Applyze works — send us a
                                message and we'll get back to you.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 max-sm:items-center">
                            {contactTopics.map((topic) => (
                                <div key={topic.title} className="flex flex-col gap-1 max-sm:max-w-xs max-sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <topic.icon className="h-5 w-5 shrink-0 text-[#606beb]" />
                                        <p className="font-semibold">{topic.title}</p>
                                    </div>
                                    <p className="text-sm text-dark-200">{topic.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                            <Mail className="h-5 w-5 shrink-0 text-[#606beb]" />
                            <p className="text-sm text-dark-200">
                                Prefer email? Write to us directly at{" "}
                                <a href="mailto:support@applyze.pro" className="font-semibold text-black hover:underline">
                                    support@applyze.pro
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="h-fit">
                        <ContactForm idPrefix="landing-" />
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="relative">
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
