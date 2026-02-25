import * as cheerio from "cheerio";
import type { ContentMetadata } from "../types/api";
import { WORDS_PER_MINUTE, CONTENT_LIMITS } from "../constants";
import { parseOpenGraph } from "./og-parser";

/**
 * Parse an article URL: fetch HTML, extract text, estimate reading time.
 */
export async function parseArticle(url: string): Promise<ContentMetadata> {
  const og = await parseOpenGraph(url);

  let estimatedDurationMinutes = 5; // default

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "CachedBot/1.0" },
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html.slice(0, CONTENT_LIMITS.MAX_TEXT_LENGTH));

      // Remove scripts, styles, nav, footer
      $("script, style, nav, footer, header, aside").remove();

      const text = $("article, main, .post-content, .entry-content, body")
        .first()
        .text();

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      if (wordCount > 0) {
        estimatedDurationMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
      }
    }
  } catch {
    // If fetching fails, keep the OG default
  }

  const isLongRead = estimatedDurationMinutes > 10;

  return {
    ...og,
    sourcePlatform: "ARTICLE",
    contentFormat: isLongRead ? "LONG_READ" : "SHORT_READ",
    estimatedDurationMinutes,
  };
}
