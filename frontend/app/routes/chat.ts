import type { Route } from "./+types/chat";
import { apiFetchWithAuthRetry } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
    const { response, refreshedCookies } = await apiFetchWithAuthRetry(request, "/api/chat/history");
    const data = await response.json();
    const headers = new Headers();
    for (const cookie of refreshedCookies) {
        headers.append("Set-Cookie", cookie);
    }
    return Response.json(data, { status: response.status, headers });
}

export async function action({ request }: Route.ActionArgs) {
    const body = await request.text();

    const { response, refreshedCookies } = await apiFetchWithAuthRetry(request, "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    const headers = new Headers(response.headers);
    for (const cookie of refreshedCookies) {
        headers.append("Set-Cookie", cookie);
    }

    // Pass the backend's streaming body straight through — never buffer it, or the
    // whole point of streaming is lost between here and the browser.
    return new Response(response.body, {
        status: response.status,
        headers,
    });
}
