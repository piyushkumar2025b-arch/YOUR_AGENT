import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt?: string;
  createdAt: string;
}

const PRIMARY_USERS_FILE = process.env.USERS_DB_PATH || path.join(process.cwd(), ".data", "app_auth_users.json");
const BACKUP_USERS_FILE = path.join(process.env.HOME || "/tmp", ".app_auth_users_backup.json");

class UserPersistenceStore {
  private users: Map<string, UserRecord> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load from primary path
    try {
      if (fs.existsSync(PRIMARY_USERS_FILE)) {
        const raw = JSON.parse(fs.readFileSync(PRIMARY_USERS_FILE, "utf8"));
        for (const [k, v] of Object.entries(raw)) {
          if (v && typeof v === "object" && (v as UserRecord).email) {
            this.users.set(k.toLowerCase(), v as UserRecord);
          }
        }
      }
    } catch (e) {
      console.warn("[UserPersistence] Primary users file load error, trying backup:", e);
    }

    // Load from backup path if primary was empty or missing
    if (this.users.size === 0) {
      try {
        if (fs.existsSync(BACKUP_USERS_FILE)) {
          const raw = JSON.parse(fs.readFileSync(BACKUP_USERS_FILE, "utf8"));
          for (const [k, v] of Object.entries(raw)) {
            if (v && typeof v === "object" && (v as UserRecord).email) {
              this.users.set(k.toLowerCase(), v as UserRecord);
            }
          }
        }
      } catch (e) {
        console.warn("[UserPersistence] Backup users file load error:", e);
      }
    }
  }

  public get(email: string): UserRecord | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  public getById(id: string): UserRecord | undefined {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return undefined;
  }

  public getAll(): Record<string, UserRecord> {
    const res: Record<string, UserRecord> = Object.create(null);
    for (const [k, v] of this.users.entries()) {
      res[k] = v;
    }
    return res;
  }

  public save(user: UserRecord): void {
    const key = user.email.toLowerCase().trim();
    this.users.set(key, user);
    this.persist();
  }

  private persist(): void {
    const data = this.getAll();
    const json = JSON.stringify(data, null, 2);

    try {
      fs.mkdirSync(path.dirname(PRIMARY_USERS_FILE), { recursive: true });
      fs.writeFileSync(PRIMARY_USERS_FILE, json, { encoding: "utf8", mode: 0o600 });
    } catch (e) {
      console.error("[UserPersistence] Failed to write primary file:", e);
    }

    try {
      fs.mkdirSync(path.dirname(BACKUP_USERS_FILE), { recursive: true });
      fs.writeFileSync(BACKUP_USERS_FILE, json, { encoding: "utf8", mode: 0o600 });
    } catch (e) {
      console.error("[UserPersistence] Failed to write backup file:", e);
    }
  }
}

export const userPersistence = new UserPersistenceStore();
