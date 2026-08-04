import type { Route } from "./+types/profile.update-photo";
import { apiFetch } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
    const body = await request.json();

    const response = await apiFetch(request, "/api/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
}
