import { S, COLORS } from "../styles.js";
import {
  heroGoal, goalProgress, sessionStats, totalDistance,
  exercisesReadyToProgress, weightProgression, fmtDuration,
} from "../lib/metrics.js";

const GOAL_ICON = { lift: "💪", bodyweight: "⚖️", running: "🏃", measurement: "📏" };

const fmtVal = (g, p) => {
  if (p.current == null) return "—";
  if (g.type === "running") return fmtDuration(p.current);
  const u = g.type === "lift" || g.type === "bodyweight" ? "kg" : "cm";
  return `${p.current} ${u}`;
};
const goalLabel = (g) =>
  g.label || (g.type === "lift" ? `${g.exercise} ${g.target}kg`
    : g.type === "bodyweight" ? `Poids ${g.target}kg`
    : g.type === "running" ? `${g.target_distance}km en ${fmtDuration(g.target_seconds)}`
    : g.type === "measurement" ? `${g.kind} ${g.target}cm` : "Objectif");

function Ring({ pct }) {
  const deg = Math.round(pct * 360);
  return (
    <div style={{ position: "relative", width: 74, height: 74, flexShrink: 0 }}>
      <div style={{ width: 74, height: 74, borderRadius: "50%", background: `conic-gradient(#fff ${deg}deg, rgba(255,255,255,0.22) 0)` }} />
      <div style={{ position: "absolute", inset: 7, borderRadius: "50%", background: "#19794b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 19, fontWeight: 800 }}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}

const within7Days = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return (Date.now() - d.getTime()) <= 7 * 864e5 + 864e5;
};

export default function Dashboard({ profile, sessions, goals, metrics, onOpenExercise, onAddGoal }) {
  const ctx = { sessions, metrics };
  const threshold = profile?.reps_threshold || 13;
  const hero = heroGoal(goals, ctx);
  const heroP = hero ? goalProgress(hero, ctx) : null;

  const week = sessions.filter((s) => within7Days(s.date));
  const kpis = [
    { label: "Séances", val: week.length },
    { label: "Course", val: `${Math.round(totalDistance(week) * 10) / 10} km` },
    { label: "Volume", val: `${(sessionStats(week).totalVolume / 1000).toFixed(1)} t`, dim: true },
  ];

  const ready = exercisesReadyToProgress(sessions, threshold);
  const names = [...new Set(sessions.flatMap((s) => (s.exercises || []).map((e) => e.name)))];
  const movers = names
    .map((n) => { const p = weightProgression(sessions, n); return p.length > 1 ? { name: n, from: p[0].kg, to: p[p.length - 1].kg } : null; })
    .filter((m) => m && m.to > m.from)
    .sort((a, b) => (b.to - b.from) - (a.to - a.from))
    .slice(0, 3);

  return (
    <div style={S.screen}>
      <div style={{ ...S.topBar, justifyContent: "space-between" }}>
        <div>
          <div style={S.greet}>Salut {profile?.name || ""} 👋</div>
          <div style={S.greetSub}>{week.length} séance{week.length > 1 ? "s" : ""} cette semaine</div>
        </div>
        <span style={{ fontSize: 26 }}>{profile?.emoji || "🦾"}</span>
      </div>

      <div style={S.scroll}>
        {/* Héros objectif */}
        {hero ? (
          <div style={S.heroCard}>
            <Ring pct={heroP.pct} />
            <div>
              <div style={S.heroLabel}>Objectif principal</div>
              <div style={S.heroTitle}>{goalLabel(hero)}</div>
              <div style={S.heroSub}>
                {heroP.ok ? "Atteint ! 🎉" : `Actuel : ${fmtVal(hero, heroP)}`}
              </div>
            </div>
          </div>
        ) : (
          <button style={{ ...S.heroCard, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" }} onClick={onAddGoal}>
            <span style={{ fontSize: 34 }}>🎯</span>
            <div>
              <div style={S.heroTitle}>Définis ton premier objectif</div>
              <div style={S.heroSub}>Pour suivre ta progression jour après jour</div>
            </div>
          </button>
        )}

        {/* Objectifs */}
        {goals.length > 0 && (
          <>
            <div style={S.secHead}><span style={S.secLabel}>Tes objectifs</span></div>
            {goals.map((g) => {
              const p = goalProgress(g, ctx);
              const pct = Math.round(p.pct * 100);
              const col = p.ok ? COLORS.green : pct >= 50 ? COLORS.green : COLORS.orange;
              return (
                <div key={g.id} style={S.goalRow}>
                  <span style={{ fontSize: 16 }}>{GOAL_ICON[g.type] || "🎯"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: COLORS.text, fontSize: 12.5 }}>{goalLabel(g)}</span>
                      <span style={{ color: col, fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ ...S.gbarTrack, marginTop: 4 }}>
                      <div style={{ ...S.gbarFill, width: `${pct}%`, background: col }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* KPIs secondaires */}
        <div style={S.secHead}><span style={S.secLabel}>Cette semaine</span></div>
        <div style={S.kpiGrid}>
          {kpis.map((k) => (
            <div key={k.label} style={S.kpi}>
              <div style={S.kpiLabel}>{k.label}</div>
              <div style={{ ...S.kpiVal, color: k.dim ? COLORS.dim : COLORS.white }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Ça progresse */}
        {(ready.length > 0 || movers.length > 0) && (
          <div style={S.secHead}><span style={S.secLabel}>Ça progresse 📈</span></div>
        )}
        {ready.map((r) => (
          <button key={`r-${r.name}`} style={S.row} onClick={() => onOpenExercise(r.name)}>
            <span style={{ ...S.dot, background: COLORS.orangeSoft }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={S.rowTitle}>{r.name}</div>
              <div style={{ ...S.rowSub, color: COLORS.orange }}>13+ reps atteint → monte le poids !</div>
            </div>
            <span style={S.chev}>›</span>
          </button>
        ))}
        {movers.map((m) => (
          <button key={`m-${m.name}`} style={S.row} onClick={() => onOpenExercise(m.name)}>
            <span style={{ ...S.dot, background: COLORS.greenSoft }}>💪</span>
            <div style={{ flex: 1 }}>
              <div style={S.rowTitle}>{m.name}</div>
              <div style={S.rowSub}>{m.from} → {m.to} kg</div>
            </div>
            <span style={{ ...S.chev, color: COLORS.green }}>↑</span>
          </button>
        ))}

        {sessions.length === 0 && goals.length === 0 && (
          <div style={S.empty}>Logge ta première séance pour voir tes stats apparaître ici.</div>
        )}
      </div>
    </div>
  );
}
