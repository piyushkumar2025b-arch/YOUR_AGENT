import { UIUX_AGENT_PROMPT } from "../prompts/uiuxPrompt";
import { fetchWithAuth } from "../utils/apiAuth";

export interface UIUXTaskOptions {
  task: string;
  filesContext?: string;
  designSystem?: "tailwind" | "material-ui" | "custom";
}

export async function runUIUXAgentTask(
  options: UIUXTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${UIUX_AGENT_PROMPT}

Design System Preference: ${options.designSystem || "tailwind"}

User Task:
${options.task}

${options.filesContext ? `Project Files Context:\n${options.filesContext}` : ""}
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
    throw new Error(`UI/UX Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "UI/UX Agent execution completed with empty output.";
}
