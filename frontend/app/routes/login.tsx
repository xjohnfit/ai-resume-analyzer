import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { apiFetch } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
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

  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }

  return redirect("/", { headers });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Log in</h1>

        {actionData?.error && <p className="mb-4 text-red-500">{actionData.error}</p>}

        <Form method="post" className="flex flex-col gap-4">
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </Form>
      </div>
    </main>
  );
}
