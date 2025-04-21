// routes.ts

// Routes accessible without auth
export const publicRoutes = ["/login"];

// Routes used specifically for auth (like login, register pages)
// If the user is already logged in, redirect them away from these
export const authRoutes = ["/login"];

// Routes that need to be protected (starting with these)
export const protectedRoutesPrefix = ["/dashboard", "/database", "/employees"];

// API auth route prefix
export const apiAuthPrefix = "/api/auth";

// Where to send the user after login
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
