import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

const DASHBOARD_ROLES = ["ADMIN", "EDITOR"];

type DashboardUser = { id: string; name: string; email: string; role: string };

/**
 * Secure check: validates the session cookie AND re-reads the user from the
 * database, so deleted users or downgraded roles lose access immediately.
 * Returns null instead of redirecting (for Route Handlers).
 */
export const getDashboardUser = cache(async (): Promise<DashboardUser | null> => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session?.userId) return null;

  const user = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || !DASHBOARD_ROLES.includes(user.role)) return null;
  return user;
});

/** Use this in every dashboard page and server action. */
export async function requireDashboardUser() {
  const user = await getDashboardUser();
  if (!user) {
    // A leftover cookie must be cleared first, or proxy.ts sends /login back here
    const cookieStore = await cookies();
    redirect(cookieStore.has(SESSION_COOKIE) ? "/api/auth/clear-session" : "/login");
  }
  return user;
}

/** Like requireDashboardUser, but only ADMIN passes (e.g. managing users). */
export async function requireAdmin() {
  const user = await requireDashboardUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
