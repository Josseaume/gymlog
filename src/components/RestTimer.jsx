import { useState, useEffect, useRef } from "react";
import { S, COLORS } from "../styles.js";
import { fmtDuration } from "../lib/metrics.js";

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch { /* audio indisponible */ }
}

// startSignal : un compteur incrémenté par le parent à chaque fois qu'on veut
// (re)lancer le repos (après avoir noté une série, ou via le bouton « Repos »).
export default function RestTimer({ restSeconds = 120, startSignal = 0, onDone }) {
  const [remaining, setRemaining] = useState(null); // null = inactif
  const [running, setRunning] = useState(false);
  const deadline = useRef(0);

  // (re)démarrage quand startSignal change
  useEffect(() => {
    if (startSignal <= 0) return;
    deadline.current = Date.now() + restSeconds * 1000;
    setRemaining(restSeconds);
    setRunning(true);
  }, [startSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        beep();
        if (navigator.vibrate) navigator.vibrate([250, 120, 250]);
        onDone?.();
      }
    };
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  if (remaining === null) return null;

  const adjust = (d) => {
    deadline.current += d * 1000;
    const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
    setRemaining(left);
    if (left > 0 && !running) { setRunning(true); }
  };
  const done = remaining <= 0;

  return (
    <div style={S.timerBar}>
      <span style={{ ...S.timerTime, color: done ? COLORS.orange : COLORS.green }}>
        {done ? "À toi 💪" : fmtDuration(remaining)}
      </span>
      <span style={{ flex: 1, fontSize: 12, color: COLORS.dim }}>
        {done ? "Série suivante" : "Repos en cours"}
      </span>
      {!done && <button style={S.timerBtn} onClick={() => adjust(-15)}>−15</button>}
      {!done && <button style={S.timerBtn} onClick={() => adjust(15)}>+15</button>}
      {!done && <button style={S.timerBtn} onClick={() => { setRunning((r) => !r); if (!running) deadline.current = Date.now() + remaining * 1000; }}>
        {running ? "⏸" : "▶"}
      </button>}
      <button style={S.timerBtn} onClick={() => { setRemaining(null); setRunning(false); }}>✕</button>
    </div>
  );
}
