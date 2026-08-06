import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { apiFetch } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const challengeToken = formData.get("challengeToken");

    if (challengeToken) {
        const code = String(formData.get("code") ?? "");

        const response = await apiFetch(request, "/api/auth/mfa/verify-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challengeToken: String(challengeToken), code }),
        });

        const result = await response.json();

        if (!response.ok) {
            const message = typeof result.error === "string" ? result.error : "Please check your code and try again.";
            return { error: message, challengeToken: String(challengeToken) };
        }

        const headers = new Headers();
        for (const cookie of response.headers.getSetCookie()) {
            headers.append("Set-Cookie", cookie);
        }

        return redirect("/dashboard", { headers });
    }

    const body = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
    };

    const response = await apiFetch(request, "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : "Please check your info and try again.";
        return { error: message };
    }

    if (result.mfaRequired) {
        return { mfaRequired: true, challengeToken: result.challengeToken as string };
    }

    const headers = new Headers();
    for (const cookie of response.headers.getSetCookie()) {
        headers.append("Set-Cookie", cookie);
    }

    return redirect("/dashboard", { headers });
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const challengeToken = actionData && "challengeToken" in actionData ? actionData.challengeToken : undefined;

    if (challengeToken) {
        return (
            <div className="auth-card">
                <div className="flex flex-col gap-2 text-center">
                    <Link to="/">
                        <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                    </Link>
                    <h1 className="text-2xl font-semibold">Enter your code</h1>
                    <p className="text-dark-200">We texted a 6-digit code to your phone.</p>
                </div>

                {actionData?.error && (
                    <p className="rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">{actionData.error}</p>
                )}

                <Form method="post" className="flex flex-col gap-4">
                    <input type="hidden" name="challengeToken" value={challengeToken} />
                    <input
                        type="text"
                        name="fakeusernameremembered"
                        autoComplete="off"
                        tabIndex={-1}
                        aria-hidden="true"
                        style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
                    />
                    <input
                        type="password"
                        name="fakepasswordremembered"
                        autoComplete="off"
                        tabIndex={-1}
                        aria-hidden="true"
                        style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
                    />
                    <div className="form-div">
                        <label htmlFor="code">Code</label>
                        <input id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" required />
                    </div>
                    <button className="auth-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Verifying..." : "Verify & log in"}
                    </button>
                </Form>
            </div>
        );
    }

    return (
        <div className="auth-card">
            <div className="flex flex-col gap-2 text-center">
                <Link to="/">
                    <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                </Link>
                <h1 className="text-2xl font-semibold">Log in</h1>
                <p className="text-dark-200">Welcome back — enter your details to continue.</p>
            </div>

            {actionData?.error && (
                <p className="rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">{actionData.error}</p>
            )}

            <Form method="post" className="flex flex-col gap-4">
                <div className="form-div">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required />
                </div>
                <div className="form-div">
                    <div className="flex w-full items-center justify-between">
                        <label htmlFor="password">Password</label>
                        <Link to="/forgot-password" className="text-sm font-semibold text-black">
                            Forgot password?
                        </Link>
                    </div>
                    <input id="password" name="password" type="password" required />
                </div>

                <button className="auth-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log in"}
                </button>
            </Form>

            <p className="text-center text-dark-200">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-semibold text-black">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
