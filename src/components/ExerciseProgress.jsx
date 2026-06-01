import { S } from "../styles.js";
import { exerciseTimeline, bestSet } from "../lib/metrics.js";

export default function ExerciseProgress({ sessions, name, onBack }) {
  const timeline = exerciseTimeline(sessions, name);
  const allSets = sessions.flatMap((s) =>
    (s.exercises || []).filter((e) => e.name === name).flatMap((e) => e.sets || []));
  const best = bestSet(allSets);
  const maxVol = Math.max(1, ...timeline.map((t) => t.volume));

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>{name}</div>
      </div>
      <div style={S.scroll}>
        <div style={S.heroCard}>
          <div style={S.heroLabel}>MEILLEURE SÉRIE</div>
          <div style={S.heroVal}>{best ? best.kg : 0}<span style={S.heroUnit}>kg</span></div>
          <div style={S.heroSub}>{best ? `× ${best.reps} reps` : "—"}</div>
        </div>
        <div style={S.secLabel}>Volume par séance</div>
        {timeline.map((t, i) => (
          <div key={i} style={S.barWrap}>
            <div style={S.barMeta}>
              <span style={S.barName}>{t.date}</span>
              <span style={S.barNum}>{t.volume} kg</span>
            </div>
            <div style={S.barTrack}>
              <div style={{ ...S.barFill, width: `${(t.volume / maxVol) * 100}%` }} />
            </div>
          </div>
        ))}
        {timeline.length === 0 && <div style={S.empty}>Pas encore de données</div>}
      </div>
    </div>
  );
}
