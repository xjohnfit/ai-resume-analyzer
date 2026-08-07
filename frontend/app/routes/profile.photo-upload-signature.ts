import type { Route } from "./+types/profile.photo-upload-signature";
import { apiFetchWithAuthRetry } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
    const { response, refreshedCookies } = await apiFetchWithAuthRetry(request, "/api/profile/photo-upload-signature");
    const data = await response.json();
    const headers = new Headers();
    for (const cookie of refreshedCookies) {
        headers.append("Set-Cookie", cookie);
    }
    return Response.json(data, { status: response.status, headers });
}
