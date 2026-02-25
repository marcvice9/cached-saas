"use server";

import { createClient } from "@/lib/supabase/server";
import { FEATURE_GATES } from "@/lib/constants";
import type { Category } from "@/lib/types/database";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators/category";
import { getEffectivePlan } from "@/lib/billing/effective-plan";

export async function listCategories(activeOnly = true): Promise<Category[]> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    // Dev-only stub so the dashboard renders without a database.
    const now = "2024-01-01T00:00:00.000Z";
    return [
      {
        id: "stub-cat-1",
        user_id: "stub-user",
        name: "AI/ML",
        goal_description: "Keep up with weekly AI papers",
        weekly_time_budget_minutes: 180,
        priority: 2,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "stub-cat-2",
        user_id: "stub-user",
        name: "Frontend",
        goal_description: "UI inspiration and CSS tricks",
        weekly_time_budget_minutes: 120,
        priority: 1,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ] as Category[];
  }

  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .order("priority", { ascending: false });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    return {
      id: "stub-cat-new",
      user_id: "stub-user",
      name: input.name,
      goal_description: input.goalDescription ?? null,
      weekly_time_budget_minutes: input.weeklyTimeBudgetMinutes ?? null,
      priority: input.priority ?? 0,
      is_active: true,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    } as Category;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check plan limits
  const plan = await getEffectivePlan(supabase, user.id);
  const maxCategories = FEATURE_GATES[plan as keyof typeof FEATURE_GATES].maxCategories;

  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if ((count ?? 0) >= maxCategories) {
    throw new Error(
      `Free plan limited to ${maxCategories} categories. Upgrade to Pro for unlimited.`
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: input.name,
      goal_description: input.goalDescription ?? null,
      weekly_time_budget_minutes: input.weeklyTimeBudgetMinutes ?? null,
      priority: input.priority ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    return {
      id: input.id,
      user_id: "stub-user",
      name: input.name ?? "Updated category",
      goal_description: input.goalDescription ?? null,
      weekly_time_budget_minutes: input.weeklyTimeBudgetMinutes ?? null,
      priority: input.priority ?? 0,
      is_active: input.isActive ?? true,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    } as Category;
  }

  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.goalDescription !== undefined) updates.goal_description = input.goalDescription;
  if (input.weeklyTimeBudgetMinutes !== undefined)
    updates.weekly_time_budget_minutes = input.weeklyTimeBudgetMinutes;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
}
