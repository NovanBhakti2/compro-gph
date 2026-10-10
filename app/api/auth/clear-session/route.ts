import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * The session cookie is signed correctly but its user no longer exists or lost
 * access (deleted, role changed, DB reseeded). Server Components can't delete
 * cookies, so lib/dal.ts redirects here; without this, proxy.ts would bounce
 * /login back to /dashboard forever.
 */
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
