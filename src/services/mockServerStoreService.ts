export interface MockEndpointConfig {
  id: string;
  name: string;
  path: string;
  method: string;
  statusCode: number;
  contentType: string;
  responseBody: string;
  headers: Record<string, string>;
  delayMs: number;
  enabled: boolean;
  createdAt: number;
  callCount: number;
}

export interface WebhookLogEntry {
  id: string;
  endpointId?: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: any;
  query: Record<string, any>;
  ip: string;
  timestamp: number;
}

export interface UserMockStore {
  endpoints: MockEndpointConfig[];
  webhookLogs: WebhookLogEntry[];
}

const mockStores = new Map<string, UserMockStore>();

export function getMockStore(userId: string): UserMockStore {
  const safeId = userId || "guest";
  let store = mockStores.get(safeId);
  if (!store) {
    store = {
      endpoints: [
        {
          id: "ep_users_list",
          name: "List Users (Mock)",
          path: "/users",
          method: "GET",
          statusCode: 200,
          contentType: "application/json",
          responseBody: JSON.stringify([
            { id: 1, name: "Alice Smith", role: "Frontend Architect", status: "active" },
            { id: 2, name: "Bob Jones", role: "DevOps Engineer", status: "away" },
            { id: 3, name: "Carol Davis", role: "Full-Stack Developer", status: "active" }
          ], null, 2),
          headers: { "X-Mock-Engine": "AI-Studio-Core" },
          delayMs: 120,
          enabled: true,
          createdAt: Date.now() - 3600000,
          callCount: 14
        },
        {
          id: "ep_create_order",
          name: "Create Order (Mock)",
          path: "/orders",
          method: "POST",
          statusCode: 201,
          contentType: "application/json",
          responseBody: JSON.stringify({
            orderId: "ord_984120",
            status: "created",
            totalUsd: 149.99,
            currency: "USD",
            createdTime: new Date().toISOString()
          }, null, 2),
          headers: { "X-Mock-Engine": "AI-Studio-Core" },
          delayMs: 250,
          enabled: true,
          createdAt: Date.now() - 7200000,
          callCount: 8
        }
      ],
      webhookLogs: []
    };
    mockStores.set(safeId, store);
  }
  return store;
}
