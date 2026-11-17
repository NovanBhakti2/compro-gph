import { purgeExpiredRegistrations } from "@/lib/registrations";

/**
 * Daily (vercel.json): deletes sign-up data of trainings whose claim period
 * ended more than RETENTION_DAYS ago. Vercel sends CRON_SECRET as a bearer
 * token; without it set, the route refuses to run.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const deleted = await purgeExpiredRegistrations();
  return Response.json({ deleted });
}
