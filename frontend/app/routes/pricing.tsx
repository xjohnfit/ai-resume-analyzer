import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/pricing";
import { apiFetch } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const plan = String(formData.get("plan") ?? "");

  const response = await apiFetch(request, "/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  const result = await response.json();

  if (!response.ok) {
    const message = typeof result.error === "string" ? result.error : "Something went wrong. Please try again.";
    return { error: message };
  }

  return redirect(result.url);
}

export default function Pricing() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-6 text-2xl font-semibold">Choose your plan</h1>

        {actionData?.error && <p className="mb-4 text-red-500">{actionData.error}</p>}

        <div className="flex flex-col gap-4">
          <Form method="post">
            <input type="hidden" name="plan" value="monthly" />
            <button className="auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Redirecting..." : "Monthly — $9/mo"}
            </button>
          </Form>
          <Form method="post">
            <input type="hidden" name="plan" value="yearly" />
            <button className="auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Redirecting..." : "Yearly — $79/yr"}
            </button>
          </Form>
        </div>
      </div>
    </main>
  );
}
