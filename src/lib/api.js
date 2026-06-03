import { getPwd, getUid } from "./cache.js";

export class AuthError extends Error {}

async function call(path, { method = "GET", body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getPwd()}`,
  };
  const uid = getUid();
  if (uid) headers["X-User-Id"] = uid;
  const res = await fetch(`/api/${path}`, {
    method,
    headers,
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
  const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${pwd}` } });
  return res.ok;
}

// Profils
export const listUsers = () => call("users");
export const createUser = (u) => call("users", { method: "POST", body: u });
export const getUser = (id) => call(`users/${id}`);
export const updateUser = (id, u) => call(`users/${id}`, { method: "PUT", body: u });
export const deleteUser = (id) => call(`users/${id}`, { method: "DELETE" });

// Séances
export const listSessions = () => call("sessions");
export const createSession = (s) => call("sessions", { method: "POST", body: s });
export const updateSession = (id, s) => call(`sessions/${id}`, { method: "PUT", body: s });
export const deleteSession = (id) => call(`sessions/${id}`, { method: "DELETE" });

// Objectifs
export const listGoals = () => call("goals");
export const createGoal = (g) => call("goals", { method: "POST", body: g });
export const updateGoal = (id, g) => call(`goals/${id}`, { method: "PUT", body: g });
export const deleteGoal = (id) => call(`goals/${id}`, { method: "DELETE" });

// Métriques corporelles (poids + mensurations)
export const listMetrics = () => call("metrics");
export const createMetric = (m) => call("metrics", { method: "POST", body: m });
export const deleteMetric = (id) => call(`metrics/${id}`, { method: "DELETE" });

// Analyses de Claude
export const listAnalyses = () => call("analyses");
export const createAnalysis = (a) => call("analyses", { method: "POST", body: a });
export const deleteAnalysis = (id) => call(`analyses/${id}`, { method: "DELETE" });

// Photos de progression
export const listPhotos = () => call("photos");
export const createPhoto = (p) => call("photos", { method: "POST", body: p });
export const deletePhoto = (id) => call(`photos/${id}`, { method: "DELETE" });
