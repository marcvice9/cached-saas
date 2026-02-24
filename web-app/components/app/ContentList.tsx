"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SavedContent, ContentStatus, AISummary } from "@/lib/types/database";
import { updateContentStatus, deleteContent } from "@/lib/actions/content";

const STATUS_TABS: { label: string; value: ContentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Queued", value: "QUEUED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Consumed", value: "CONSUMED" },
  { label: "Archived", value: "ARCHIVED" },
];

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: "Video",
  AUDIO: "Audio",
  LONG_READ: "Long Read",
  SHORT_READ: "Short Read",
  CODE_REPO: "Code",
};

const PLATFORM_LABELS: Record<string, string> = {
  YOUTUBE: "YouTube",
  TWITTER: "Twitter",
  LINKEDIN: "LinkedIn",
  SPOTIFY: "Spotify",
  PODCAST: "Podcast",
  GITHUB: "GitHub",
  NEWSLETTER: "Newsletter",
  ARTICLE: "Article",
  OTHER: "Link",
};

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-yellow-100 text-yellow-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONSUMED: "bg-green-100 text-green-800",
  SKIPPED: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export default function ContentList({
  initialContent,
}: {
  initialContent: Array<
    SavedContent & { categories?: { id: string; name: string }[]; ai_summary?: AISummary | null }
  >;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<ContentStatus | "ALL">("ALL");

  const filteredContent =
    filter === "ALL"
      ? initialContent
      : initialContent.filter((c) => c.status === filter);

  const handleStatusUpdate = (contentId: string, status: ContentStatus, hasSummary?: boolean) => {
    startTransition(async () => {
      await updateContentStatus(contentId, status);
      if (status === "CONSUMED" && !hasSummary) {
        // Fallback: generate summary if it wasn't generated on save
        fetch("/api/ai/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId }),
        }).catch(() => {});
      }
      router.refresh();
    });
  };

  const handleDelete = (contentId: string) => {
    if (!confirm("Delete this content?")) return;
    startTransition(async () => {
      await deleteContent(contentId);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-white text-brand-dark shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.value !== "ALL" && (
              <span className="ml-1.5 text-xs text-gray-400">
                {initialContent.filter((c) =>
                  tab.value === "ALL" ? true : c.status === tab.value
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            {filter === "ALL"
              ? "No content saved yet. Paste a URL above to get started!"
              : `No ${filter.toLowerCase()} content.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContent.map((content) => (
            <div
              key={content.id}
              className={`group rounded-xl bg-white p-4 shadow-sm transition-opacity ${
                isPending ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {content.thumbnail_url ? (
                  <img
                    src={content.thumbnail_url}
                    alt=""
                    className="h-20 w-32 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-2xl text-gray-300">
                      {content.content_format === "VIDEO"
                        ? "▶"
                        : content.content_format === "AUDIO"
                          ? "♪"
                          : "📄"}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-dark hover:text-brand-orange"
                    >
                      {content.title}
                    </a>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[content.status]
                      }`}
                    >
                      {content.status}
                    </span>
                  </div>

                  {content.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {content.description}
                    </p>
                  )}

                  {content.categories && content.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {content.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>{PLATFORM_LABELS[content.source_platform] || content.source_platform}</span>
                    <span>·</span>
                    <span>{FORMAT_LABELS[content.content_format] || content.content_format}</span>
                    <span>·</span>
                    <span>{content.estimated_duration_minutes} min</span>
                    <span>·</span>
                    <span>
                      {new Date(content.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {content.ai_summary ? (
                <div className="mt-3 rounded-lg bg-brand-teal/5 px-4 py-3 border border-brand-teal/10">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
                    AI Summary
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {content.ai_summary.summary_text}
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-lg bg-gray-50 px-4 py-2.5 border border-gray-100">
                  <p className="text-xs text-gray-400 italic">
                    ✨ AI summary generating…
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                {content.status === "QUEUED" && (
                  <button
                    onClick={() => handleStatusUpdate(content.id, "CONSUMED", !!content.ai_summary)}
                    className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    Mark Done
                  </button>
                )}
                {(content.status === "QUEUED" ||
                  content.status === "SCHEDULED") && (
                  <button
                    onClick={() => handleStatusUpdate(content.id, "ARCHIVED")}
                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Archive
                  </button>
                )}
                {content.status === "ARCHIVED" && (
                  <button
                    onClick={() => handleStatusUpdate(content.id, "QUEUED")}
                    className="rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
                  >
                    Re-queue
                  </button>
                )}
                <button
                  onClick={() => handleDelete(content.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
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
