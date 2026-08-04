import { Link } from "react-router";
import { Mail } from "lucide-react";
import type { Route } from "./+types/contact";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Contact — Applyze" }];
}

const SUPPORT_EMAIL = "support@applyze.pro";

export default function Contact() {
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <nav className="navbar">
                <Link to="/">
                    <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                </Link>
            </nav>

            <section className="main-section items-center justify-center">
                <div className="gradient-border flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
                    <Mail className="h-8 w-8 text-[#606beb]" />
                    <h1 className="text-2xl! font-semibold">Get in touch</h1>
                    <p className="text-dark-200">
                        Questions, feedback, or something not working right? Reach out and we'll get back to you.
                    </p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="primary-button w-fit">
                        {SUPPORT_EMAIL}
                    </a>
                </div>
            </section>
        </main>
    );
}
