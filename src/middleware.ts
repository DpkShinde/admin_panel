import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  protectedRoutesPrefix,
} from "../routes";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API auth routes (e.g., /api/auth/*)
  if (pathname.startsWith(apiAuthPrefix)) return null;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // Check if route is a protected route
  const isProtectedRoute = protectedRoutesPrefix.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // If logged in and accessing an auth/public route, redirect to dashboard
  if (isLoggedIn && (isPublicRoute || isAuthRoute)) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // If not logged in and accessing a protected route, redirect to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/super-admin/login", req.url));
  }

  return null;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
