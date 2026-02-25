import type { ContentMetadata } from "../types/api";
import { fetchOEmbed } from "./oembed";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

export function extractVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] ?? null;
}

/**
 * Parse YouTube video metadata using OEmbed via noembed.com proxy.
 * Falls back to basic metadata derived from the video ID if OEmbed fails.
 */
export async function parseYouTube(url: string): Promise<ContentMetadata> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Could not extract YouTube video ID");
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const data = await fetchOEmbed(canonicalUrl);

    return {
      title: data.title || url,
      description: data.author_name ? `By ${data.author_name}` : null,
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      sourcePlatform: "YOUTUBE",
      contentFormat: "VIDEO",
      estimatedDurationMinutes: 15,
    };
  } catch {
    // OEmbed failed — return basic metadata derived from video ID
    return {
      title: `YouTube Video (${videoId})`,
      description: null,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      sourcePlatform: "YOUTUBE",
      contentFormat: "VIDEO",
      estimatedDurationMinutes: 15,
    };
  }
}
