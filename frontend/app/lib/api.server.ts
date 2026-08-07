import { env } from './env.server';

const { BACKEND_URL } = env;

export async function apiFetch(
    request: Request,
    path: string,
    init: RequestInit = {},
) {
    const headers = new Headers(init.headers);
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        headers.set('Cookie', cookie);
    }

    return fetch(`${BACKEND_URL}${path}`, {
        ...init,
        headers,
    });
}

/**
 * Same as apiFetch, but transparently retries once via a silent refresh if the access
 * token has expired. session.server.ts's getUser() already does this for page loaders,
 * but SPA-style interactions (file uploads, button clicks hitting a resource route)
 * never go through a loader, so they'd otherwise surface a stale 401 as an opaque
 * "something went wrong" error even with a perfectly valid refresh-token cookie.
 * Returns any freshly-rotated Set-Cookie headers so the caller can relay them onto
 * its own Response — the same "the browser needs the new cookie" relay used elsewhere.
 */
export async function apiFetchWithAuthRetry(
    request: Request,
    path: string,
    init: RequestInit = {},
) {
    let response = await apiFetch(request, path, init);
    if (response.status !== 401) {
        return { response, refreshedCookies: [] as string[] };
    }

    const refreshResponse = await apiFetch(request, '/api/auth/refresh', { method: 'POST' });
    if (!refreshResponse.ok) {
        return { response, refreshedCookies: [] as string[] };
    }

    const refreshedCookies = refreshResponse.headers.getSetCookie();
    const cookieHeader = refreshedCookies.map((c) => c.split(';')[0]).join('; ');

    const headers = new Headers(init.headers);
    headers.set('Cookie', cookieHeader);
    response = await fetch(`${BACKEND_URL}${path}`, { ...init, headers });

    return { response, refreshedCookies };
}
