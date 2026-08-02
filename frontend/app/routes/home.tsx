import type { Route } from "./+types/home";
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
        { title: "Applyze" },
        { name: "description", content: "Smart feedback for your dream job." },
    ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Track your applications and resume Ratings</h1>
                <h2>Welcome back, {user.name}. Review your submissions and check AI-powered feedback</h2>
            </div>

            {resumes.length > 0 && (
                <div className="resumes-section">
                    {
                        resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume}/>
                        ))
                    }
                </div>
            )}

        </section>
    </main>
}
