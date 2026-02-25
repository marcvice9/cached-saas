"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, Plan } from "@/lib/types/database";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/categories";
import { FEATURE_GATES } from "@/lib/constants";

export default function CategoryManager({
  initialCategories,
  plan,
}: {
  initialCategories: Category[];
  plan: Plan;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [weeklyMinutes, setWeeklyMinutes] = useState<string>("");
  const [priority, setPriority] = useState<string>("0");

  const maxCategories = FEATURE_GATES[plan].maxCategories;
  const activeCount = initialCategories.filter((c) => c.is_active).length;
  const atLimit = activeCount >= maxCategories;

  const resetForm = () => {
    setName("");
    setGoalDescription("");
    setWeeklyMinutes("");
    setPriority("0");
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startEdit = (cat: Category) => {
    setName(cat.name);
    setGoalDescription(cat.goal_description || "");
    setWeeklyMinutes(cat.weekly_time_budget_minutes?.toString() || "");
    setPriority(cat.priority.toString());
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        if (editingId) {
          await updateCategory({
            id: editingId,
            name,
            goalDescription: goalDescription || null,
            weeklyTimeBudgetMinutes: weeklyMinutes ? parseInt(weeklyMinutes) : null,
            priority: parseInt(priority),
          });
        } else {
          await createCategory({
            name,
            goalDescription: goalDescription || undefined,
            weeklyTimeBudgetMinutes: weeklyMinutes ? parseInt(weeklyMinutes) : undefined,
            priority: parseInt(priority),
          });
        }
        resetForm();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save category");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this category?")) return;
    startTransition(async () => {
      try {
        await deleteCategory(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete category");
      }
    });
  };

  const handleToggleActive = (cat: Category) => {
    startTransition(async () => {
      try {
        await updateCategory({ id: cat.id, isActive: !cat.is_active });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update category");
      }
    });
  };

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={atLimit && !editingId}
          className="mb-4 rounded-xl bg-[#06D6A0] px-4 py-2 text-sm font-semibold text-[#0E2E29] disabled:opacity-50"
        >
          + New Category
        </button>
      )}

      {atLimit && plan === "FREE" && !showForm && (
        <p className="mb-4 text-sm text-amber-300">
          Free plan limited to {maxCategories} categories. <a href="/app/billing" className="underline">Upgrade to Pro</a> for unlimited.
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-2xl border border-white/10 bg-[#1E2226] p-4"
        >
          <h3 className="mb-3 text-sm font-semibold text-white">
            {editingId ? "Edit Category" : "New Category"}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="h-10 rounded-xl border border-white/10 bg-[#272C31] px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
              required
              maxLength={100}
            />
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="Priority (0-3)"
              className="h-10 rounded-xl border border-white/10 bg-[#272C31] px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
              min={0}
              max={3}
            />
            <input
              type="number"
              value={weeklyMinutes}
              onChange={(e) => setWeeklyMinutes(e.target.value)}
              placeholder="Weekly minutes"
              className="h-10 rounded-xl border border-white/10 bg-[#272C31] px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
              min={0}
              max={10080}
            />
            <input
              type="text"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Goal description (optional)"
              className="h-10 rounded-xl border border-white/10 bg-[#272C31] px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
              maxLength={500}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="rounded-xl bg-[#06D6A0] px-4 py-2 text-xs font-semibold text-[#0E2E29] disabled:opacity-50"
            >
              {isPending ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {initialCategories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#1A1C1E] p-8 text-center text-sm text-zinc-400">
          No categories yet.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {initialCategories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-xl border border-white/10 bg-[#262A2F] p-3 ${
                isPending ? "opacity-60" : ""
              } ${!cat.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">{cat.name}</h3>
                  {cat.goal_description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{cat.goal_description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${
                    cat.is_active
                      ? "bg-[#06D6A0] text-[#0E2E29]"
                      : "bg-white/10 text-zinc-300"
                  }`}
                >
                  {cat.is_active ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
                <span>P{cat.priority}</span>
                {cat.weekly_time_budget_minutes != null && <span>• {cat.weekly_time_budget_minutes}m/wk</span>}
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => startEdit(cat)}
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
