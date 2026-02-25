import type { ContentMetadata } from "../types/api";
import type { SourcePlatform, ContentFormat } from "../types/database";
import { sanitizeUrl } from "./url-sanitizer";
import { isYouTubeUrl, parseYouTube } from "./youtube";
import { isSpotifyUrl, parseSpotify } from "./spotify";
import { isTwitterUrl, parseTwitter } from "./twitter";
import { parseArticle } from "./article";

/**
 * Detect platform and content format from the URL alone (no network).
 */
function detectPlatform(url: URL): { sourcePlatform: SourcePlatform; contentFormat: ContentFormat; estimatedDurationMinutes: number } {
  const urlStr = url.toString();
  if (isYouTubeUrl(urlStr)) return { sourcePlatform: "YOUTUBE", contentFormat: "VIDEO", estimatedDurationMinutes: 15 };
  if (isSpotifyUrl(urlStr)) return { sourcePlatform: "SPOTIFY", contentFormat: "AUDIO", estimatedDurationMinutes: 30 };
  if (isTwitterUrl(urlStr)) return { sourcePlatform: "TWITTER", contentFormat: "SHORT_READ", estimatedDurationMinutes: 2 };
  if (url.hostname === "github.com") return { sourcePlatform: "GITHUB", contentFormat: "CODE_REPO", estimatedDurationMinutes: 20 };
  return { sourcePlatform: "OTHER", contentFormat: "LONG_READ", estimatedDurationMinutes: 5 };
}

/**
 * Main ingestion router: URL → platform parser → normalized metadata.
 * Never throws for network failures — falls back to URL-derived metadata.
 */
export async function extractMetadata(rawUrl: string): Promise<ContentMetadata> {
  const url = sanitizeUrl(rawUrl);
  const urlStr = url.toString();

  try {
    if (isYouTubeUrl(urlStr)) {
      return await parseYouTube(urlStr);
    }

    if (isSpotifyUrl(urlStr)) {
      return await parseSpotify(urlStr);
    }

    if (isTwitterUrl(urlStr)) {
      return await parseTwitter(urlStr);
    }

    if (url.hostname === "github.com") {
      const { parseOpenGraph } = await import("./og-parser");
      const og = await parseOpenGraph(urlStr);
      return {
        ...og,
        sourcePlatform: "GITHUB",
        contentFormat: "CODE_REPO",
        estimatedDurationMinutes: 20,
      };
    }

    return await parseArticle(urlStr);
  } catch {
    // Network or parsing failure — save with basic metadata derived from URL
    const { sourcePlatform, contentFormat, estimatedDurationMinutes } = detectPlatform(url);
    return {
      title: rawUrl,
      description: null,
      thumbnailUrl: null,
      sourcePlatform,
      contentFormat,
      estimatedDurationMinutes,
    };
  }
}
