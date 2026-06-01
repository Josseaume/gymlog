import { useState } from "react";
import { S } from "../styles.js";
import { sessionStats, sessionVolume } from "../lib/metrics.js";
import { validateSessions } from "../lib/validate.js";

export default function Home({ sessions, onOpen, onNew, onProgress, onImport, notify }) {
  const [importing, setImporting] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const stats = sessionStats(sessions);

  const exportJson = () => {
    const json = JSON.stringify(sessions, null, 2);
    navigator.clipboard?.writeText(json).then(
      () => notify("Copié dans le presse-papier"),
      () => {}
    );
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

  return (
    <div style={S.screen}>
      <div style={S.homeHeader}>
        <div style={S.homeLogo}>GYMLOG</div>
        <div style={S.homeStats}>
          <div style={S.stat}><span style={S.statN}>{stats.count}</span><span style={S.statL}>séances</span></div>
          <div style={S.stat}><span style={S.statN}>{Math.round(stats.totalVolume / 1000)}t</span><span style={S.statL}>volume</span></div>
        </div>
      </div>
      <div style={S.scroll}>
        <div style={S.actionRow}>
          <button style={S.bigBtn} onClick={onNew}>+ Nouvelle séance</button>
          <button style={S.bigBtn} onClick={onProgress}>Progression</button>
        </div>

        <div style={S.exportBox}>
          <div style={S.exportTitle}>Sauvegarde</div>
          <div style={S.exportSub}>Exporte/importe tes données en JSON.</div>
          <div style={S.exportBtns}>
            <button style={S.exportBtn} onClick={exportJson}>Exporter</button>
            <button style={S.exportBtn} onClick={() => setImporting((v) => !v)}>Importer</button>
          </div>
          {importing && (
            <div style={{ marginTop: 10 }}>
              <textarea style={S.jsonArea} rows={6} placeholder="Colle ton JSON ici…"
                        value={text} onChange={(e) => setText(e.target.value)} />
              {err && <div style={S.errorBox}>{err}</div>}
              <button style={S.primaryBtn} onClick={doImport}>Importer</button>
            </div>
          )}
        </div>

        <div style={S.secLabel}>Séances</div>
        {sessions.map((s) => (
          <button key={s.id} style={S.sessionRow} onClick={() => onOpen(s)}>
            <div style={S.sessionLeft}>
              <div style={S.sessionLabel}>{s.label}</div>
              <div style={S.sessionSub}>
                {s.date} · {(s.exercises || []).length} exos · {sessionVolume(s)} kg
              </div>
            </div>
            <span style={S.chev}>›</span>
          </button>
        ))}
        {sessions.length === 0 && <div style={S.empty}>Aucune séance. Crées-en une !</div>}
      </div>
    </div>
  );
}
