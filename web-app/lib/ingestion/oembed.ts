const NOEMBED_URL = "https://noembed.com/embed";

export interface OEmbedData {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  provider_name?: string;
  provider_url?: string;
  type?: string;
  html?: string;
  error?: string;
}

/**
 * Fetch OEmbed metadata via noembed.com — a free proxy that supports
 * YouTube, Spotify, Twitter/X, and many other providers.
 * This avoids direct requests to providers that may be unreachable.
 */
export async function fetchOEmbed(url: string): Promise<OEmbedData> {
  const endpoint = `${NOEMBED_URL}?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    throw new Error(`OEmbed request failed with status ${response.status}`);
  }

  const data: OEmbedData = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
