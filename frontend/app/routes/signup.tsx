import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/signup";
import { apiFetch } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const body = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        name: String(formData.get("name") ?? ""),
    };

    const response = await apiFetch(request, "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : "Please check your info and try again";
        return { error: message };
    }

    const headers = new Headers();
    for (const cookie of response.headers.getSetCookie()) {
        headers.append("Set-Cookie", cookie);
    }

    return redirect("/dashboard", { headers });
}

export default function Signup() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="auth-card">
            <div className="flex flex-col gap-2 text-center">
                <Link to="/">
                    <p className="text-2xl font-bold text-gradient">APPLYZE</p>
                </Link>
                <h1 className="text-2xl font-semibold">Create your account</h1>
                <p className="text-dark-200">Track applications and get AI-powered resume feedback.</p>
            </div>

            {actionData?.error && (
                <p className="rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">{actionData.error}</p>
            )}

            <Form method="post" className="flex flex-col gap-4">
                <div className="form-div">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" required />
                </div>
                <div className="form-div">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required />
                </div>
                <div className="form-div">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required minLength={8} />
                </div>
                <button className="auth-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Sign up"}
                </button>
            </Form>

            <p className="text-center text-dark-200">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-black">
                    Log in
                </Link>
            </p>
        </div>
    );

}
