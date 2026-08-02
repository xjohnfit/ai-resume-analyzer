import { redirect } from "react-router";
import { apiFetch } from "./api.server";

export async function getUser(request: Request) {
  const response = await apiFetch(request, "/api/auth/me");
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}
