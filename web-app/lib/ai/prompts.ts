export const CATEGORY_SUGGEST_SYSTEM = `You are a content classification assistant for a learning app called Cached.
Given a content title and description, suggest the most appropriate learning category and classify the content format.
Respond ONLY with valid JSON matching the required schema.`;

export function categorySuggestUser(
  title: string,
  description: string | null,
  existingCategories: string[]
): string {
  const categoriesStr =
    existingCategories.length > 0
      ? `The user has these existing categories: ${existingCategories.join(", ")}. Prefer suggesting one of these if it fits.`
      : "The user has no existing categories yet. Suggest a new category name.";

  return `Content title: "${title}"
${description ? `Description: "${description}"` : "No description available."}

${categoriesStr}

Suggest the best category for this content and rate your confidence (0.0 to 1.0).`;
}

export const SUMMARY_GENERATE_SYSTEM = `You are a learning assistant for the Cached app.
Given content metadata, generate a concise summary with key takeaways and suggested follow-up topics.
Respond ONLY with valid JSON matching the required schema.`;

export function summaryGenerateUser(
  title: string,
  description: string | null,
  url: string
): string {
  return `Content: "${title}"
${description ? `Description: "${description}"` : ""}
URL: ${url}

Generate a JSON object with exactly these keys:
{
  "summaryText": "A concise one-paragraph summary of what this content likely covers",
  "keyTakeaways": ["3-5 key takeaways a learner should remember"],
  "suggestedTopics": ["2-3 suggested follow-up topics or resources to explore next"]
}`;
}
