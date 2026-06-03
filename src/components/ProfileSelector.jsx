import { useState } from "react";
import { S, COLORS } from "../styles.js";

const EMOJIS = ["🦾", "💪", "🏃", "🔥", "⚡", "🐉", "🦁", "🏆", "🥊", "🧗"];

export default function ProfileSelector({ users, onPick, onCreate }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🦾");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try { await onCreate({ name: name.trim(), emoji }); setCreating(false); setName(""); }
    finally { setBusy(false); }
  };

  return (
    <div style={S.screen}>
      <div style={{ ...S.scroll, paddingTop: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.white }}>Qui s'entraîne ?</div>
          <div style={{ fontSize: 13, color: COLORS.dim, marginTop: 4 }}>Choisis ton profil</div>
        </div>

        {!creating ? (
          <div style={S.profileGrid}>
            {users.map((u) => (
              <button key={u.id} style={S.profileCard} onClick={() => onPick(u.id)}>
                <div style={S.profileAvatar}>{u.emoji || "🦾"}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{u.name}</div>
              </button>
            ))}
            <button style={{ ...S.profileCard, borderStyle: "dashed", color: COLORS.green }}
                    onClick={() => setCreating(true)}>
              <div style={{ ...S.profileAvatar, background: "none", border: `2px dashed ${COLORS.border}`, color: COLORS.green }}>+</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.green }}>Nouveau</div>
            </button>
          </div>
        ) : (
          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={S.cardTitle}>Nouveau profil</div>
            <input style={S.input} placeholder="Prénom" value={name}
                   onChange={(e) => setName(e.target.value)} autoFocus />
            <div style={{ ...S.filterRow, marginTop: 12 }}>
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                        style={{ ...(emoji === e ? S.filterChipOn : S.filterChip), fontSize: 18, padding: "6px 9px" }}>{e}</button>
              ))}
            </div>
            <button style={{ ...S.btnPrimary, marginTop: 14 }} disabled={busy} onClick={submit}>
              {busy ? "..." : "Créer le profil"}
            </button>
            <button style={S.btnDanger} onClick={() => setCreating(false)}>Annuler</button>
          </div>
        )}
      </div>
    </div>
  );
}
