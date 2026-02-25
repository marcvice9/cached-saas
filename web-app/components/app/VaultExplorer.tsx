"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AISummaryWithContent } from "@/lib/types/database";
import type { Category } from "@/lib/types/database";
import { searchVault, updateSummaryNotes } from "@/lib/actions/ai";

function getCategoriesForSummary(
  summary: AISummaryWithContent
): { id: string; name: string }[] {
  if (!summary.content?.content_categories) return [];
  return summary.content.content_categories
    .map((cc) => cc.category)
    .filter((c): c is { id: string; name: string } => c !== null);
}

export default function VaultExplorer({
  initialSummaries,
  categories,
}: {
  initialSummaries: AISummaryWithContent[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AISummaryWithContent[] | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const baseSummaries = searchResults ?? initialSummaries;

  const summaries = selectedCategoryId
    ? baseSummaries.filter((s) =>
        getCategoriesForSummary(s).some((c) => c.id === selectedCategoryId)
      )
    : baseSummaries;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    startTransition(async () => {
      try {
        const results = await searchVault(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const startEditNotes = (summary: AISummaryWithContent) => {
    setEditingNotes(summary.id);
    setNotesText(summary.user_notes || "");
  };

  const saveNotes = (summaryId: string) => {
    startTransition(async () => {
      try {
        await updateSummaryNotes(summaryId, notesText);
        setEditingNotes(null);
        router.refresh();
      } catch {
        // no-op
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="rounded-3xl border border-white/10 bg-[#202327] p-4">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-3.5 text-zinc-500"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your journal"
            className="h-11 w-full rounded-2xl border border-zinc-300 bg-white pl-10 pr-24 text-sm text-[#1A1C1E] outline-none placeholder:text-zinc-500"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#1F5C56] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Search
            </button>
            {searchResults !== null && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`flex min-w-[96px] items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold ${
              selectedCategoryId === null
                ? "bg-[#06D6A0] text-[#0E2E29]"
                : "bg-white/10 text-zinc-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategoryId(
                  selectedCategoryId === cat.id ? null : cat.id
                )
              }
              className={`flex min-w-[96px] items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold ${
                selectedCategoryId === cat.id
                  ? "bg-[#06D6A0] text-[#0E2E29]"
                  : "bg-white/10 text-zinc-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {summaries.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#202327] p-12 text-center text-zinc-400">
          {searchResults !== null
            ? "No summaries match your search."
            : "No journal entries yet. Complete scheduled content to populate this vault."}
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => {
            const summaryCategories = getCategoriesForSummary(summary);

            return (
              <article
                key={summary.id}
                className={`mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-[#262A2F] p-6 text-white ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={summary.content?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-lg font-semibold text-white"
                  >
                    {summary.content?.title || "Untitled"}
                  </a>
                  <div className="flex gap-2">
                    {summaryCategories.slice(0, 2).map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-[#06D6A0]/18 px-2 py-0.5 text-xs text-[#9AF2DC]"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-300 bg-[#ECE8DE] p-4 text-[#141618]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#06D6A0]/20 px-2 py-0.5 text-[11px] font-semibold text-[#1F5C56]">AI Generated ✦</span>
                    <p className="text-xs uppercase tracking-wide text-zinc-600">Summary</p>
                  </div>
                  <p className="text-[16px] leading-7 [font-family:ui-serif,Georgia,Cambria,Times_New_Roman,Times,serif]">
                    {summary.summary_text}
                  </p>
                </div>

                {summary.key_takeaways.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-[#06D6A0]/30 bg-[#06D6A0]/10 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-[#9CF4DE]">AI Key Takeaways</p>
                    <ul className="space-y-1 text-sm text-zinc-100">
                      {summary.key_takeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#06D6A0]" />
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
                  {editingNotes === summary.id ? (
                    <div>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-[#1F2328] px-3 py-2 text-sm text-white outline-none"
                        rows={3}
                        placeholder="Add your notes..."
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => saveNotes(summary.id)}
                          disabled={isPending}
                          className="rounded-lg bg-[#06D6A0] px-3 py-1.5 text-xs font-semibold text-[#0E2E29] disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-zinc-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-zinc-300">
                        {summary.user_notes || "No personal notes yet."}
                      </p>
                      <button
                        onClick={() => startEditNotes(summary)}
                        className="rounded-lg border border-white/20 px-2.5 py-1 text-xs text-zinc-300"
                      >
                        {summary.user_notes ? "Edit" : "Add Notes"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
