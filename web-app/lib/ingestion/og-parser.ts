import ogs from "open-graph-scraper";
import type { ContentMetadata } from "../types/api";

/**
 * Generic Open Graph metadata extractor — fallback for unsupported platforms.
 */
export async function parseOpenGraph(url: string): Promise<ContentMetadata> {
  const { result } = await ogs({ url, timeout: 10000 });

  const title = result.ogTitle || result.twitterTitle || url;
  const description = result.ogDescription || result.twitterDescription || null;
  const thumbnailUrl = result.ogImage?.[0]?.url || null;

  return {
    title,
    description,
    thumbnailUrl,
    sourcePlatform: "OTHER",
    contentFormat: "LONG_READ",
    estimatedDurationMinutes: 5, // conservative default
  };
}
