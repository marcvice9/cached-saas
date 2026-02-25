"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWeeklyDigest } from "@/lib/email/send-weekly-digest";
import { getWeekStartDate } from "@/lib/scheduling/week-utils";
import { FEATURE_GATES } from "@/lib/constants";
import { getEffectivePlan } from "@/lib/billing/effective-plan";

export async function sendScheduleDigest(
  weekStartDate?: string
): Promise<{ sent: boolean; reason?: "NO_BLOCKS" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check PRO plan for email digest
  const { data: userData } = await supabase
    .from("users")
    .select("week_start_day")
    .eq("id", user.id)
    .single();

  const plan = await getEffectivePlan(supabase, user.id);
  if (!FEATURE_GATES[plan].emailDigest) {
    throw new Error("Email digest requires a Pro plan");
  }

  const targetWeekStart =
    weekStartDate ||
    getWeekStartDate(new Date(), userData?.week_start_day || "SUNDAY");

  const result = await sendWeeklyDigest(supabase, user.id, targetWeekStart);

  if (!result.sent) {
    return { sent: false, reason: "NO_BLOCKS" };
  }

  return { sent: true };
}
