const TOKEN_KEY = "handshake-alerts-token";

export function getApiBase() {
  return (process.env.NEXT_PUBLIC_READEON_API_URL ?? "https://www.readeon.com").replace(/\/$/, "");
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-from-extension", "handshake-alerts");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export type Project = {
  id: string;
  handshakeProjectId: string;
  displayName: string | null;
  alertsEnabled: boolean;
  maxAlertCount: number;
  alertsSentCount: number;
  remainingAlerts: number;
  alertCooldownHours: number;
  alertsCooldownUntil: string | null;
  onCooldown: boolean;
  lastAvailableCount: number | null;
  lastPolledAt: string | null;
  lastAlertedAt: string | null;
  createdAt: string | null;
};
