import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
  route("/", "routes/landing.tsx", [
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
  ]),
  route("dashboard", "routes/dashboard.tsx"),
  route("applications/new", "routes/applications.new.tsx"),
  route("applications/:id", "routes/applications.$id.tsx"),
  route("documents/:id/download", "routes/documents.$id.download.ts"),
  route("profile", "routes/profile.tsx"),
  route("profile/parse-resume", "routes/profile.parse-resume.ts"),
  route("profile/photo-upload-signature", "routes/profile.photo-upload-signature.ts"),
  route("profile/update-photo", "routes/profile.update-photo.ts"),
  route("insights", "routes/insights.tsx"),
  route("settings", "routes/settings.tsx"),
  route("verify-email", "routes/verify-email.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("contact", "routes/contact.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
