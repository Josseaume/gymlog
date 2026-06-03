import { useState } from "react";
import { S, COLORS } from "../styles.js";
import { ALL_EXERCISES } from "../../data/catalog.js";
import { goalProgress, fmtDuration } from "../lib/metrics.js";

const TYPES = [
  { key: "lift", label: "💪 Charge" },
  { key: "bodyweight", label: "⚖️ Poids" },
  { key: "running", label: "🏃 Course" },
  { key: "measurement", label: "📏 Mesure" },
];
const MEAS = [
  ["arm_l", "Bras gauche"], ["arm_r", "Bras droit"], ["chest", "Poitrine"],
  ["waist", "Taille"], ["thigh", "Cuisse"], ["shoulders", "Épaules"], ["calf", "Mollet"],
];
const STRENGTH = ALL_EXERCISES.filter((e) => e.type === "strength").map((e) => e.name);

const num = (v) => (v === "" ? null : Number(v));

export default function GoalsEditor({ goals, ctx, onAdd, onDelete, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("lift");
  const [f, setF] = useState({ exercise: STRENGTH[0], target: "", kind: "arm_l", dist: "5", min: "25", sec: "0", pinned: false });

  const reset = () => { setAdding(false); setF({ exercise: STRENGTH[0], target: "", kind: "arm_l", dist: "5", min: "25", sec: "0", pinned: false }); };

  const submit = async () => {
    const g = { type, pinned: f.pinned };
    if (type === "lift") { g.exercise = f.exercise; g.target = num(f.target); }
    else if (type === "bodyweight") { g.target = num(f.target); }
    else if (type === "measurement") { g.kind = f.kind; g.target = num(f.target); }
    else if (type === "running") { g.target_distance = num(f.dist); g.target_seconds = (num(f.min) || 0) * 60 + (num(f.sec) || 0); }
    await onAdd(g);
    reset();
  };

  return (
    <div>
      {goals.map((g) => {
        const p = goalProgress(g, ctx);
        const label = g.label || g.exercise || (g.kind ? MEAS.find((m) => m[0] === g.kind)?.[1] : null)
          || (g.type === "running" ? `${g.target_distance} km` : g.type === "bodyweight" ? "Poids de corps" : "Objectif");
        const tgt = g.type === "running" ? fmtDuration(g.target_seconds) : `${g.target}`;
        return (
          <div key={g.id} style={{ ...S.goalRow, justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: COLORS.text }}>
                {g.pinned ? "📌 " : ""}{label} → {tgt}
              </div>
              <div style={{ fontSize: 11, color: COLORS.dim }}>{Math.round(p.pct * 100)}%</div>
            </div>
            <button style={S.timerBtn} title="Épingler" onClick={() => onUpdate(g.id, { ...g, pinned: !g.pinned })}>📌</button>
            <button style={S.timerBtn} onClick={() => onDelete(g.id)}>✕</button>
          </div>
        );
      })}
      {goals.length === 0 && <div style={{ fontSize: 12, color: COLORS.dim, padding: "4px 0" }}>Aucun objectif pour l'instant.</div>}

      {!adding ? (
        <button style={{ ...S.btnGhost, width: "100%", marginTop: 10 }} onClick={() => setAdding(true)}>+ Ajouter un objectif</button>
      ) : (
        <div style={{ ...S.card, marginTop: 10 }}>
          <div style={S.filterRow}>
            {TYPES.map((t) => (
              <button key={t.key} style={type === t.key ? S.filterChipOn : S.filterChip} onClick={() => setType(t.key)}>{t.label}</button>
            ))}
          </div>

          {type === "lift" && (
            <>
              <span style={S.label}>Exercice</span>
              <select style={S.input} value={f.exercise} onChange={(e) => setF({ ...f, exercise: e.target.value })}>
                {STRENGTH.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span style={{ ...S.label, marginTop: 8 }}>Cible (kg)</span>
              <input style={S.input} type="number" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} />
            </>
          )}
          {type === "bodyweight" && (
            <>
              <span style={S.label}>Poids cible (kg)</span>
              <input style={S.input} type="number" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} />
            </>
          )}
          {type === "measurement" && (
            <>
              <span style={S.label}>Mensuration</span>
              <select style={S.input} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
                {MEAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <span style={{ ...S.label, marginTop: 8 }}>Cible (cm)</span>
              <input style={S.input} type="number" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} />
            </>
          )}
          {type === "running" && (
            <>
              <span style={S.label}>Distance (km)</span>
              <input style={S.input} type="number" value={f.dist} onChange={(e) => setF({ ...f, dist: e.target.value })} />
              <span style={{ ...S.label, marginTop: 8 }}>Temps cible</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input style={{ ...S.input, flex: 1 }} type="number" placeholder="min" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} />
                <span style={{ color: COLORS.dim }}>:</span>
                <input style={{ ...S.input, flex: 1 }} type="number" placeholder="sec" value={f.sec} onChange={(e) => setF({ ...f, sec: e.target.value })} />
              </div>
            </>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: COLORS.text }}>
            <input type="checkbox" checked={f.pinned} onChange={(e) => setF({ ...f, pinned: e.target.checked })} />
            Objectif principal (héros du dashboard)
          </label>

          <button style={{ ...S.btnPrimary, marginTop: 12 }} onClick={submit}>Enregistrer l'objectif</button>
          <button style={S.btnDanger} onClick={reset}>Annuler</button>
        </div>
      )}
    </div>
  );
}
