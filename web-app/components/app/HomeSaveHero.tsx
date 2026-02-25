"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createCategory } from "@/lib/actions/categories";

export default function HomeSaveHero({
  categories: initialCategories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [categories, setCategories] = useState(initialCategories);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatGoal, setNewCatGoal] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          categoryIds: selectedCategories.length ? selectedCategories : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to save content");
        return;
      }

      setUrl("");
      setSelectedCategories([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      router.refresh();

      if (json.data?.id) {
        fetch("/api/ai/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId: json.data.id }),
        })
          .then(() => router.refresh())
          .catch(() => {});
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    setCatError(null);

    try {
      const cat = await createCategory({
        name: newCatName.trim(),
        goalDescription: newCatGoal.trim() || undefined,
        priority: 0,
      });
      setCategories((prev) => [...prev, { id: cat.id, name: cat.name }]);
      setSelectedCategories((prev) => [...prev, cat.id]);
      setNewCatName("");
      setNewCatGoal("");
      setShowNewCat(false);
      router.refresh();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setCreatingCat(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#202327] p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Add a URL</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Paste a link and Cached turns it into a scheduled learning step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-3xl bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL"
              className="h-12 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-[#1A1C1E] outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/50"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-12 rounded-2xl bg-[#1D5E58] px-5 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const selected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`relative flex min-w-[96px] items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? "bg-[#06D6A0] text-[#0E2E29]"
                    : "bg-white/5 text-zinc-200 hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowNewCat((v) => !v)}
            className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
          >
            + Category
          </button>
        </div>

        <AnimatePresence>
          {showNewCat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid gap-2 rounded-2xl border border-white/10 bg-[#1A1C1E] p-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  className="h-10 rounded-xl border border-white/10 bg-[#22262B] px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
                  disabled={creatingCat}
                />
                <input
                  type="text"
                  value={newCatGoal}
                  onChange={(e) => setNewCatGoal(e.target.value)}
                  placeholder="Goal (optional)"
                  className="h-10 rounded-xl border border-white/10 bg-[#22262B] px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
                  disabled={creatingCat}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCat || !newCatName.trim()}
                  className="h-10 rounded-xl bg-[#06D6A0] px-4 text-sm font-semibold text-[#0E2E29] disabled:opacity-50"
                >
                  {creatingCat ? "Creating..." : "Create"}
                </button>
                {catError && <p className="text-xs text-red-300">{catError}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[#9BEAD7]"
            >
              Saved to your notebook.
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </section>
  );
}
