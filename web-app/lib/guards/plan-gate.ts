import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/billing/effective-plan";

/**
 * Guard: throws if the current user is not on the PRO plan.
 * Use in Server Actions that require PRO.
 */
export async function requirePro(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const plan = await getEffectivePlan(supabase, user.id);
  if (plan !== "PRO") {
    throw new Error("This feature requires a Pro plan. Please upgrade.");
  }
}
