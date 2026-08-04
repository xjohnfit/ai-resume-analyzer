import { Link, useLoaderData } from "react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Route } from "./+types/verify-email";
import { apiFetch } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
        return { success: false };
    }

    const response = await apiFetch(request, "/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    });

    return { success: response.ok };
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Verify email — Applyze" }];
}

export default function VerifyEmail() {
    const { success } = useLoaderData<typeof loader>();

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <section className="main-section items-center justify-center">
                <div className="gradient-border flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
                    <Link to="/">
                        <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                    </Link>
                    {success ? (
                        <>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                            <h1 className="text-2xl! font-semibold">Email verified</h1>
                            <p className="text-dark-200">Your email address has been confirmed.</p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-8 w-8 text-badge-red-text" />
                            <h1 className="text-2xl! font-semibold">Verification failed</h1>
                            <p className="text-dark-200">This link is invalid or has expired. You can request a new one from your account settings.</p>
                        </>
                    )}
                    <Link to="/dashboard" className="primary-button w-fit">Go to dashboard</Link>
                </div>
            </section>
        </main>
    );
}
