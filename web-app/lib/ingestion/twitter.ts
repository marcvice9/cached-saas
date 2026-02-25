import type { ContentMetadata } from "../types/api";
import { parseOpenGraph } from "./og-parser";

const TWITTER_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/;

export function isTwitterUrl(url: string): boolean {
  return TWITTER_REGEX.test(url);
}

/**
 * Parse Twitter/X posts using OG tags.
 * Estimated reading time: ~1 min for short tweets, ~3 min for threads.
 */
export async function parseTwitter(url: string): Promise<ContentMetadata> {
  try {
    const og = await parseOpenGraph(url);
    return {
      ...og,
      sourcePlatform: "TWITTER",
      contentFormat: "SHORT_READ",
      estimatedDurationMinutes: 2,
    };
  } catch {
    return {
      title: url,
      description: null,
      thumbnailUrl: null,
      sourcePlatform: "TWITTER",
      contentFormat: "SHORT_READ",
      estimatedDurationMinutes: 2,
    };
  }
}
