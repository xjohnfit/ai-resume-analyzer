import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/billing";
import { apiFetch } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const response = await apiFetch(request, "/api/billing/portal", {
    method: "POST",
  });

  const result = await response.json();

  if (!response.ok) {
    const message = typeof result.error === "string" ? result.error : "Something went wrong. Please try again.";
    return { error: message };
  }

  return redirect(result.url);
}

export default function Billing() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-6 text-2xl font-semibold">Billing</h1>

        {actionData?.error && <p className="mb-4 text-red-500">{actionData.error}</p>}

        <Form method="post">
          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Redirecting..." : "Manage billing"}
          </button>
        </Form>
      </div>
    </main>
  );
}
