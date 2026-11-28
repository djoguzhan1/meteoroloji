import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-atmos-pathname");
  requestHeaders.delete("x-atmos-search");
  requestHeaders.set("x-atmos-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-atmos-search", request.nextUrl.searchParams.toString());

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|ogg|woff2?)$).*)"
  ]
};
