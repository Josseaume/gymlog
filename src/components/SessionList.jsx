import { useState } from "react";
import { S, COLORS } from "../styles.js";
import { sessionVolume, sessionDistance } from "../lib/metrics.js";
import { validateSessions } from "../lib/validate.js";
import { exerciseType } from "../../data/catalog.js";

export default function SessionList({ sessions, onOpen, onNew, onImport, notify }) {
  const [importing, setImporting] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const exportJson = () => {
    const json = JSON.stringify(sessions, null, 2);
    navigator.clipboard?.writeText(json).then(() => notify("Copié dans le presse-papier"), () => {});
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gymlog-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImport = async () => {
    setErr("");
    let data;
    try { data = JSON.parse(text); } catch { setErr("JSON invalide."); return; }
    const v = validateSessions(data);
    if (!v.ok) { setErr(v.error); return; }
    await onImport(v.value);
    setImporting(false); setText("");
  };

  const summary = (s) => {
    const hasCardio = (s.exercises || []).some((e) => (e.type || exerciseType(e.name)) === "cardio");
    const d = sessionDistance(s);
    const vol = sessionVolume(s);
    const bits = [`${(s.exercises || []).length} exos`];
    if (vol > 0) bits.push(`${vol} kg`);
    if (hasCardio && d > 0) bits.push(`${d} km`);
    return bits.join(" · ");
  };

  return (
    <div style={S.screen}>
      <div style={S.topBar}><div style={S.topTitle}>Séances</div></div>
      <div style={S.scroll}>
        <button style={{ ...S.btnPrimary, marginBottom: 14 }} onClick={onNew}>+ Nouvelle séance</button>

        {sessions.map((s) => (
          <button key={s.id} style={S.row} onClick={() => onOpen(s)}>
            <div style={{ flex: 1 }}>
              <div style={S.rowTitle}>{s.label}</div>
              <div style={S.rowSub}>{s.date} · {summary(s)}</div>
            </div>
            <span style={S.chev}>›</span>
          </button>
        ))}
        {sessions.length === 0 && <div style={S.empty}>Aucune séance. Crées-en une !</div>}

        <div style={{ ...S.card, marginTop: 16 }}>
          <div style={S.cardTitle}>Sauvegarde JSON</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...S.btnGhost, flex: 1 }} onClick={exportJson}>Exporter</button>
            <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setImporting((v) => !v)}>Importer</button>
          </div>
          {importing && (
            <div style={{ marginTop: 10 }}>
              <textarea style={{ ...S.input, minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
                        placeholder="Colle ton JSON ici…" value={text} onChange={(e) => setText(e.target.value)} />
              {err && <div style={S.errorBox}>{err}</div>}
              <button style={{ ...S.btnPrimary, marginTop: 10 }} onClick={doImport}>Importer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
