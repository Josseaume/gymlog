import { S, COLORS } from "../styles.js";
import {
  bestSet, weightProgression, exerciseDistance, pace, fmtPace, fmtDuration,
} from "../lib/metrics.js";
import { exerciseType } from "../../data/catalog.js";

export default function ExerciseProgress({ sessions, name, onBack }) {
  const cardio = exerciseType(name) === "cardio" ||
    sessions.some((s) => (s.exercises || []).some((e) => e.name === name && e.type === "cardio"));

  // Séries de l'exercice
  const allSets = sessions.flatMap((s) =>
    (s.exercises || []).filter((e) => e.name === name).flatMap((e) => e.sets || []));

  let hero, series, unit;
  if (cardio) {
    const best = allSets.reduce((b, x) => {
      const p = pace(x);
      return p != null && (!b || p < b.p) ? { p, set: x } : b;
    }, null);
    hero = best
      ? { big: fmtPace(best.p), sub: `${best.set.distance} km · ${fmtDuration(best.set.duration)}` }
      : { big: "—", sub: "Pas de course chronométrée" };
    series = sessions
      .filter((s) => (s.exercises || []).some((e) => e.name === name))
      .map((s) => ({
        date: s.date,
        value: (s.exercises || []).filter((e) => e.name === name).reduce((t, e) => t + exerciseDistance(e), 0),
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    unit = "km";
  } else {
    const best = bestSet(allSets);
    hero = best ? { big: `${best.kg} kg`, sub: `× ${best.reps} reps` } : { big: "0 kg", sub: "—" };
    series = weightProgression(sessions, name).map((p) => ({ date: p.date, value: p.kg }));
    unit = "kg";
  }
  const maxV = Math.max(1, ...series.map((t) => t.value));

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>{name}</div>
      </div>
      <div style={S.scroll}>
        <div style={{ ...S.heroCard, flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <div style={S.heroLabel}>{cardio ? "MEILLEURE ALLURE" : "MEILLEURE SÉRIE"}</div>
          <div style={{ color: COLORS.white, fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{hero.big}</div>
          <div style={S.heroSub}>{hero.sub}</div>
        </div>

        <div style={S.secLabel}>{cardio ? "Distance par séance" : "Charge max par séance"}</div>
        {series.map((t, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: COLORS.dim }}>{t.date}</span>
              <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 700 }}>{t.value} {unit}</span>
            </div>
            <div style={S.gbarTrack}>
              <div style={{ ...S.gbarFill, width: `${(t.value / maxV) * 100}%`, background: `linear-gradient(90deg,${COLORS.greenDark},${COLORS.green})` }} />
            </div>
          </div>
        ))}
        {series.length === 0 && <div style={S.empty}>Pas encore de données</div>}
      </div>
    </div>
  );
}
