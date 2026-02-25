import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateScheduleForUser } from "@/lib/scheduling/engine";
import { getWeekStartDate, getNextWeekStart } from "@/lib/scheduling/week-utils";
import type { User } from "@/lib/types/database";

/**
 * Vercel Cron job: generates weekly schedules for all users.
 * Runs Sunday evening (configured in vercel.json).
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Fetch all users
  const { data: users, error } = await supabase.from("users").select("id, week_start_day, timezone");

  if (error || !users?.length) {
    return NextResponse.json({ error: "No users found" }, { status: 404 });
  }

  const results: Array<{ userId: string; blocksCreated: number; error?: string }> = [];

  for (const user of users as User[]) {
    try {
      // Generate for next week
      const currentWeekStart = getWeekStartDate(new Date(), user.week_start_day);
      const nextWeekStart = getNextWeekStart(currentWeekStart);

      const result = await generateScheduleForUser(
        supabase,
        user.id,
        nextWeekStart
      );
      results.push({ userId: user.id, blocksCreated: result.blocksCreated });
    } catch (err) {
      results.push({
        userId: user.id,
        blocksCreated: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results });
}
