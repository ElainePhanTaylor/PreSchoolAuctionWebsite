import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") ||
                         req.nextUrl.pathname.startsWith("/api/admin")

    if (isAdminRoute && !token?.isAdmin) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthRoute = req.nextUrl.pathname.startsWith("/dashboard") ||
                           req.nextUrl.pathname.startsWith("/admin") ||
                           req.nextUrl.pathname.startsWith("/donate") ||
                           req.nextUrl.pathname.startsWith("/api/admin")

        if (isAuthRoute && !token) {
          return false
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/donate/:path*",
    "/api/admin/:path*",
  ],
}
