import { S } from "../styles.js";

export default function Toast({ toast }) {
  if (!toast) return null;
  const bg = toast.type === "error" ? "#f87171" : "#a3e635";
  return <div style={{ ...S.toast, background: bg }}>{toast.msg}</div>;
}
