import { Form, Link, useActionData, useNavigation } from "react-router";
import { Mail } from "lucide-react";
import type { Route } from "./+types/forgot-password";
import { apiFetch } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "");

    const response = await apiFetch(request, "/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        return { submitted: false, error: "Please enter a valid email address." };
    }

    return { submitted: true };
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Forgot password — Applyze" }];
}

export default function ForgotPassword() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <section className="main-section items-center justify-center">
                <div className="gradient-border flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
                    <Link to="/">
                        <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                    </Link>

                    {actionData?.submitted ? (
                        <>
                            <Mail className="h-8 w-8 text-[#606beb]" />
                            <h1 className="text-2xl! font-semibold">Check your email</h1>
                            <p className="text-dark-200">If that email is registered, we've sent a link to reset your password. It expires in 1 hour.</p>
                            <Link to="/login" className="primary-button w-fit">Back to log in</Link>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl! font-semibold">Forgot your password?</h1>
                            <p className="text-dark-200">Enter your email and we'll send you a link to reset it.</p>

                            {actionData?.error && (
                                <p className="w-full rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">{actionData.error}</p>
                            )}

                            <Form method="post" className="flex w-full flex-col gap-4 text-left">
                                <div className="form-div">
                                    <label htmlFor="email">Email</label>
                                    <input id="email" name="email" type="email" required />
                                </div>
                                <button className="auth-button" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send reset link"}
                                </button>
                            </Form>

                            <p className="text-dark-200">
                                Remembered it?{" "}
                                <Link to="/login" className="font-semibold text-black">Log in</Link>
                            </p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
