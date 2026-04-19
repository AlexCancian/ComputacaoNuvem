import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Busca os tokens aceitando as variações de nomes do seu backend
  const token = 
    request.cookies.get("access_token")?.value || 
    request.cookies.get("acess_token")?.value || 
    request.cookies.get("token")?.value;

  const refreshToken = 
    request.cookies.get("refresh_token")?.value || 
    request.cookies.get("refreshToken")?.value;

  const isAuth = !!token || !!refreshToken;

  // Root path handling
  if (pathname === "/") {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Auth pages handling
  if (pathname.startsWith("/login") || pathname.startsWith("/esqueceu-senha")) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith("/dashboard")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/esqueceu-senha", "/dashboard/:path*"],
};
