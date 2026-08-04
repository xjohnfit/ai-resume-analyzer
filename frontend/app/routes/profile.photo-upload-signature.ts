import type { Route } from "./+types/profile.photo-upload-signature";
import { apiFetch } from "~/lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
    const response = await apiFetch(request, "/api/profile/photo-upload-signature");
    const data = await response.json();
    return Response.json(data, { status: response.status });
}
