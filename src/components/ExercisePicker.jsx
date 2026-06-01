import { useState } from "react";
import { S } from "../styles.js";
import { EXERCISE_CATALOG, ALL_EXERCISES } from "../../data/catalog.js";

export default function ExercisePicker({ onPick, onBack }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const query = q.trim().toLowerCase();
  const matches = query
    ? ALL_EXERCISES.filter((e) => e.name.toLowerCase().includes(query))
    : null;

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>Choisir un exercice</div>
      </div>
      <div style={S.scroll}>
        <input style={S.searchIn} placeholder="Rechercher…" value={q}
               onChange={(e) => setQ(e.target.value)} autoFocus />
        {matches
          ? matches.map((e) => (
              <button key={e.name} style={S.exItem} onClick={() => onPick(e.name)}>{e.name}</button>
            ))
          : Object.entries(EXERCISE_CATALOG).map(([cat, exs]) => (
              <div key={cat}>
                <button style={S.catBtn} onClick={() => setOpen(open === cat ? null : cat)}>
                  <span>{cat}</span><span>{open === cat ? "−" : "+"}</span>
                </button>
                {open === cat && exs.map((name) => (
                  <button key={name} style={S.exItem} onClick={() => onPick(name)}>{name}</button>
                ))}
              </div>
            ))}
        {matches && matches.length === 0 && <div style={S.empty}>Aucun exercice</div>}
      </div>
    </div>
  );
}
