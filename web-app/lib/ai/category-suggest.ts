import { generateText } from "ai";
import { z } from "zod";
import { getAIProvider, getModelId } from "./provider";
import {
  CATEGORY_SUGGEST_SYSTEM,
  categorySuggestUser,
} from "./prompts";
import type { CategorySuggestion } from "../types/api";
import { parseModelJson } from "./json-utils";

const categorySuggestionSchema = z.object({
  categoryName: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export async function suggestCategory(
  title: string,
  description: string | null,
  existingCategories: string[]
): Promise<CategorySuggestion> {
  const provider = getAIProvider();

  const { text } = await generateText({
    model: provider(getModelId()),
    system: CATEGORY_SUGGEST_SYSTEM,
    prompt: categorySuggestUser(title, description, existingCategories),
  });

  return parseModelJson(text, categorySuggestionSchema);
}
