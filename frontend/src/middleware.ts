import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isRoleAllowedForPath, PUBLIC_ROUTES } from "@/config/routes.config";

export default auth((req) => {
  const { nextUrl } = req;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    if (req.auth && nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/admin") && !req.auth.user?.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  const role = req.auth.user?.role;
  if (role && !isRoleAllowedForPath(nextUrl.pathname, role)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
