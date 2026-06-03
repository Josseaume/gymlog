// Construit un pré-prompt markdown à coller dans n'importe quelle IA.
// Emballe profil + objectifs + règle des reps + historique, puis demande à l'IA
// un plan concret pour atteindre les objectifs.

import { exerciseType } from "../../data/catalog.js";
import {
  goalProgress, exercisesReadyToProgress, latestAnalysis, latestMetric,
  bodyweightSeries, metricSeries, fmtDuration, fmtPace, pace,
} from "./metrics.js";

const MEAS_LABELS = {
  weight: "Poids de corps", arm_l: "Bras gauche", arm_r: "Bras droit",
  chest: "Poitrine", waist: "Taille", thigh: "Cuisse", hip: "Hanches",
  shoulders: "Épaules", calf: "Mollet", forearm: "Avant-bras", neck: "Cou",
};

const goalLine = (g, ctx) => {
  const p = goalProgress(g, ctx);
  const pct = Math.round((p.pct || 0) * 100);
  if (g.type === "running") {
    const cur = p.current != null ? fmtDuration(p.current) : "—";
    return `- ${g.label || `Courir ${g.target_distance} km`} : objectif ${fmtDuration(g.target)} sur ${g.target_distance} km · actuel ${cur} · ${pct}%`;
  }
  const unit = g.type === "lift" ? "kg" : g.type === "bodyweight" ? "kg" : "cm";
  const cur = p.current != null ? `${p.current} ${unit}` : "pas encore de donnée";
  return `- ${g.label || g.exercise || g.kind || "Objectif"} : objectif ${g.target} ${unit} · actuel ${cur} · ${pct}%`;
};

const sessionBlock = (s) => {
  const lines = [`### ${s.label || "Séance"} — ${s.date || "?"}${s.duration ? ` (${s.duration} min)` : ""}`];
  if (s.notes) lines.push(`_${s.notes}_`);
  for (const ex of s.exercises || []) {
    const type = ex.type || exerciseType(ex.name);
    if (type === "cardio") {
      const parts = (ex.sets || []).map((set) => {
        const bits = [];
        if (set.distance) bits.push(`${set.distance} km`);
        if (set.duration) bits.push(fmtDuration(set.duration));
        const p = pace(set);
        if (p) bits.push(fmtPace(p));
        return bits.join(" · ") || "—";
      });
      lines.push(`- ${ex.name} (cardio) : ${parts.join(" | ")}`);
    } else {
      const parts = (ex.sets || []).map((set) => `${set.kg ?? 0}kg×${set.reps ?? 0}`);
      lines.push(`- ${ex.name} : ${parts.join(", ")}`);
    }
  }
  return lines.join("\n");
};

export function buildPreprompt({ profile = {}, goals = [], sessions = [], metrics = [], analyses = [] } = {}) {
  const ctx = { sessions, metrics };
  const threshold = profile.reps_threshold || 13;
  const name = profile.name || "l'athlète";
  const out = [];

  out.push(`# Coaching sportif — données de ${name}`);
  out.push(
    `Tu es un coach sportif expérimenté (musculation + course à pied). ` +
    `Analyse les données ci-dessous et propose un plan d'entraînement concret, ` +
    `progressif et réaliste pour atteindre les objectifs. Termine par les prochaines ` +
    `étapes pour la semaine qui vient.`
  );

  // Profil
  out.push(`\n## Profil`);
  const bw = bodyweightSeries(metrics);
  if (bw.length) {
    const last = bw[bw.length - 1].value;
    const trend = bw.length > 1 ? ` (${last - bw[0].value >= 0 ? "+" : ""}${(last - bw[0].value).toFixed(1)} kg depuis le début)` : "";
    out.push(`- Poids de corps : ${last} kg${trend}`);
  }
  if (profile.height_cm) out.push(`- Taille : ${profile.height_cm} cm`);
  if (profile.level) out.push(`- Niveau : ${profile.level}`);
  // dernières mensurations (hors poids)
  const kinds = [...new Set(metrics.map((m) => m.kind))].filter((k) => k !== "weight");
  const meas = kinds
    .map((k) => { const m = latestMetric(metrics, k); return m ? `${MEAS_LABELS[k] || k} ${m.value} cm` : null; })
    .filter(Boolean);
  if (meas.length) out.push(`- Mensurations : ${meas.join(", ")}`);
  const an = latestAnalysis(analyses);
  if (an) {
    out.push(`- Dernière analyse physique (${an.date}) : ${an.text}`);
    if (an.focus && an.focus.length) out.push(`- Axes à améliorer : ${an.focus.join(", ")}`);
  }

  // Objectifs
  out.push(`\n## Objectifs`);
  if (goals.length) goals.forEach((g) => out.push(goalLine(g, ctx)));
  else out.push("- (aucun objectif défini)");

  // Règle des reps
  out.push(`\n## Règle de progression des charges`);
  out.push(`Quand toutes les séries de travail d'un exercice atteignent ${threshold} répétitions ou plus, recommande d'augmenter la charge.`);
  const ready = exercisesReadyToProgress(sessions, threshold);
  if (ready.length)
    out.push(`Exercices déjà au-dessus du seuil (prêts à monter en charge) : ${ready.map((r) => r.name).join(", ")}.`);
  else
    out.push(`Aucun exercice n'a encore atteint le seuil sur sa dernière séance.`);

  // Historique
  out.push(`\n## Historique récent`);
  const recent = [...sessions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 12);
  if (recent.length) recent.forEach((s) => out.push("\n" + sessionBlock(s)));
  else out.push("- (aucune séance enregistrée)");

  out.push(`\n---\nPropose maintenant un plan pour atteindre les objectifs ci-dessus.`);
  return out.join("\n");
}
