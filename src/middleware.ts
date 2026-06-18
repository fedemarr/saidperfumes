import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = ["/mi-cuenta", "/mis-pedidos"];
const ADMIN_ONLY = ["/admin"];
const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NextAuth v5 changed cookie prefix from "next-auth" to "authjs"
  const isSecure = process.env.NODE_ENV === "production";
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName });

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    if (token.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.png$).*)"],
};
