import { getPwd } from "./cache.js";

export class AuthError extends Error {}

async function call(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getPwd()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new AuthError("Mot de passe incorrect");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Teste un mot de passe donné (indépendant du cache).
export async function checkAuth(pwd) {
  const res = await fetch("/api/sessions", { headers: { Authorization: `Bearer ${pwd}` } });
  return res.ok;
}

export const listSessions = () => call("sessions");
export const createSession = (s) => call("sessions", { method: "POST", body: s });
export const updateSession = (id, s) => call(`sessions/${id}`, { method: "PUT", body: s });
export const deleteSession = (id) => call(`sessions/${id}`, { method: "DELETE" });
