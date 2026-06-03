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
        if ((Number(set.kg) || 0) <= 0) continue; // ignore cardio / poids du corps
        const e1rm = estimate1RM(set);
        if (!best[ex.name] || e1rm > best[ex.name].e1rm)
          best[ex.name] = { kg: Number(set.kg) || 0, reps: Number(set.reps) || 0, e1rm };
      }
  return Object.entries(best)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.e1rm - a.e1rm);
};

// ─── Cardio / course ──────────────────────────────────────────────────────
// Une série cardio : { distance (km), duration (secondes), note? }.

export const isCardioSet = (s) =>
  s != null && (s.distance != null || s.duration != null) && s.reps == null;

// Allure en secondes par km (null si données manquantes)
export const pace = (s) => {
  const d = Number(s?.distance) || 0;
  const t = Number(s?.duration) || 0;
  if (d <= 0 || t <= 0) return null;
  return t / d;
};

// Vitesse en km/h (null si données manquantes)
export const speed = (s) => {
  const d = Number(s?.distance) || 0;
  const t = Number(s?.duration) || 0;
  if (d <= 0 || t <= 0) return null;
  return d / (t / 3600);
};

export const fmtPace = (secPerKm) => {
  if (secPerKm == null) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
};

export const fmtDuration = (sec) => {
  sec = Math.round(Number(sec) || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const exerciseDistance = (ex) =>
  (ex.sets || []).reduce((t, s) => t + (Number(s.distance) || 0), 0);

export const sessionDistance = (session) =>
  (session.exercises || []).reduce((t, ex) => t + exerciseDistance(ex), 0);

export const totalDistance = (sessions) =>
  sessions.reduce((t, s) => t + sessionDistance(s), 0);

// Meilleur temps (le plus court) sur une distance cible, parmi toutes les séries
// course/cardio proches de cette distance. Renvoie { date, distance, duration } ou null.
export const bestRunTime = (sessions, targetKm) => {
  const tol = Math.max(0.5, targetKm * 0.1);
  let best = null;
  for (const s of sessions)
    for (const ex of s.exercises || [])
      for (const set of ex.sets || []) {
        const d = Number(set.distance) || 0;
        const t = Number(set.duration) || 0;
        if (t <= 0 || Math.abs(d - targetKm) > tol) continue;
        if (!best || t < best.duration) best = { date: s.date, distance: d, duration: t };
      }
  return best;
};

// ─── Progression de charge / règle des reps ───────────────────────────────

// Charge max par séance pour un exercice donné, trié dans le temps.
export const weightProgression = (sessions, name) =>
  sessions
    .filter((s) => (s.exercises || []).some((e) => e.name === name))
    .map((s) => {
      const sets = (s.exercises || [])
        .filter((e) => e.name === name)
        .flatMap((e) => e.sets || []);
      return { date: s.date, kg: sets.reduce((m, x) => Math.max(m, Number(x.kg) || 0), 0) };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));

// Règle des reps : toutes les séries de travail (kg>0 & reps>0) atteignent le
// seuil → on peut monter la charge.
export const shouldIncreaseWeight = (exercise, threshold = 13) => {
  const working = (exercise?.sets || []).filter(
    (s) => (Number(s.kg) || 0) > 0 && (Number(s.reps) || 0) > 0
  );
  if (working.length === 0) return false;
  return working.every((s) => (Number(s.reps) || 0) >= threshold);
};

// Dernière occurrence (séance la plus récente) de chaque exercice.
const latestExerciseOccurrences = (sessions) => {
  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1)); // récent → ancien
  const seen = {};
  for (const s of sorted)
    for (const ex of s.exercises || [])
      if (!seen[ex.name]) seen[ex.name] = { exercise: ex, date: s.date };
  return seen;
};

// Exercices dont la dernière séance déclenche la règle des reps.
export const exercisesReadyToProgress = (sessions, threshold = 13) => {
  const occ = latestExerciseOccurrences(sessions);
  return Object.entries(occ)
    .filter(([, v]) => shouldIncreaseWeight(v.exercise, threshold))
    .map(([name, v]) => ({ name, date: v.date }));
};

// ─── Poids de corps & mensurations (body_metrics) ─────────────────────────

export const metricSeries = (metrics, kind) =>
  (metrics || [])
    .filter((m) => m.kind === kind)
    .map((m) => ({ date: m.date, value: Number(m.value) || 0, id: m.id }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

export const bodyweightSeries = (metrics) => metricSeries(metrics, "weight");

export const latestMetric = (metrics, kind) => {
  const s = metricSeries(metrics, kind);
  return s.length ? s[s.length - 1] : null;
};

export const latestAnalysis = (analyses) =>
  (analyses || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null;

// ─── Objectifs ────────────────────────────────────────────────────────────
// goal : { type, target, exercise?, kind?, target_distance?, target_seconds?, baseline?, label }
// Renvoie { current, baseline, target, pct (0..1), remaining, ok }

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export const goalProgress = (goal, { sessions = [], metrics = [] } = {}) => {
  const none = { current: null, baseline: null, target: goal.target, pct: 0, remaining: null, ok: false };
  if (goal.type === "lift") {
    const prog = weightProgression(sessions, goal.exercise);
    if (prog.length === 0) return none;
    const current = prog.reduce((m, p) => Math.max(m, p.kg), 0);
    const baseline = goal.baseline != null ? goal.baseline : prog[0].kg;
    const target = goal.target;
    const pct = target === baseline ? (current >= target ? 1 : 0)
      : clamp01((current - baseline) / (target - baseline));
    return { current, baseline, target, pct, remaining: Math.max(0, target - current), ok: current >= target };
  }
  if (goal.type === "bodyweight" || goal.type === "measurement") {
    const kind = goal.type === "bodyweight" ? "weight" : goal.kind;
    const series = metricSeries(metrics, kind);
    if (series.length === 0) return none;
    const current = series[series.length - 1].value;
    const baseline = goal.baseline != null ? goal.baseline : series[0].value;
    const target = goal.target;
    // marche que l'objectif soit à la hausse ou à la baisse
    const pct = target === baseline ? (current === target ? 1 : 0)
      : clamp01((current - baseline) / (target - baseline));
    return { current, baseline, target, pct, remaining: target - current, ok: pct >= 1 };
  }
  if (goal.type === "running") {
    const best = bestRunTime(sessions, goal.target_distance);
    if (!best) return { ...none, target: goal.target_seconds };
    const current = best.duration; // plus bas = mieux
    const baseline = goal.baseline != null ? goal.baseline : current;
    const target = goal.target_seconds;
    const pct = baseline === target ? (current <= target ? 1 : 0)
      : clamp01((baseline - current) / (baseline - target));
    return { current, baseline, target, pct, remaining: Math.max(0, current - target), ok: current <= target };
  }
  return none;
};

// Objectif "héros" = celui épinglé, sinon le plus avancé.
export const heroGoal = (goals, ctx) => {
  if (!goals || goals.length === 0) return null;
  const pinned = goals.find((g) => g.pinned);
  if (pinned) return pinned;
  return goals
    .map((g) => ({ g, pct: goalProgress(g, ctx).pct }))
    .sort((a, b) => b.pct - a.pct)[0].g;
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
