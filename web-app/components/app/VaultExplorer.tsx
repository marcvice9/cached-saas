"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AISummaryWithContent } from "@/lib/types/database";
import { searchVault, updateSummaryNotes } from "@/lib/actions/ai";

export default function VaultExplorer({
  initialSummaries,
}: {
  initialSummaries: AISummaryWithContent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AISummaryWithContent[] | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const summaries = searchResults ?? initialSummaries;

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
      <form onSubmit={handleSearch} className="mb-6">
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

      {searchResults !== null && (
        <p className="mb-4 text-sm text-gray-500">
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}{" "}
          for &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            {searchResults !== null
              ? "No summaries match your search."
              : "No summaries yet. Mark content as Done to generate AI summaries."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => {
            const isExpanded = expandedId === summary.id;

            return (
              <div
                key={summary.id}
                className={`rounded-xl bg-white shadow-sm transition-opacity ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                {/* Header - always visible */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : summary.id)
                  }
                  className="w-full p-5 text-left"
                >
                  {summary.content && (
                    <a
                      href={summary.content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mb-2 block truncate text-sm font-semibold text-brand-dark hover:text-brand-orange"
                    >
                      {summary.content.title}
                    </a>
                  )}
                  <p className="line-clamp-2 text-sm text-gray-700">
                    {summary.summary_text}
                  </p>

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

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(summary.created_at).toLocaleDateString()} ·{" "}
                    {summary.key_takeaways.length} takeaway
                    {summary.key_takeaways.length !== 1 ? "s" : ""} ·{" "}
                    {isExpanded ? "Click to collapse" : "Click to expand"}
                  </p>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {/* Full summary */}
                    <div className="mt-4">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Summary
                      </h4>
                      <p className="text-sm text-gray-700">
                        {summary.summary_text}
                      </p>
                    </div>

                    {/* Key Takeaways */}
                    {summary.key_takeaways.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Key Takeaways
                        </h4>
                        <ul className="space-y-1.5">
                          {summary.key_takeaways.map((takeaway, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-orange" />
                              {takeaway}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* User Notes */}
                    <div className="mt-4">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Your Notes
                      </h4>

                      {editingNotes === summary.id ? (
                        <div>
                          <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-orange"
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
                        <div>
                          {summary.user_notes ? (
                            <p className="text-sm text-gray-600">
                              {summary.user_notes}
                            </p>
                          ) : (
                            <p className="text-sm italic text-gray-400">
                              No notes yet
                            </p>
                          )}
                          <button
                            onClick={() => startEditNotes(summary)}
                            className="mt-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            {summary.user_notes ? "Edit Notes" : "Add Notes"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
