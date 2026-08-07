import { redirect } from "react-router";
import { apiFetch } from "./api.server";

export async function getUser(request: Request) {
  const response = await apiFetch(request, "/api/auth/me");
  if (response.ok) {
    return response.json();
  }

  if (response.status !== 401) {
    return null;
  }

  const url = new URL(request.url);
  if (url.pathname.endsWith(".data")) {
    // React Router's client-side "single fetch" convention requests /some-route.data
    // instead of /some-route — redirecting to that raw suffix would show the internal
    // serialized data payload instead of navigating like a normal page.
    url.pathname = url.pathname.slice(0, -".data".length);
  }

  if (url.searchParams.has("_authRefreshed")) {

    // Already retried once after a refresh — a second 401 means the session
    // is genuinely gone (revoked/expired refresh token), not just a stale access token.
    return null;
  }

  // Access token expired but the refresh-token cookie may still be good for up to
  // 30 days — try a silent refresh instead of forcing a re-login on every 15-minute gap.
  const refreshResponse = await apiFetch(request, "/api/auth/refresh", { method: "POST" });
  if (!refreshResponse.ok) {
    return null;
  }

  const headers = new Headers();
  for (const cookie of refreshResponse.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }

  url.searchParams.set("_authRefreshed", "1");
  throw redirect(url.pathname + url.search, { headers });
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}
