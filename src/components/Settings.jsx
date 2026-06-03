import { useState } from "react";
import { S, COLORS } from "../styles.js";

export default function Settings({ profile, onSave, onSwitchProfile, onLogout, onDeleteProfile, onBack }) {
  const [rest, setRest] = useState(profile?.rest_seconds ?? 120);
  const [thr, setThr] = useState(profile?.reps_threshold ?? 13);
  const [height, setHeight] = useState(profile?.height_cm ?? "");
  const [level, setLevel] = useState(profile?.level ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await onSave({
        rest_seconds: Number(rest) || 120,
        reps_threshold: Number(thr) || 13,
        height_cm: height === "" ? null : Number(height),
        level: level || null,
      });
    } finally { setBusy(false); }
  };

  return (
    <div style={S.screen}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={onBack}>‹</button>
        <div style={S.topTitle}>Réglages</div>
      </div>
      <div style={S.scroll}>
        <div style={S.card}>
          <span style={S.label}>Temps de repos par défaut (secondes)</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={S.timerBtn} onClick={() => setRest((r) => Math.max(15, Number(r) - 15))}>−</button>
            <input style={{ ...S.input, textAlign: "center" }} type="number" value={rest} onChange={(e) => setRest(e.target.value)} />
            <button style={S.timerBtn} onClick={() => setRest((r) => Number(r) + 15)}>+</button>
          </div>
          <div style={{ fontSize: 11, color: COLORS.dim, marginTop: 6 }}>Le bip sonne à la fin du repos après chaque série.</div>
        </div>

        <div style={{ ...S.card, marginTop: 12 }}>
          <span style={S.label}>Seuil de reps pour monter la charge</span>
          <input style={S.input} type="number" value={thr} onChange={(e) => setThr(e.target.value)} />
          <div style={{ fontSize: 11, color: COLORS.dim, marginTop: 6 }}>Quand toutes les séries atteignent ce nombre de reps, on te propose d'augmenter le poids.</div>
        </div>

        <div style={{ ...S.card, marginTop: 12 }}>
          <span style={S.label}>Taille (cm)</span>
          <input style={S.input} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          <span style={{ ...S.label, marginTop: 8 }}>Niveau</span>
          <select style={S.input} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">—</option>
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
          </select>
        </div>

        <button style={{ ...S.btnPrimary, marginTop: 14 }} disabled={busy} onClick={save}>{busy ? "..." : "Enregistrer"}</button>
        <button style={{ ...S.btnGhost, width: "100%", marginTop: 10 }} onClick={onSwitchProfile}>Changer de profil</button>
        <button style={{ ...S.btnGhost, width: "100%", marginTop: 10 }} onClick={onLogout}>Se déconnecter</button>
        <button style={S.btnDanger} onClick={onDeleteProfile}>Supprimer ce profil et ses données</button>
      </div>
    </div>
  );
}
