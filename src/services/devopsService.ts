import { DEVOPS_AGENT_PROMPT } from "../prompts/devopsPrompt";

export interface DevOpsTaskOptions {
  task: string;
  filesContext?: string;
  targetPlatform?: "docker" | "kubernetes" | "github-actions" | "terraform" | "all";
}

export async function runDevOpsAgentTask(
  options: DevOpsTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${DEVOPS_AGENT_PROMPT}

Target Platform Focus: ${options.targetPlatform || "all"}

User Task:
${options.task}

${options.filesContext ? `Project Context:\n${options.filesContext}` : ""}
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
    throw new Error(`DevOps Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "DevOps Agent execution completed with empty output.";
}
