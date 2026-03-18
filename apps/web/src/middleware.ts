import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Tenant guard: ensure all app routes have an authenticated session
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/upload/:path*",
    "/exports/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/api/expenses/:path*",
    "/api/ocr/:path*",
    "/api/exports/:path*",
    "/api/payments/:path*",
    "/api/km-log/:path*",
    "/api/tenant/:path*",
  ],
};
