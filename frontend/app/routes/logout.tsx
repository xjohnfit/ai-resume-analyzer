import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { apiFetch } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
  const response = await apiFetch(request, "/api/auth/logout", {
    method: "POST",
  });

  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }

  return redirect("/login", { headers });
}
