import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAuthenticated, isTokenAdmin, isTokenRegistered } from "@/lib/token";

const SUPER_PROTECTED = ["/controlpanel"];
const PROTECTED = ["/register", "/home", "/events", "profile", "/resources", "/leaderboard"];
const ALL = [...SUPER_PROTECTED, ...PROTECTED, "/login"];

export default async function proxy(req: NextRequest) {
  const isRoute = /^\/\w*$/.test(req.nextUrl.pathname);
  if (!isRoute) return NextResponse.next();

  const homeUrl = new URL("/home", req.url);
  const loginUrl = new URL("/login", req.url);

  const isValidRoute = ALL.some(path => req.nextUrl.pathname.startsWith(path));
  if (!isValidRoute) return NextResponse.redirect(homeUrl);

  const isProtected = PROTECTED.some(path => req.nextUrl.pathname.startsWith(path));
  const isSuperProtected = SUPER_PROTECTED.some(path => req.nextUrl.pathname.startsWith(path));

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authenticated = isAuthenticated(token);
  const isAdmin = isTokenAdmin(token || "");
  const isRegistered = isTokenRegistered(token || "");

  // Edge cases
  if (req.nextUrl.pathname.startsWith("/login") && authenticated) return NextResponse.redirect(homeUrl);
  if (req.nextUrl.pathname.startsWith("/register") && authenticated && isRegistered)
    return NextResponse.redirect(homeUrl);
  if ((isProtected || isSuperProtected) && !authenticated) return NextResponse.redirect(loginUrl);
  if (isSuperProtected && !isAdmin) return NextResponse.redirect(homeUrl);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/register/:path*",
    "/home/:path*",
    "/events/:path*",
    "/profile/:path*",
    "/resources/:path*",
    "/leaderboard/:path*",
    "/controlpanel/:path*",
  ],
};
