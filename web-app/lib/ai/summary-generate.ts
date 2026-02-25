import { generateText } from "ai";
import { z } from "zod";
import { getAIProvider, getModelId } from "./provider";
import { SUMMARY_GENERATE_SYSTEM, summaryGenerateUser } from "./prompts";
import type { ContentSummary } from "../types/api";
import { parseModelJson } from "./json-utils";

const contentSummarySchema = z.object({
  summaryText: z.string(),
  keyTakeaways: z.array(z.string()).min(3).max(5),
  suggestedTopics: z.array(z.string()).min(1).max(3),
});

export async function generateSummary(
  title: string,
  description: string | null,
  url: string
): Promise<ContentSummary> {
  const provider = getAIProvider();

  // Groq's Llama 3.3 models don't support JSON Schema responses.
  // Generate plain text and parse it against the Zod schema instead.
  const { text } = await generateText({
    model: provider(getModelId()),
    system: SUMMARY_GENERATE_SYSTEM,
    prompt: summaryGenerateUser(title, description, url),
  });

  return parseModelJson(text, contentSummarySchema);
}
