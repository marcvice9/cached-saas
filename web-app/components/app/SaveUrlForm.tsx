"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SaveUrlForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractingUrl, setExtractingUrl] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const pendingUrl = url.trim();
    setLoading(true);
    setError(null);
    setExtractingUrl(pendingUrl);

    try {
      const res = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: pendingUrl,
          categoryIds: selectedCategories.length ? selectedCategories : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to save content");
        setExtractingUrl(null);
        return;
      }

      setUrl("");
      setSelectedCategories([]);

      if (json.data?.id) {
        fetch("/api/ai/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId: json.data.id }),
        })
          .then(() => router.refresh())
          .catch(() => {});
      }

      setTimeout(() => {
        router.refresh();
        setExtractingUrl(null);
      }, 900);
    } catch {
      setError("Something went wrong. Please try again.");
      setExtractingUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-[#202327] p-4"
      >
        <div className="rounded-3xl bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL to archive"
              className="h-11 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-[#1A1C1E] outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-11 rounded-2xl bg-[#1F5C56] px-5 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const selected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex min-w-[96px] items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "bg-[#06D6A0] text-[#0E2E29]"
                      : "bg-white/5 text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </form>

      {extractingUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-400/40 bg-[#2A2E33] p-4 text-zinc-100">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.7s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="relative flex items-start gap-3">
            <div className="h-16 w-24 rounded-xl border border-white/20 bg-white/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs uppercase tracking-wide text-[#7BEED4]">Extracting</p>
              <div className="h-3 w-2/3 rounded bg-white/20" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
              <p className="truncate text-xs text-zinc-300">{extractingUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
