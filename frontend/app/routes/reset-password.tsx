import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/reset-password";
import { apiFetch } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    return { token };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const token = String(formData.get("token") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
        return { error: "Passwords don't match." };
    }

    const response = await apiFetch(request, "/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : "This link is invalid or has expired.";
        return { error: message };
    }

    return redirect("/login");
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Reset password — Applyze" }];
}

export default function ResetPassword() {
    const { token } = useLoaderData<typeof loader>();
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

                    {!token ? (
                        <>
                            <h1 className="text-2xl! font-semibold">Invalid link</h1>
                            <p className="text-dark-200">This password reset link is missing its token. Request a new one below.</p>
                            <Link to="/forgot-password" className="primary-button w-fit">Request a new link</Link>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl! font-semibold">Set a new password</h1>
                            <p className="text-dark-200">Choose a new password for your account.</p>

                            {actionData?.error && (
                                <p className="w-full rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">{actionData.error}</p>
                            )}

                            <Form method="post" className="flex w-full flex-col gap-4 text-left">
                                <input type="hidden" name="token" value={token} />
                                <div className="form-div">
                                    <label htmlFor="newPassword">New password</label>
                                    <input id="newPassword" name="newPassword" type="password" minLength={8} required />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="confirmPassword">Confirm new password</label>
                                    <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
                                </div>
                                <button className="auth-button" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Resetting..." : "Reset password"}
                                </button>
                            </Form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
