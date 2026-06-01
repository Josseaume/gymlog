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
