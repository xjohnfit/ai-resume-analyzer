import { MessageCircle } from "lucide-react";
import type { Route } from "./+types/contact";
import Navbar from "~/components/Navbar";
import MobileNavbar from "~/components/MobileNavbar";
import ContactForm from "~/components/ContactForm";
import { getUser } from "~/lib/session.server";
import { apiFetch } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUser(request);
    return { isAuthenticated: Boolean(user) };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        category: formData.get("category"),
        message: formData.get("message"),
    };

    const response = await apiFetch(request, "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return { success: false, error: "We couldn't send your message. Please try again." };
    }

    return { success: true };
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Contact — Applyze" }];
}

export default function Contact({ loaderData }: Route.ComponentProps) {
    const { isAuthenticated } = loaderData;

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar isAuthenticated={isAuthenticated} />
            <MobileNavbar isAuthenticated={isAuthenticated} />

            <section className="main-section items-center justify-center">
                <div className="flex w-full max-w-lg flex-col gap-4 p-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-8 w-8 shrink-0 text-[#606beb]" />
                            <h1 className="text-2xl! font-semibold">Get in touch</h1>
                        </div>
                        <p className="text-dark-200">
                            Questions, feedback, or something not working right? <br /> Fill out the form below and we'll get back to you.
                        </p>
                    </div>

                    <ContactForm />
                </div>
            </section>
        </main>
    );
}
