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
