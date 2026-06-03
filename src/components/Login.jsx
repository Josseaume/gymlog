import { useState } from "react";
import { S, COLORS } from "../styles.js";
import { checkAuth } from "../lib/api.js";
import { setPwd } from "../lib/cache.js";

export default function Login({ onSuccess }) {
  const [pwd, setVal] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (await checkAuth(pwd)) { setPwd(pwd); onSuccess(); }
      else setErr("Mot de passe incorrect.");
    } catch {
      setErr("Serveur injoignable.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={S.screen}>
      <div style={{ ...S.scroll, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, paddingBottom: 96 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🏋️</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white, letterSpacing: "-1px", marginTop: 8 }}>GymLog</div>
          <div style={{ fontSize: 13, color: COLORS.dim, marginTop: 4 }}>Ton coach de poche</div>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={S.input} type="password" placeholder="Mot de passe"
                 value={pwd} onChange={(e) => setVal(e.target.value)} autoFocus />
          {err && <div style={S.errorBox}>{err}</div>}
          <button style={S.btnPrimary} disabled={busy} type="submit">
            {busy ? "..." : "Entrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
