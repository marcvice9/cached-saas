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
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const baseSummaries = searchResults ?? initialSummaries;

  // Apply category filter client-side
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
        // Silently fail
      }
    });
  };

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search summaries, takeaways, and notes..."
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-brand-orange"
            />
            <svg
              className="absolute left-3 top-3 text-gray-400"
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
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Search
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategoryId === null
                ? "bg-brand-dark text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategoryId === cat.id
                  ? "bg-brand-dark text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {searchResults !== null && (
        <p className="mb-4 text-sm text-gray-500">
          {summaries.length} result{summaries.length !== 1 ? "s" : ""}{" "}
          for &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            {searchResults !== null
              ? "No summaries match your search."
              : selectedCategoryId
                ? "No summaries in this category."
                : "No summaries yet. Mark content as Done to generate AI summaries."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => {
            const summaryCategories = getCategoriesForSummary(summary);
            const isFullSummaryExpanded = expandedSummaryId === summary.id;

            return (
              <div
                key={summary.id}
                className={`rounded-xl bg-white p-5 shadow-sm transition-opacity ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                {/* Title + Category badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {summary.content && (
                      <a
                        href={summary.content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-semibold text-brand-dark hover:text-brand-orange"
                      >
                        {summary.content.title}
                      </a>
                    )}
                  </div>
                  {summaryCategories.length > 0 && (
                    <div className="flex flex-shrink-0 gap-1.5">
                      {summaryCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-medium text-brand-orange"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary text (truncated with toggle) */}
                <div className="mt-2">
                  <p
                    className={`text-sm text-gray-700 ${
                      !isFullSummaryExpanded ? "line-clamp-2" : ""
                    }`}
                  >
                    {summary.summary_text}
                  </p>
                  {summary.summary_text.length > 200 && (
                    <button
                      onClick={() =>
                        setExpandedSummaryId(
                          isFullSummaryExpanded ? null : summary.id
                        )
                      }
                      className="mt-1 text-xs font-medium text-brand-teal hover:underline"
                    >
                      {isFullSummaryExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>

                {/* Topics */}
                {summary.suggested_topics &&
                  summary.suggested_topics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {summary.suggested_topics.map((topic, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-xs font-medium text-brand-teal"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Key Takeaways - always visible */}
                {summary.key_takeaways.length > 0 && (
                  <div className="mt-3">
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Key Takeaways
                    </h4>
                    <ul className="space-y-1">
                      {summary.key_takeaways.map((takeaway, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-orange" />
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* User Notes - always visible */}
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  {editingNotes === summary.id ? (
                    <div>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-orange"
                        rows={3}
                        placeholder="Add your notes..."
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => saveNotes(summary.id)}
                          disabled={isPending}
                          className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {summary.user_notes ? (
                          <p className="text-sm text-gray-600">
                            {summary.user_notes}
                          </p>
                        ) : (
                          <p className="text-sm italic text-gray-400">
                            No notes yet
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => startEditNotes(summary)}
                        className="flex-shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm hover:bg-gray-100"
                      >
                        {summary.user_notes ? "Edit" : "Add Notes"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Date */}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(summary.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
