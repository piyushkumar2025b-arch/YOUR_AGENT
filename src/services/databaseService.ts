import { DATABASE_AGENT_PROMPT } from "../prompts/databasePrompt";
import { fetchWithAuth } from "../utils/apiAuth";

export interface DatabaseTaskOptions {
  task: string;
  filesContext?: string;
  databaseEngine?: "postgresql" | "mysql" | "sqlite" | "mongodb" | "supabase" | "prisma" | "drizzle";
}

export async function runDatabaseAgentTask(
  options: DatabaseTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${DATABASE_AGENT_PROMPT}

Database Engine Focus: ${options.databaseEngine || "postgresql"}

User Task:
${options.task}

${options.filesContext ? `Project Schema Context:\n${options.filesContext}` : ""}
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
    throw new Error(`Database Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Database Agent execution completed with empty output.";
}
