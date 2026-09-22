import { TESTING_AGENT_PROMPT } from "../prompts/testingPrompt";
import { fetchWithAuth } from "../utils/apiAuth";

export interface TestingTaskOptions {
  task: string;
  filesContext?: string;
  testFramework?: "vitest" | "jest" | "playwright" | "cypress" | "junit";
}

export async function runTestingAgentTask(
  options: TestingTaskOptions,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  const prompt = `${TESTING_AGENT_PROMPT}

Test Framework Focus: ${options.testFramework || "vitest"}

User Task:
${options.task}

${options.filesContext ? `Code under test context:\n${options.filesContext}` : ""}
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
    throw new Error(`Testing Agent HTTP Error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Test Generation Agent execution completed with empty output.";
}
