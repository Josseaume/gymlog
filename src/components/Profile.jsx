import { useState, useRef } from "react";
import { S, COLORS } from "../styles.js";
import { bodyweightSeries, latestMetric } from "../lib/metrics.js";
import GoalsEditor from "./GoalsEditor.jsx";

const MEAS = [
  ["arm_l", "Bras G"], ["arm_r", "Bras D"], ["chest", "Poitrine"],
  ["waist", "Taille"], ["thigh", "Cuisse"], ["shoulders", "Épaules"],
];
const today = () => new Date().toISOString().slice(0, 10);

// Redimensionne une image (max 1280px, JPEG q0.8) → dataURL léger
function resizeImage(file, max = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(cv.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function Sparkline({ data }) {
  if (data.length < 2) return null;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 200;
    const y = 44 - ((d.value - min) / span) * 40 - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 200 46" style={{ width: "100%", height: 46, marginTop: 6 }}>
      <polyline points={pts} fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function Profile({
  profile, sessions, goals, metrics, analyses, photos,
  onAddMetric, onAddAnalysis, onDeleteAnalysis, onAddPhoto, onDeletePhoto,
  onAddGoal, onDeleteGoal, onUpdateGoal, onExport, onSwitchProfile, onOpenSettings, notify,
}) {
  const ctx = { sessions, metrics };
  const bw = bodyweightSeries(metrics);
  const lastBw = bw.length ? bw[bw.length - 1].value : null;

  const [weight, setWeight] = useState("");
  const [measKind, setMeasKind] = useState("arm_l");
  const [measVal, setMeasVal] = useState("");
  const [anText, setAnText] = useState("");
  const [anFocus, setAnFocus] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const addWeight = async () => {
    if (!weight) return;
    await onAddMetric({ kind: "weight", date: today(), value: Number(weight) });
    setWeight("");
  };
  const addMeas = async () => {
    if (!measVal) return;
    await onAddMetric({ kind: measKind, date: today(), value: Number(measVal) });
    setMeasVal("");
  };
  const addAnalysis = async () => {
    if (!anText.trim()) return;
    const focus = anFocus.split(",").map((x) => x.trim()).filter(Boolean);
    await onAddAnalysis({ date: today(), text: anText.trim(), focus });
    setAnText(""); setAnFocus("");
  };
  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      await onAddPhoto({ date: today(), label: today(), dataUrl });
    } catch { notify?.("Échec de l'upload", "error"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div style={S.screen}>
      <div style={{ ...S.topBar, justifyContent: "space-between" }}>
        <div style={S.topTitle}>Profil</div>
        <button style={S.timerBtn} title="Réglages" onClick={onOpenSettings}>⚙️</button>
      </div>
      <div style={S.scroll}>
        {/* Identité */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={S.avatar}>{profile?.emoji || "🦾"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.white }}>{profile?.name}</div>
            <div style={{ fontSize: 12, color: COLORS.dim }}>
              {lastBw ? `${lastBw} kg` : "poids ?"}{profile?.height_cm ? ` · ${profile.height_cm} cm` : ""}{profile?.level ? ` · ${profile.level}` : ""}
            </div>
          </div>
          <button style={S.btnGhost} onClick={onSwitchProfile}>Changer</button>
        </div>

        {/* Poids de corps */}
        <div style={S.secLabel}>Poids de corps</div>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>
              {lastBw ?? "—"} <span style={{ fontSize: 12, color: COLORS.dim }}>kg</span>
            </div>
            {bw.length > 1 && (
              <div style={{ fontSize: 11, color: COLORS.green }}>
                {(lastBw - bw[0].value >= 0 ? "+" : "")}{(lastBw - bw[0].value).toFixed(1)} kg
              </div>
            )}
          </div>
          <Sparkline data={bw} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input style={{ ...S.input, flex: 1 }} type="number" inputMode="decimal" placeholder="Nouveau poids (kg)"
                   value={weight} onChange={(e) => setWeight(e.target.value)} />
            <button style={S.btnGhost} onClick={addWeight}>+</button>
          </div>
        </div>

        {/* Photos */}
        <div style={S.secLabel}>Photos de progression</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: "relative", flex: "0 0 96px" }}>
              <img src={p.url} alt={p.label} style={{ width: 96, height: 128, objectFit: "cover", borderRadius: 12, background: COLORS.line }} />
              <button style={{ position: "absolute", top: 4, right: 4, ...S.timerBtn, width: 26, height: 26, fontSize: 12 }}
                      onClick={() => onDeletePhoto(p.id)}>✕</button>
              <div style={{ fontSize: 9, color: COLORS.dim, textAlign: "center", marginTop: 3 }}>{p.date}</div>
            </div>
          ))}
          <button style={{ flex: "0 0 96px", height: 128, borderRadius: 12, border: `1px dashed ${COLORS.border}`, background: COLORS.card, color: COLORS.green, fontSize: 26, cursor: "pointer" }}
                  onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "…" : "+"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickPhoto} />
        </div>

        {/* Mensurations */}
        <div style={S.secLabel}>Mensurations</div>
        <div style={S.measGrid}>
          {MEAS.map(([k, l]) => {
            const m = latestMetric(metrics, k);
            return (
              <div key={k} style={S.meas}>
                <div style={{ fontSize: 10, color: COLORS.dim }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.white }}>{m ? `${m.value} cm` : "—"}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <select style={{ ...S.input, flex: 1 }} value={measKind} onChange={(e) => setMeasKind(e.target.value)}>
            {MEAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <input style={{ ...S.input, width: 90 }} type="number" placeholder="cm" value={measVal} onChange={(e) => setMeasVal(e.target.value)} />
          <button style={S.btnGhost} onClick={addMeas}>+</button>
        </div>

        {/* Objectifs */}
        <div style={S.secLabel}>Objectifs</div>
        <GoalsEditor goals={goals} ctx={ctx} onAdd={onAddGoal} onDelete={onDeleteGoal} onUpdate={onUpdateGoal} />

        {/* Analyses de Claude */}
        <div style={S.secLabel}>Analyse de Claude</div>
        {analyses.map((a) => (
          <div key={a.id} style={S.analysisCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: COLORS.blue, fontSize: 11, fontWeight: 700 }}>✦ {a.date}</span>
              <button style={S.delBtn} onClick={() => onDeleteAnalysis(a.id)}>✕</button>
            </div>
            <div style={{ color: "#cdd3df", fontSize: 12.5, lineHeight: 1.5, marginTop: 6, whiteSpace: "pre-wrap" }}>{a.text}</div>
            {(a.focus || []).length > 0 && (
              <div style={{ marginTop: 8 }}>
                {a.focus.map((t) => (
                  <span key={t} style={{ ...S.chip, background: COLORS.blueSoft, color: COLORS.blue }}>↑ {t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div style={{ ...S.card, marginTop: 4 }}>
          <textarea style={{ ...S.input, minHeight: 70 }} placeholder="Colle ici l'analyse de Claude sur ton physique…"
                    value={anText} onChange={(e) => setAnText(e.target.value)} />
          <input style={{ ...S.input, marginTop: 8 }} placeholder="Axes à améliorer (ex: Dos, Ischios)"
                 value={anFocus} onChange={(e) => setAnFocus(e.target.value)} />
          <button style={{ ...S.btnPrimary, marginTop: 10 }} onClick={addAnalysis}>Ajouter l'analyse</button>
        </div>

        {/* Export IA */}
        <div style={S.secLabel}>Coaching IA</div>
        <button style={S.btnPrimary} onClick={onExport}>📋 Exporter pour l'IA →</button>
        <div style={{ fontSize: 11, color: COLORS.dim, textAlign: "center", marginTop: 6 }}>
          Profil + objectifs + règle des reps + historique → l'IA te propose un plan
        </div>
      </div>
    </div>
  );
}
