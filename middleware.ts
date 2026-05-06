// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // better-auth uses these cookie names by default (secure in prod, standard in dev)
  const sessionCookie = 
    request.cookies.get("better-auth.session_token") || 
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthRoute = pathname.startsWith("/login");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // 1. Unauthenticated user trying to access the dashboard
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated user trying to access the login page
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Optimize the root ("/") route so it doesn't even have to hit app/page.tsx
  if (pathname === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Ensure middleware only runs on routes that matter to save performance
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};