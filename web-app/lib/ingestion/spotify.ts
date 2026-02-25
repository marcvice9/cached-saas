import type { ContentMetadata } from "../types/api";
import { fetchOEmbed } from "./oembed";

const SPOTIFY_REGEX = /open\.spotify\.com\/(episode|show|track)\/([a-zA-Z0-9]+)/;

export function isSpotifyUrl(url: string): boolean {
  return SPOTIFY_REGEX.test(url);
}

/**
 * Parse Spotify content using OEmbed via noembed.com proxy.
 */
export async function parseSpotify(url: string): Promise<ContentMetadata> {
  const match = url.match(SPOTIFY_REGEX);
  const type = match?.[1];

  try {
    const data = await fetchOEmbed(url);

    return {
      title: data.title || url,
      description: data.provider_name ? `On ${data.provider_name}` : null,
      thumbnailUrl: data.thumbnail_url || null,
      sourcePlatform: "SPOTIFY",
      contentFormat: "AUDIO",
      estimatedDurationMinutes: type === "track" ? 4 : 30,
    };
  } catch {
    return {
      title: url,
      description: null,
      thumbnailUrl: null,
      sourcePlatform: "SPOTIFY",
      contentFormat: "AUDIO",
      estimatedDurationMinutes: type === "track" ? 4 : 30,
    };
  }
}
