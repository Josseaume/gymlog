import { useState } from "react";
import { S, COLORS } from "../styles.js";
import { EXERCISE_CATALOG, ALL_EXERCISES, EXERCISE_TYPE } from "../../data/catalog.js";

const TYPE_FILTERS = [
  { key: "all", label: "Tout" },
  { key: "strength", label: "Muscu" },
  { key: "cardio", label: "Cardio" },
];

export default function ExercisePicker({ onPick, onBack }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState(null);
  const [customType, setCustomType] = useState("strength");

  const query = q.trim().toLowerCase();
  const inType = (t) => type === "all" || t === type;

  const matches = query
    ? ALL_EXERCISES.filter((e) => e.name.toLowerCase().includes(query) && inType(e.type))
    : null;

  const groups = Object.entries(EXERCISE_CATALOG).filter(([cat]) => {
    if (type === "all") return true;
    // garde les groupes contenant au moins un exo du type
    return EXERCISE_CATALOG[cat].some((n) => EXERCISE_TYPE[n] === type);
  });

  const exactExists = ALL_EXERCISES.some((e) => e.name.toLowerCase() === query);

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>Choisir un exercice</div>
      </div>
      <div style={S.scroll}>
        <input style={{ ...S.input, marginBottom: 10 }} placeholder="Rechercher…" value={q}
               onChange={(e) => setQ(e.target.value)} autoFocus />
        <div style={S.filterRow}>
          {TYPE_FILTERS.map((f) => (
            <button key={f.key} style={type === f.key ? S.filterChipOn : S.filterChip}
                    onClick={() => setType(f.key)}>{f.label}</button>
          ))}
        </div>

        {matches ? (
          <>
            {matches.map((e) => (
              <button key={e.name} style={S.exItem} onClick={() => onPick(e.name, e.type)}>
                <span>{e.name}</span>
                <span style={S.exItemTag}>{e.equipment}</span>
              </button>
            ))}
            {!exactExists && (
              <div style={{ ...S.card, marginTop: 10 }}>
                <div style={S.cardTitle}>Créer « {q.trim()} »</div>
                <div style={S.filterRow}>
                  <button style={customType === "strength" ? S.filterChipOn : S.filterChip}
                          onClick={() => setCustomType("strength")}>Muscu</button>
                  <button style={customType === "cardio" ? S.filterChipOn : S.filterChip}
                          onClick={() => setCustomType("cardio")}>Cardio</button>
                </div>
                <button style={{ ...S.btnPrimary, marginTop: 10 }}
                        onClick={() => onPick(q.trim(), customType)}>+ Ajouter cet exercice</button>
              </div>
            )}
            {matches.length === 0 && exactExists && <div style={S.empty}>Aucun exercice</div>}
          </>
        ) : (
          groups.map(([cat, exs]) => (
            <div key={cat}>
              <button style={S.catBtn} onClick={() => setOpen(open === cat ? null : cat)}>
                <span>{cat}</span><span style={{ color: COLORS.dim }}>{open === cat ? "−" : "+"}</span>
              </button>
              {open === cat && exs
                .filter((n) => type === "all" || EXERCISE_TYPE[n] === type)
                .map((name) => (
                  <button key={name} style={S.exItem} onClick={() => onPick(name, EXERCISE_TYPE[name])}>
                    <span>{name}</span>
                  </button>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
