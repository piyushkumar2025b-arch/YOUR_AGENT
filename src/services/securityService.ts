import { SECURITY_AGENT_PROMPT } from "../prompts/securityPrompt";
import { fetchWithAuth } from "../utils/apiAuth";

export interface SecurityTaskOptions {
  task: string;
  filesContext?: string;
}

export async function runSecurityAgentTask(
  options: SecurityTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${SECURITY_AGENT_PROMPT}

User Security Audit Task:
${options.task}

${options.filesContext ? `Source Code Context:\n${options.filesContext}` : ""}
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
    throw new Error(`Security Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Security Agent execution completed with empty output.";
}
