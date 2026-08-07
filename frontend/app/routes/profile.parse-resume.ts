import type { Route } from "./+types/profile.parse-resume";
import { apiFetchWithAuthRetry } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
    const body = await request.json();

    const { response, refreshedCookies } = await apiFetchWithAuthRetry(request, "/api/profile/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    const headers = new Headers();
    for (const cookie of refreshedCookies) {
        headers.append("Set-Cookie", cookie);
    }
    return Response.json(data, { status: response.status, headers });
}
