import { ARCHITECT_AGENT_PROMPT } from "../prompts/architectPrompt";

export interface ArchitectTaskOptions {
  task: string;
  filesContext?: string;
}

export async function runArchitectAgentTask(
  options: ArchitectTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${ARCHITECT_AGENT_PROMPT}

User Architecture Task:
${options.task}

${options.filesContext ? `Existing Architecture Context:\n${options.filesContext}` : ""}
`;

  const res = await fetch("/api/openrouter/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": apiKey ? `Bearer ${apiKey}` : ""
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 65536
    })
  });

  if (!res.ok) {
    throw new Error(`Architect Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Architect Agent execution completed with empty output.";
}
