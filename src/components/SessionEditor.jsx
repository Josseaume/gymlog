import { useState } from "react";
import { S } from "../styles.js";
import { exerciseVolume, sessionVolume } from "../lib/metrics.js";
import ExercisePicker from "./ExercisePicker.jsx";

const blankSet = () => ({ kg: 0, reps: 0 });

export default function SessionEditor({ initial, onSave, onDelete, onBack }) {
  const [s, setS] = useState(() => ({
    label: "", date: new Date().toISOString().slice(0, 10),
    duration: null, notes: "", exercises: [], ...structuredClone(initial || {}),
  }));
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);

  const patch = (p) => setS((cur) => ({ ...cur, ...p }));
  const patchEx = (i, p) => setS((cur) => ({
    ...cur,
    exercises: cur.exercises.map((e, j) => (j === i ? { ...e, ...p } : e)),
  }));
  const patchSet = (ei, si, p) => patchEx(ei, {
    sets: s.exercises[ei].sets.map((x, j) => (j === si ? { ...x, ...p } : x)),
  });

  const num = (v) => (v === "" ? 0 : Number(v));
  const addExercise = (name) => {
    setPicking(false);
    patch({ exercises: [...s.exercises, { name, sets: [blankSet()] }] });
  };

  if (picking) return <ExercisePicker onPick={addExercise} onBack={() => setPicking(false)} />;

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <input style={S.titleInput} placeholder="Titre de la séance"
               value={s.label} onChange={(e) => patch({ label: e.target.value })} />
        <button style={S.saveTopBtn} disabled={busy}
                onClick={async () => { setBusy(true); await onSave(s); setBusy(false); }}>
          {busy ? "..." : "Enregistrer"}
        </button>
      </div>
      <div style={S.scroll}>
        <div style={S.logMeta}>
          <div style={S.metaField}>
            <span style={S.metaLabel}>Date</span>
            <input style={S.metaIn} type="date" value={s.date || ""}
                   onChange={(e) => patch({ date: e.target.value })} />
          </div>
          <div style={S.metaField}>
            <span style={S.metaLabel}>Durée (min)</span>
            <input style={S.metaIn} type="number" value={s.duration ?? ""}
                   onChange={(e) => patch({ duration: e.target.value === "" ? null : num(e.target.value) })} />
          </div>
        </div>
        <textarea style={{ ...S.metaIn, width: "100%", boxSizing: "border-box", marginBottom: 12 }}
                  placeholder="Notes…" value={s.notes}
                  onChange={(e) => patch({ notes: e.target.value })} />

        {s.exercises.map((ex, ei) => (
          <div key={ei} style={S.exCard}>
            <div style={S.exCardHead}>
              <span style={S.exCardName}>{ex.name}</span>
              <button style={S.delBtn}
                      onClick={() => patch({ exercises: s.exercises.filter((_, j) => j !== ei) })}>✕</button>
            </div>
            {ex.note && <div style={S.exCardNote}>{ex.note}</div>}
            {ex.sets.map((set, si) => (
              <div key={si} style={S.setRow}>
                <span style={S.setIdx}>{si + 1}</span>
                <input style={S.miniIn} type="number" value={set.kg}
                       onChange={(e) => patchSet(ei, si, { kg: num(e.target.value) })} />
                <span style={S.setUnit}>kg</span>
                <span style={S.setX}>×</span>
                <input style={S.miniIn} type="number" value={set.reps}
                       onChange={(e) => patchSet(ei, si, { reps: num(e.target.value) })} />
                <button style={S.delBtn}
                        onClick={() => patchEx(ei, { sets: ex.sets.filter((_, j) => j !== si) })}>✕</button>
              </div>
            ))}
            <button style={S.addSetBtn}
                    onClick={() => patchEx(ei, { sets: [...ex.sets, blankSet()] })}>+ série</button>
            <div style={S.exVol}>{exerciseVolume(ex)} kg vol.</div>
          </div>
        ))}

        <button style={S.bigBtn} onClick={() => setPicking(true)}>+ Ajouter un exercice</button>
        <div style={S.totalVolBox}>Volume total : {sessionVolume(s)} kg</div>
        {onDelete && s.id != null && (
          <button style={S.dangerBtn} onClick={() => onDelete(s.id)}>Supprimer la séance</button>
        )}
      </div>
    </div>
  );
}
