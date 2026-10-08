// Resilient, Fault-Tolerant Application Storage Engine
// Prevents "Internal error opening backing store for indexedDB.open" in sandboxed browser iframes or restricted environments
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

export interface WorkspaceStateRecord {
  id: string;
  files: any[];
  messages: any[];
  actions: any[];
  updatedAt: number;
}

// In-Memory Table with LocalStorage backing and error immunity
class ResilientTable<T extends { id?: any }> {
  private items: Map<any, T> = new Map();
  private autoId = 1;
  private storageKey: string;

  constructor(name: string) {
    this.storageKey = `vibecoder_fallback_${name}`;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach(item => {
              const id = item.id !== undefined ? item.id : this.autoId++;
              this.items.set(id, { ...item, id });
              if (typeof id === "number" && id >= this.autoId) {
                this.autoId = id + 1;
              }
            });
          }
        }
      }
    } catch {}
  }

  private saveToStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const arr = Array.from(this.items.values()).slice(-200);
        localStorage.setItem(this.storageKey, JSON.stringify(arr));
      }
    } catch {}
  }

  async add(item: T): Promise<any> {
    const id = item.id !== undefined ? item.id : this.autoId++;
    const stored = { ...item, id };
    this.items.set(id, stored);
    this.saveToStorage();
    return id;
  }

  async put(item: T): Promise<any> {
    const id = item.id !== undefined ? item.id : (item as any).name || (item as any).key || this.autoId++;
    const stored = { ...item, id };
    this.items.set(id, stored);
    this.saveToStorage();
    return id;
  }

  async get(id: any): Promise<T | undefined> {
    return this.items.get(id);
  }

  where(field: string) {
    return {
      equals: (val: any) => ({
        reverse: () => ({
          limit: (n: number) => ({
            toArray: async (): Promise<T[]> => {
              const all = Array.from(this.items.values()).filter(x => (x as any)[field] === val);
              return all.reverse().slice(0, n);
            }
          })
        })
      })
    };
  }

  orderBy(_field: string) {
    return {
      reverse: () => ({
        limit: (n: number) => ({
          toArray: async (): Promise<T[]> => {
            const all = Array.from(this.items.values());
            return all.reverse().slice(0, n);
          }
        })
      })
    };
  }

  async toArray(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async clear(): Promise<void> {
    this.items.clear();
    this.saveToStorage();
  }

  async delete(id: any): Promise<void> {
    this.items.delete(id);
    this.saveToStorage();
  }
}

class ResilientDatabase {
  logs: ResilientTable<SavedAgentLog>;
  presets: ResilientTable<UserPreset>;
  sessions: ResilientTable<ChatHistorySession>;
  workspace: ResilientTable<WorkspaceStateRecord>;

  constructor() {
    this.logs = new ResilientTable<SavedAgentLog>("logs");
    this.presets = new ResilientTable<UserPreset>("presets");
    this.sessions = new ResilientTable<ChatHistorySession>("sessions");
    this.workspace = new ResilientTable<WorkspaceStateRecord>("workspace");
  }

  async open(): Promise<this> {
    return this;
  }

  close(): void {}
}

export const db = new ResilientDatabase();

export async function saveWorkspaceState(
  state: WorkspaceStateRecord
): Promise<void> {
  try {
    await db.workspace.put(state);
  } catch (err) {
    console.debug("saveWorkspaceState notice:", err);
  }
}

export async function loadWorkspaceState(
  id: string = "default"
): Promise<WorkspaceStateRecord | undefined> {
  try {
    return await db.workspace.get(id);
  } catch (err) {
    console.debug("loadWorkspaceState notice:", err);
    return undefined;
  }
}

export async function saveLogToDb(agentId: string, agentName: string, type: "info" | "success" | "warning" | "error", message: string): Promise<void> {
  try {
    await db.logs.add({
      agentId,
      agentName,
      type,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.debug("saveLogToDb notice:", err);
  }
}

export async function getAgentLogsFromDb(agentId?: string): Promise<SavedAgentLog[]> {
  try {
    if (agentId) {
      return await db.logs.where("agentId").equals(agentId).reverse().limit(100).toArray();
    }
    return await db.logs.orderBy("id").reverse().limit(100).toArray();
  } catch (err) {
    console.debug("getAgentLogsFromDb notice:", err);
    return [];
  }
}
