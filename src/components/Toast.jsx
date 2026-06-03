import { S, COLORS } from "../styles.js";

export default function Toast({ toast }) {
  if (!toast) return null;
  const bg = toast.type === "error" ? COLORS.red : COLORS.green;
  return <div style={{ ...S.toast, background: bg }}>{toast.msg}</div>;
}
