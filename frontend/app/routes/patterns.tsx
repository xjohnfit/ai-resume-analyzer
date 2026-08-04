import { GraduationCap, ListChecks } from "lucide-react";
import type { Route } from "./+types/patterns";
import Navbar from "~/components/Navbar";
import MobileNavbar from "~/components/MobileNavbar";
import { recurringPatterns, recommendedTechnologies, learningRoadmap } from "~/constants";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return { user };
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Recurring Patterns — Applyze" }];
}

export default function Patterns() {
    const sortedPatterns = [...recurringPatterns].sort((a, b) => b.frequency - a.frequency);
    const sortedRoadmap = [...learningRoadmap].sort((a, b) => a.order - b.order);
    const totalApplications = 13;

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <MobileNavbar />
            <section className="main-section items-stretch">
                <div className="w-full max-w-300 mx-auto">
                    <h1 className="dashboard-title md:text-3xl tracking-wide">Recurring Patterns Worth Knowing</h1>
                    <p className="dashboard-subtitle">Your biggest recurring technical gaps across applications, ranked by how often they show up.</p>
                </div>

                <article className="patterns-letter gradient-border">
                    <p>
                        We looked across all {totalApplications} of your applications to find the gaps that keep
                        coming up more than once — the kind of thing that's worth addressing before your next
                        round of applications, rather than after another rejection points it out.
                    </p>

                    <h2>Where the gaps keep showing up</h2>
                    <div className="patterns-letter-section">
                        {sortedPatterns.map((pattern) => (
                            <p key={pattern.id}>
                                <strong>{pattern.title}</strong> came up in{" "}
                                {pattern.frequency} application{pattern.frequency === 1 ? "" : "s"} — at{" "}
                                {pattern.companies.join(", ")}. {pattern.note}
                            </p>
                        ))}
                    </div>

                    <h2 className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-dark-200" />
                        Technologies to Study
                    </h2>
                    <div className="patterns-letter-section">
                        <p>
                            Of the gaps above, these are the ones worth actively studying for — the rest are
                            either hard eligibility requirements or too broad to "study" your way into directly.
                        </p>
                        {recommendedTechnologies.map((tech) => (
                            <p key={tech.id}>
                                <strong>{tech.name}</strong> — {tech.reason}
                            </p>
                        ))}
                    </div>

                    <h2 className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-dark-200" />
                        Learning Roadmap
                    </h2>
                    <div className="patterns-letter-section">
                        <p>Tackle these in order — each step is sequenced by how much it unblocks and how self-contained it is to finish.</p>
                        <ol className="patterns-roadmap-list">
                            {sortedRoadmap.map((step) => (
                                <li key={step.id}>
                                    <strong>{step.title}.</strong> {step.description}
                                </li>
                            ))}
                        </ol>
                    </div>
                </article>
            </section>
        </main>
    );
}
