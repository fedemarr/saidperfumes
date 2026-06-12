import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/mi-cuenta", "/mis-pedidos", "/checkout"];
const ADMIN_ONLY = ["/admin"];
const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

export default auth(function middleware(req: NextRequest & { auth?: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const session = (req as { auth?: { user?: { role?: string } } | null }).auth;

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.png$).*)"],
};
