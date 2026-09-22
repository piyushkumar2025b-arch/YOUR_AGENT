import { REVIEWER_AGENT_PROMPT } from "../prompts/reviewerPrompt";
import { fetchWithAuth } from "../utils/apiAuth";

export interface ReviewerTaskOptions {
  task: string;
  filesContext?: string;
}

export async function runReviewerAgentTask(
  options: ReviewerTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${REVIEWER_AGENT_PROMPT}

User Code Review Task:
${options.task}

${options.filesContext ? `Source Code to Review:\n${options.filesContext}` : ""}
`;

  const res = await fetchWithAuth(
    "/api/openrouter/chat",
    {
      method: "POST",
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 65536
      })
    },
    apiKey
  );

  if (!res.ok) {
    throw new Error(`Code Reviewer Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Code Reviewer Agent execution completed with empty output.";
}
