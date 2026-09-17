import Dexie, { type Table } from "dexie";

export interface SavedAgentLog {
  id?: number;
  agentId: string;
  agentName: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  metadata?: any;
}

export interface UserPreset {
  id?: number;
  title: string;
  agentType: string;
  content: string;
  createdAt: string;
}

export interface ChatHistorySession {
  id?: number;
  sessionId: string;
  agentId: string;
  prompt: string;
  response: string;
  createdAt: string;
}

class AppDatabase extends Dexie {
  logs!: Table<SavedAgentLog>;
  presets!: Table<UserPreset>;
  sessions!: Table<ChatHistorySession>;

  constructor() {
    super("VibeCoderAppDB");
    this.version(1).stores({
      logs: "++id, agentId, type, timestamp",
      presets: "++id, title, agentType, createdAt",
      sessions: "++id, sessionId, agentId, createdAt"
    });
  }
}

export const db = new AppDatabase();

export async function saveLogToDb(agentId: string, agentName: string, type: "info" | "success" | "warning" | "error", message: string) {
  try {
    await db.logs.add({
      agentId,
      agentName,
      type,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn("IndexedDB log save warning:", err);
  }
}

export async function getAgentLogsFromDb(agentId?: string) {
  try {
    if (agentId) {
      return await db.logs.where("agentId").equals(agentId).reverse().limit(100).toArray();
    }
    return await db.logs.orderBy("id").reverse().limit(100).toArray();
  } catch (err) {
    console.warn("IndexedDB log fetch warning:", err);
    return [];
  }
}
