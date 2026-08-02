import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index("routes/landing.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("billing", "routes/billing.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
