import { EXERCISE_CAT } from "../../data/catalog.js";

export const setVolume = (s) => (Number(s.kg) || 0) * (Number(s.reps) || 0);

export const exerciseVolume = (ex) =>
  (ex.sets || []).reduce((t, s) => t + setVolume(s), 0);

export const sessionVolume = (session) =>
  (session.exercises || []).reduce((t, ex) => t + exerciseVolume(ex), 0);

// 1RM estimé (formule d'Epley)
export const estimate1RM = (s) =>
  (Number(s.kg) || 0) * (1 + (Number(s.reps) || 0) / 30);

export const bestSet = (sets) => {
  if (!sets || sets.length === 0) return null;
  return sets.reduce((best, s) => (estimate1RM(s) > estimate1RM(best) ? s : best));
};

export const sessionStats = (sessions) => ({
  count: sessions.length,
  totalVolume: sessions.reduce((t, s) => t + sessionVolume(s), 0),
});

export const byMuscleGroup = (sessions) => {
  const out = {};
  for (const session of sessions)
    for (const ex of session.exercises || []) {
      const cat = EXERCISE_CAT[ex.name] || "Autre";
      out[cat] = (out[cat] || 0) + exerciseVolume(ex);
    }
  return out;
};

export const totalReps = (sessions) =>
  sessions.reduce((t, s) => t + (s.exercises || []).reduce(
    (u, e) => u + (e.sets || []).reduce((v, x) => v + (Number(x.reps) || 0), 0), 0), 0);

export const totalSets = (sessions) =>
  sessions.reduce((t, s) => t + (s.exercises || []).reduce(
    (u, e) => u + (e.sets || []).length, 0), 0);

export const totalDuration = (sessions) =>
  sessions.reduce((t, s) => t + (Number(s.duration) || 0), 0);

export const volumeSeries = (sessions) =>
  sessions
    .map((s) => ({ date: s.date, label: s.label, volume: sessionVolume(s) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

// Records perso : meilleure série (par 1RM estimé) pour chaque exercice, triés.
export const personalRecords = (sessions) => {
  const best = {};
  for (const s of sessions)
    for (const ex of s.exercises || [])
      for (const set of ex.sets || []) {
        const e1rm = estimate1RM(set);
        if (!best[ex.name] || e1rm > best[ex.name].e1rm)
          best[ex.name] = { kg: Number(set.kg) || 0, reps: Number(set.reps) || 0, e1rm };
      }
  return Object.entries(best)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.e1rm - a.e1rm);
};

export const exerciseTimeline = (sessions, name) =>
  sessions
    .filter((s) => (s.exercises || []).some((e) => e.name === name))
    .map((s) => {
      const exs = s.exercises.filter((e) => e.name === name);
      const sets = exs.flatMap((e) => e.sets || []);
      return {
        date: s.date,
        volume: exs.reduce((t, e) => t + exerciseVolume(e), 0),
        top: sets.reduce((m, x) => Math.max(m, setVolume(x)), 0),
      };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
