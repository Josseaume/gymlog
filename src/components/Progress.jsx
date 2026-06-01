import { useState } from "react";
import { S } from "../styles.js";
import {
  sessionStats, byMuscleGroup, volumeSeries, personalRecords,
  totalDuration, totalSets, totalReps,
} from "../lib/metrics.js";
import ExerciseProgress from "./ExerciseProgress.jsx";

const fmtVol = (kg) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)}` : `${kg}`);
const volUnit = (kg) => (kg >= 1000 ? "t" : "kg");

export default function Progress({ sessions, onBack }) {
  const [exo, setExo] = useState(null);
  const [showAll, setShowAll] = useState(false);
  if (exo) return <ExerciseProgress sessions={sessions} name={exo} onBack={() => setExo(null)} />;

  const stats = sessionStats(sessions);
  const groups = Object.entries(byMuscleGroup(sessions)).sort((a, b) => b[1] - a[1]);
  const groupTotal = groups.reduce((t, [, v]) => t + v, 0) || 1;
  const series = volumeSeries(sessions);
  const maxSerie = Math.max(1, ...series.map((s) => s.volume));
  const records = personalRecords(sessions);
  const dur = totalDuration(sessions);
  const avgVol = stats.count ? Math.round(stats.totalVolume / stats.count) : 0;
  const allNames = [...new Set(sessions.flatMap((s) => (s.exercises || []).map((e) => e.name)))].sort();

  const tiles = [
    { label: "SÉANCES", val: stats.count, unit: "" },
    { label: "VOLUME", val: fmtVol(stats.totalVolume), unit: volUnit(stats.totalVolume) },
    { label: "TEMPS", val: dur >= 60 ? (dur / 60).toFixed(1) : dur, unit: dur >= 60 ? "h" : "min" },
    { label: "VOL/SÉANCE", val: fmtVol(avgVol), unit: volUnit(avgVol) },
    { label: "SÉRIES", val: totalSets(sessions), unit: "" },
    { label: "RÉPÉTITIONS", val: totalReps(sessions), unit: "" },
  ];

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>Dashboard</div>
      </div>
      <div style={S.scroll}>
        {sessions.length === 0 ? (
          <div style={S.empty}>Aucune donnée. Logge une séance !</div>
        ) : (
          <>
            {/* KPI tiles */}
            <div style={D.grid}>
              {tiles.map((t, i) => (
                <div key={t.label} style={{ ...D.tile, animationDelay: `${i * 45}ms` }}>
                  <span style={D.tileLabel}>{t.label}</span>
                  <span style={D.tileVal}>
                    {t.val}<span style={D.tileUnit}>{t.unit}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Volume trend — vertical bars per session */}
            <div style={D.sectionHead}>
              <span style={D.sectionTitle}>▌ VOLUME / SÉANCE</span>
              <span style={D.sectionMeta}>{series.length} pts</span>
            </div>
            <div style={D.panel}>
              <div style={D.chart}>
                {series.map((s, i) => {
                  const h = Math.max(4, (s.volume / maxSerie) * 100);
                  const peak = s.volume === maxSerie;
                  return (
                    <div key={i} style={D.barCol} title={`${s.label} · ${s.date} · ${s.volume} kg`}>
                      <div style={{
                        ...D.bar, height: `${h}%`,
                        background: peak
                          ? "linear-gradient(180deg,#d9ff5e,#a3e635)"
                          : "linear-gradient(180deg,#5a8a1a,#2f4a0d)",
                        boxShadow: peak ? "0 0 10px rgba(163,230,53,0.45)" : "none",
                      }} />
                    </div>
                  );
                })}
              </div>
              <div style={D.chartAxis}>
                <span>{series[0]?.date?.slice(5)}</span>
                <span style={{ color: "#a3e635" }}>↑ {maxSerie} kg</span>
                <span>{series[series.length - 1]?.date?.slice(5)}</span>
              </div>
            </div>

            {/* Muscle split */}
            <div style={D.sectionHead}>
              <span style={D.sectionTitle}>▌ RÉPARTITION</span>
              <span style={D.sectionMeta}>{groups.length} groupes</span>
            </div>
            <div style={D.panel}>
              {groups.map(([cat, v]) => {
                const pct = Math.round((v / groupTotal) * 100);
                return (
                  <div key={cat} style={D.splitRow}>
                    <span style={D.splitName}>{cat}</span>
                    <div style={D.splitTrack}>
                      <div style={{ ...D.splitFill, width: `${(v / groups[0][1]) * 100}%` }} />
                    </div>
                    <span style={D.splitPct}>{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* PR leaderboard */}
            <div style={D.sectionHead}>
              <span style={D.sectionTitle}>▌ RECORDS</span>
              <span style={D.sectionMeta}>1RM est.</span>
            </div>
            <div style={D.panel}>
              {records.slice(0, showAll ? records.length : 5).map((r, i) => (
                <button key={r.name} style={D.prRow} onClick={() => setExo(r.name)}>
                  <span style={D.prRank}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={D.prName}>{r.name}</span>
                  <span style={D.prVal}>
                    ~{Math.round(r.e1rm)}<span style={D.prUnit}>kg</span>
                    <span style={D.prBest}>{r.kg}×{r.reps}</span>
                  </span>
                  <span style={D.prChev}>›</span>
                </button>
              ))}
            </div>

            {records.length > 5 && (
              <button style={D.moreBtn} onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Réduire" : `+ ${records.length - 5} autres exercices`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const D = {
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 4 },
  tile: {
    background: "linear-gradient(160deg,#161616,#101010)", border: "1px solid #232323",
    borderRadius: 12, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 6,
    animation: "gl-rise 0.45s ease both",
  },
  tileLabel: { fontSize: 9, fontWeight: 700, color: "#5a6a3a", letterSpacing: "0.12em" },
  tileVal: { fontSize: 22, fontWeight: 800, color: "#a3e635", letterSpacing: "-0.5px", lineHeight: 1 },
  tileUnit: { fontSize: 11, color: "#5a6a3a", fontWeight: 600, marginLeft: 2 },

  sectionHead: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    marginTop: 22, marginBottom: 8,
  },
  sectionTitle: { fontSize: 11, fontWeight: 800, color: "#cfe89a", letterSpacing: "0.1em" },
  sectionMeta: { fontSize: 10, color: "#3a3a3a", letterSpacing: "0.08em" },

  panel: { background: "#101010", border: "1px solid #1d1d1d", borderRadius: 12, padding: 14 },

  chart: { display: "flex", alignItems: "flex-end", gap: 3, height: 96 },
  barCol: { flex: 1, height: "100%", display: "flex", alignItems: "flex-end" },
  bar: { width: "100%", borderRadius: "3px 3px 0 0", transition: "height 0.5s ease" },
  chartAxis: {
    display: "flex", justifyContent: "space-between", marginTop: 8,
    fontSize: 10, color: "#3f3f3f", letterSpacing: "0.05em",
  },

  splitRow: { display: "flex", alignItems: "center", gap: 10, padding: "5px 0" },
  splitName: { fontSize: 12, color: "#aaa", width: 78, flexShrink: 0 },
  splitTrack: { flex: 1, height: 6, background: "#1c1c1c", borderRadius: 3, overflow: "hidden" },
  splitFill: { height: "100%", background: "linear-gradient(90deg,#3a6a0a,#a3e635)", borderRadius: 3 },
  splitPct: { fontSize: 11, color: "#a3e635", fontWeight: 700, width: 34, textAlign: "right" },

  prRow: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none",
    border: "none", borderTop: "1px solid #1a1a1a", padding: "10px 0", cursor: "pointer",
    fontFamily: "inherit", textAlign: "left",
  },
  prRank: { fontSize: 11, color: "#3a4a1a", fontWeight: 800, width: 20, flexShrink: 0 },
  prName: { flex: 1, minWidth: 0, fontSize: 12.5, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  prVal: { fontSize: 15, color: "#a3e635", fontWeight: 800, display: "flex", alignItems: "baseline", gap: 6, flexShrink: 0 },
  prUnit: { fontSize: 10, color: "#5a6a3a", marginLeft: 1 },
  prBest: { fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "0.03em" },
  prChev: { color: "#333", fontSize: 18, marginLeft: 2 },

  moreBtn: {
    width: "100%", background: "none", border: "1px dashed #2a2a2a", borderRadius: 8,
    padding: 10, color: "#7a8a5a", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 10,
  },
};
