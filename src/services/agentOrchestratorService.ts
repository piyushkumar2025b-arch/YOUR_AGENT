import { SPECIALIST_AGENTS, SUGGESTED_WORKFLOW_CHAINS } from "../prompts";
import { runDevOpsAgentTask } from "./devopsService";
import { runUIUXAgentTask } from "./uiuxService";
import { runDatabaseAgentTask } from "./databaseService";
import { runArchitectAgentTask } from "./architectService";
import { runTestingAgentTask } from "./testingService";
import { runSecurityAgentTask } from "./securityService";
import { runReviewerAgentTask } from "./reviewerService";

export interface OrchestrationResult {
  stepId: string;
  agentId: string;
  agentName: string;
  output: string;
}

export async function detectAndSelectChain(userIntent: string) {
  const lower = userIntent.toLowerCase();
  if (lower.includes("saas") || lower.includes("build") || lower.includes("create app")) {
    return SUGGESTED_WORKFLOW_CHAINS.find(c => c.id === "build_saas");
  }
  if (lower.includes("review") || lower.includes("audit") || lower.includes("repo")) {
    return SUGGESTED_WORKFLOW_CHAINS.find(c => c.id === "review_repo");
  }
  if (lower.includes("deploy") || lower.includes("docker") || lower.includes("ci/cd")) {
    return SUGGESTED_WORKFLOW_CHAINS.find(c => c.id === "deploy_project");
  }
  if (lower.includes("schema") || lower.includes("database") || lower.includes("sql")) {
    return SUGGESTED_WORKFLOW_CHAINS.find(c => c.id === "design_schema");
  }
  if (lower.includes("frontend") || lower.includes("ui") || lower.includes("ux")) {
    return SUGGESTED_WORKFLOW_CHAINS.find(c => c.id === "improve_frontend");
  }
  return SUGGESTED_WORKFLOW_CHAINS[0]; // Default to Full SaaS workflow
}

export async function runSpecialistAgentStep(
  agentId: string,
  taskPrompt: string,
  filesContext: string,
  apiKey: string,
  model: string = "google/gemini-2.5-flash"
): Promise<string> {
  switch (agentId) {
    case "devops_agent":
      return runDevOpsAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    case "uiux_agent":
      return runUIUXAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    case "database_agent":
      return runDatabaseAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    case "architect_agent":
      return runArchitectAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    case "testing_agent":
      return runTestingAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    case "security_agent":
      return runSecurityAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    case "reviewer_agent":
      return runReviewerAgentTask({ task: taskPrompt, filesContext }, apiKey, model);
    default:
      throw new Error(`Unknown specialist agent ID: ${agentId}`);
  }
}
