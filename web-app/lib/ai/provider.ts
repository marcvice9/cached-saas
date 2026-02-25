import { createGroq } from "@ai-sdk/groq";

/**
 * Factory: returns an AI SDK provider based on AI_PROVIDER env var.
 * Default: Groq (free tier, Llama 3 70B).
 *
 * To add new providers, install the corresponding @ai-sdk/* package
 * and add a case here. No other code changes needed.
 */
export function getAIProvider() {
  const provider = process.env.AI_PROVIDER || "groq";

  switch (provider) {
    case "groq":
      return createGroq({ apiKey: process.env.GROQ_API_KEY });
    default:
      return createGroq({ apiKey: process.env.GROQ_API_KEY });
  }
}

export function getModelId(): string {
  const provider = process.env.AI_PROVIDER || "groq";

  switch (provider) {
    case "groq":
      return "llama-3.3-70b-versatile";
    default:
      return "llama-3.3-70b-versatile";
  }
}
