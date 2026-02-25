import { CONTENT_LIMITS } from "../constants";

const BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "metadata.google.internal",
  "169.254.169.254",
];

const BLOCKED_PROTOCOLS = ["file:", "ftp:", "data:", "javascript:"];

/**
 * Validates and sanitizes a URL to prevent SSRF attacks.
 * Returns the sanitized URL or throws an error.
 */
export function sanitizeUrl(rawUrl: string): URL {
  if (rawUrl.length > CONTENT_LIMITS.MAX_URL_LENGTH) {
    throw new Error("URL exceeds maximum length");
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (BLOCKED_PROTOCOLS.includes(url.protocol)) {
    throw new Error("Protocol not allowed");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only HTTP/HTTPS URLs are allowed");
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new Error("URL points to a blocked host");
  }

  // Block private IP ranges
  if (isPrivateIP(hostname)) {
    throw new Error("URL points to a private network");
  }

  return url;
}

function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
  ];
  return privateRanges.some((range) => range.test(hostname));
}
