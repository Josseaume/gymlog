import { useState } from "react";
import { S } from "../styles.js";
import { sessionStats, byMuscleGroup } from "../lib/metrics.js";
import ExerciseProgress from "./ExerciseProgress.jsx";

export default function Progress({ sessions, onBack }) {
  const [exo, setExo] = useState(null);
  if (exo) return <ExerciseProgress sessions={sessions} name={exo} onBack={() => setExo(null)} />;

  const stats = sessionStats(sessions);
  const groups = byMuscleGroup(sessions);
  const maxG = Math.max(1, ...Object.values(groups));
  const names = [...new Set(sessions.flatMap((s) => (s.exercises || []).map((e) => e.name)))].sort();

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>Progression</div>
      </div>
      <div style={S.scroll}>
        <div style={S.heroCard}>
          <div style={S.heroLabel}>VOLUME TOTAL</div>
          <div style={S.heroVal}>{Math.round(stats.totalVolume / 1000)}<span style={S.heroUnit}>t</span></div>
          <div style={S.heroSub}>{stats.count} séances</div>
        </div>
        <div style={S.secLabel}>Volume par groupe musculaire</div>
        {Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
          <div key={cat} style={S.barWrap}>
            <div style={S.barMeta}><span style={S.barName}>{cat}</span><span style={S.barNum}>{v} kg</span></div>
            <div style={S.barTrack}><div style={{ ...S.barFill, width: `${(v / maxG) * 100}%` }} /></div>
          </div>
        ))}
        <div style={S.secLabel}>Par exercice</div>
        {names.map((n) => (
          <button key={n} style={S.exProgRow} onClick={() => setExo(n)}>
            <div style={S.exProgLeft}><span style={S.exProgName}>{n}</span></div>
            <span style={S.chev}>›</span>
          </button>
        ))}
        {names.length === 0 && <div style={S.empty}>Aucune donnée</div>}
      </div>
    </div>
  );
}
