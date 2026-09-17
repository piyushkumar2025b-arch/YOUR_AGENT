export interface VirtualFile {
  path: string;
  content: string;
  language: string;
  isUserCreated?: boolean;
}

export interface ExecutionStats {
  durationSeconds: number;
  tokensEstimated: number;
  tokensPerSec: number;
  compressedContextRatio: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentRole?: string;
  attachedFile?: string;
  stats?: ExecutionStats;
}

export interface Model {
  id: string;
  name: string;
}

export type AgentActionType = "create" | "edit" | "delete" | "analyze" | "info" | "error" | "memory";

export interface AgentAction {
  id: string;
  type: AgentActionType;
  message: string;
  path?: string;
  timestamp: string;
}

export interface WorkspaceTemplate {
  name: string;
  id: string;
  description: string;
  icon: string;
  category?: string;
  files: VirtualFile[];
}

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  capabilities: string[];
  status: "idle" | "thinking" | "working" | "completed" | "error" | "interrupted";
  currentTask?: string;
  logs: string[];
  assignedFile?: string;
  instructions?: string;
  resources?: string[];
  personalWish?: string;
}

export interface AgentWorkflowStep {
  id: string;
  title: string;
  agentId: string;
  inputPrompt: string;
  targetPath?: string;
  outputResult?: string;
  status: "pending" | "running" | "completed" | "failed" | "interrupted";
  thinkingTimeSeconds?: number;
  durationSeconds?: number;
  tokensEstimated?: number;
  tokensPerSec?: number;
  tokensSavedEstimated?: number;
  contextCompressionRatio?: number;
  inputTokensEstimated?: number;
}

export interface GitHubSyncConfig {
  token: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  lastSyncedAt?: string;
}

export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface BorderSettings {
  codeLineHeight?: number | string;
  [key: string]: any;
}

