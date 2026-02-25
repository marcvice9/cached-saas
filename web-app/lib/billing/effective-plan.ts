import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "@/lib/types/database";

const PRO_SUBSCRIPTION_STATUSES = ["ACTIVE", "TRIALING", "PAST_DUE"] as const;

export async function getEffectivePlan(
  supabase: SupabaseClient,
  userId: string
): Promise<Plan> {
  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  if (userData?.plan === "PRO") return "PRO";

  const { data: activeSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", [...PRO_SUBSCRIPTION_STATUSES])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activeSubscription) return "FREE";

  // Self-heal stale plan data so future checks are cheap.
  await supabase
    .from("users")
    .update({ plan: "PRO" })
    .eq("id", userId);

  return "PRO";
}
