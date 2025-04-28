import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "../routes";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(req.nextUrl)
  // Get token from request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  // const isLoggedIn = true;

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // Allow API auth routes (like /api/auth/signin, etc.)
  if (isApiAuthRoute) return NextResponse.next();

  // If already logged in and trying to access login/register, redirect to dashboard
  if (isAuthRoute && isLoggedIn) {
    console.log(req.url)
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // If not logged in and trying to access a protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/super-admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
