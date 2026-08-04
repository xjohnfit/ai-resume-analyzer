import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
  route("/", "routes/landing.tsx", [
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
  ]),
  route("dashboard", "routes/dashboard.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("billing", "routes/billing.tsx"),
  route("profile", "routes/profile.tsx"),
  route("profile/parse-resume", "routes/profile.parse-resume.ts"),
  route("profile/photo-upload-signature", "routes/profile.photo-upload-signature.ts"),
  route("patterns", "routes/patterns.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
