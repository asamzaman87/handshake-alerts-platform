import { TEST_MODE } from "./constants";

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
  checkIntervalMinutes: number;
  lastAvailableCount: number | null;
  lastPolledAt: string | null;
  lastAlertedAt: string | null;
  createdAt: string | null;
};

export const CHECK_INTERVAL_OPTIONS = [
  ...(TEST_MODE ? ([1] as const) : ([] as const)),
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
] as const;

export function formatCheckInterval(minutes: number) {
  if (minutes === 1) return "1 minute";
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes === 60) return "1 hour";
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} hours`;
  return `${minutes} minutes`;
}
