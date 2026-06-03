import { useState } from "react";
import { S, COLORS } from "../styles.js";
import {
  exerciseVolume, sessionVolume, shouldIncreaseWeight,
  exerciseDistance, pace, fmtPace,
} from "../lib/metrics.js";
import { exerciseType } from "../../data/catalog.js";
import ExercisePicker from "./ExercisePicker.jsx";
import RestTimer from "./RestTimer.jsx";

const blankSet = (type) => (type === "cardio" ? { distance: 0, duration: 0 } : { kg: 0, reps: 0 });
const num = (v) => (v === "" ? 0 : Number(v));

export default function SessionEditor({ initial, onSave, onDelete, onBack, restSeconds = 120, repsThreshold = 13 }) {
  const [s, setS] = useState(() => ({
    label: "", date: new Date().toISOString().slice(0, 10),
    duration: null, notes: "", exercises: [], ...structuredClone(initial || {}),
  }));
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [restSignal, setRestSignal] = useState(0);

  const startRest = () => setRestSignal((n) => n + 1);

  const patch = (p) => setS((cur) => ({ ...cur, ...p }));
  const patchEx = (i, p) => setS((cur) => ({
    ...cur, exercises: cur.exercises.map((e, j) => (j === i ? { ...e, ...p } : e)),
  }));
  const patchSet = (ei, si, p) => patchEx(ei, {
    sets: s.exercises[ei].sets.map((x, j) => (j === si ? { ...x, ...p } : x)),
  });

  const addExercise = (name, type) => {
    setPicking(false);
    const t = type || exerciseType(name);
    patch({ exercises: [...s.exercises, { name, type: t, sets: [blankSet(t)] }] });
  };

  if (picking) return <ExercisePicker onPick={addExercise} onBack={() => setPicking(false)} />;

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <input style={S.titleInput} placeholder="Titre de la séance"
               value={s.label} onChange={(e) => patch({ label: e.target.value })} />
        <button style={{ ...S.btnGhost, color: COLORS.green, borderColor: COLORS.green }} disabled={busy}
                onClick={async () => { setBusy(true); await onSave(s); setBusy(false); }}>
          {busy ? "..." : "Enregistrer"}
        </button>
      </div>

      <div style={S.scroll}>
        <div style={S.logMeta}>
          <div style={S.metaField}>
            <span style={S.label}>Date</span>
            <input style={S.input} type="date" value={s.date || ""}
                   onChange={(e) => patch({ date: e.target.value })} />
          </div>
          <div style={S.metaField}>
            <span style={S.label}>Durée (min)</span>
            <input style={S.input} type="number" value={s.duration ?? ""}
                   onChange={(e) => patch({ duration: e.target.value === "" ? null : num(e.target.value) })} />
          </div>
        </div>
        <textarea style={{ ...S.input, marginBottom: 12, minHeight: 44 }} placeholder="Notes…"
                  value={s.notes} onChange={(e) => patch({ notes: e.target.value })} />

        {s.exercises.map((ex, ei) => {
          const cardio = (ex.type || exerciseType(ex.name)) === "cardio";
          const ready = !cardio && shouldIncreaseWeight(ex, repsThreshold);
          return (
            <div key={ei} style={S.exCard}>
              <div style={S.exCardHead}>
                <span style={S.exCardName}>{cardio ? "🏃 " : ""}{ex.name}</span>
                <button style={S.delBtn}
                        onClick={() => patch({ exercises: s.exercises.filter((_, j) => j !== ei) })}>✕</button>
              </div>
              {ready && <div style={S.progBadge}>🎯 13+ reps partout → tu peux monter la charge !</div>}
              {ex.note && <div style={S.exCardNote}>{ex.note}</div>}

              {ex.sets.map((set, si) => (
                <div key={si} style={S.setRow}>
                  <span style={S.setIdx}>{si + 1}</span>
                  {cardio ? (
                    <>
                      <input style={{ ...S.miniIn, width: 58 }} type="number" inputMode="decimal" placeholder="km"
                             value={set.distance || ""} onChange={(e) => patchSet(ei, si, { distance: num(e.target.value) })} />
                      <span style={S.setUnit}>km</span>
                      <input style={{ ...S.miniIn, width: 48 }} type="number" placeholder="min"
                             value={Math.floor((set.duration || 0) / 60) || ""}
                             onChange={(e) => patchSet(ei, si, { duration: num(e.target.value) * 60 + ((set.duration || 0) % 60) })} />
                      <span style={S.setUnit}>:</span>
                      <input style={{ ...S.miniIn, width: 44 }} type="number" placeholder="s"
                             value={(set.duration || 0) % 60 || ""}
                             onChange={(e) => patchSet(ei, si, { duration: Math.floor((set.duration || 0) / 60) * 60 + num(e.target.value) })} />
                      <span style={{ ...S.setUnit, marginLeft: 6, color: COLORS.green }}>{fmtPace(pace(set))}</span>
                    </>
                  ) : (
                    <>
                      <input style={S.miniIn} type="number" inputMode="decimal" value={set.kg}
                             onChange={(e) => patchSet(ei, si, { kg: num(e.target.value) })} />
                      <span style={S.setUnit}>kg</span>
                      <span style={S.setX}>×</span>
                      <input style={S.miniIn} type="number" inputMode="numeric" value={set.reps}
                             onChange={(e) => patchSet(ei, si, { reps: num(e.target.value) })} />
                    </>
                  )}
                  <button style={S.timerBtn} title="Démarrer le repos" onClick={startRest}>⏱</button>
                  <button style={S.delBtn}
                          onClick={() => patchEx(ei, { sets: ex.sets.filter((_, j) => j !== si) })}>✕</button>
                </div>
              ))}

              <button style={S.addSetBtn}
                      onClick={() => { patchEx(ei, { sets: [...ex.sets, blankSet(ex.type)] }); startRest(); }}>
                + série
              </button>
              <div style={S.exMeta}>
                {cardio ? `${exerciseDistance(ex)} km` : `${exerciseVolume(ex)} kg vol.`}
              </div>
            </div>
          );
        })}

        <button style={{ ...S.btnGhost, width: "100%", marginTop: 4 }} onClick={() => setPicking(true)}>
          + Ajouter un exercice
        </button>
        <div style={{ ...S.card, textAlign: "center", marginTop: 12, color: COLORS.green, fontWeight: 700 }}>
          Volume total : {sessionVolume(s)} kg
        </div>
        {onDelete && s.id != null && (
          <button style={S.btnDanger} onClick={() => onDelete(s.id)}>Supprimer la séance</button>
        )}
      </div>

      <RestTimer restSeconds={restSeconds} startSignal={restSignal} />
    </div>
  );
}
