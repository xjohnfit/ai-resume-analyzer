import type { Route } from "./+types/documents.$id.download";
import { apiFetch } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";

export async function loader({ request, params }: Route.LoaderArgs) {
    await requireUser(request);

    const response = await apiFetch(request, `/api/documents/${params.id}/download`);
    if (!response.ok) {
        throw new Response("Failed to generate PDF", { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": response.headers.get("Content-Disposition") ?? 'attachment; filename="resume.pdf"',
        },
    });
}
