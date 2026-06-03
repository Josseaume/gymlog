// Design system « Coach » — sombre doux, cartes arrondies, vert émeraude.
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif";

const C = {
  bg: "#14151a", card: "#1e2128", card2: "#191b21", border: "#262a33", line: "#23262f",
  text: "#e7e9ee", dim: "#7e8694", white: "#fff",
  green: "#23c55e", greenDark: "#1f6f43", greenSoft: "rgba(35,197,94,0.13)",
  orange: "#f59e0b", orangeSoft: "rgba(245,158,11,0.13)",
  blue: "#7aa2ff", blueSoft: "rgba(122,162,255,0.10)",
  red: "#f87171", redSoft: "rgba(248,113,113,0.10)",
};
export const COLORS = C;

export const S = {
  // Layout
  screen: { background: C.bg, minHeight: "100vh", fontFamily: FONT, color: C.text, maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", overflowX: "hidden" },
  scroll: { flex: 1, overflowY: "auto", padding: "16px 16px 96px" },
  topBar: { background: C.bg, borderBottom: `1px solid ${C.line}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 20 },
  topTitle: { flex: 1, fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" },
  backBtn: { background: "none", border: "none", color: C.green, fontSize: 24, cursor: "pointer", padding: "0 4px", lineHeight: 1, fontFamily: FONT },
  h1: { fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px" },
  greet: { fontSize: 18, fontWeight: 800, color: C.white },
  greetSub: { fontSize: 12, color: C.dim, marginTop: 2 },

  // Tab bar
  tabBar: { position: "sticky", bottom: 0, display: "flex", background: "rgba(20,21,26,0.95)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, zIndex: 30 },
  tab: { flex: 1, background: "none", border: "none", padding: "9px 0 11px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", color: C.dim, fontFamily: FONT },
  tabIcon: { fontSize: 19, lineHeight: 1 },
  tabLabel: { fontSize: 10, fontWeight: 700 },

  // Sections
  secLabel: { color: C.dim, fontSize: 12, fontWeight: 700, margin: "20px 2px 9px" },
  secHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 2px 9px" },
  secMeta: { fontSize: 11, color: "#4a4f5a" },

  // Cards
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 },

  // Buttons
  btnPrimary: { width: "100%", background: `linear-gradient(135deg,${C.greenDark},${C.green})`, border: "none", borderRadius: 14, padding: 14, color: C.white, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: FONT },
  btnGhost: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT },
  btnDanger: { width: "100%", background: "none", border: `1px solid #3a2226`, borderRadius: 12, padding: 11, color: C.red, fontSize: 13, cursor: "pointer", fontFamily: FONT, marginTop: 10 },
  pill: { fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 700, background: C.greenSoft, color: C.green },

  // Inputs
  input: { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", color: C.text, fontSize: 14, fontFamily: FONT, boxSizing: "border-box" },
  miniIn: { width: 70, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 8px", color: C.text, fontSize: 15, textAlign: "center", fontFamily: FONT },
  label: { fontSize: 11, color: C.dim, fontWeight: 700, marginBottom: 4, display: "block" },
  titleInput: { background: "none", border: "none", color: C.white, fontSize: 17, fontWeight: 800, fontFamily: FONT, width: "100%", outline: "none" },

  // Hero objectif
  heroCard: { background: `linear-gradient(135deg,${C.greenDark},${C.green})`, borderRadius: 20, padding: 16, display: "flex", alignItems: "center", gap: 14, marginBottom: 4 },
  heroLabel: { color: "#d7ffe6", fontSize: 11, fontWeight: 700 },
  heroTitle: { color: C.white, fontSize: 17, fontWeight: 800, lineHeight: 1.15, marginTop: 2 },
  heroSub: { color: "#bff5d3", fontSize: 12, marginTop: 3 },

  // Goal rows
  goalRow: { display: "flex", alignItems: "center", gap: 11, padding: "9px 0" },
  gbarTrack: { flex: 1, height: 7, background: C.line, borderRadius: 999, overflow: "hidden" },
  gbarFill: { height: "100%", borderRadius: 999 },

  // KPI grid
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  kpi: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 10px" },
  kpiLabel: { color: C.dim, fontSize: 10, fontWeight: 600 },
  kpiVal: { color: C.white, fontSize: 18, fontWeight: 800, marginTop: 3 },

  // List rows
  row: { width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 11, marginBottom: 8, cursor: "pointer", textAlign: "left", fontFamily: FONT },
  rowTitle: { fontWeight: 700, fontSize: 14, color: C.text },
  rowSub: { fontSize: 11.5, color: C.dim, marginTop: 3 },
  dot: { width: 34, height: 34, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  chev: { color: "#3a3f4a", fontSize: 20, marginLeft: "auto" },

  // Editor
  exCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 12 },
  exCardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  exCardName: { fontWeight: 700, fontSize: 14, color: C.text },
  exCardNote: { fontSize: 12, color: C.dim, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 },
  setRow: { display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${C.line}` },
  setIdx: { fontSize: 12, color: "#4a4f5a", width: 16 },
  setUnit: { fontSize: 11, color: C.dim },
  setX: { color: "#4a4f5a", fontSize: 14 },
  addSetBtn: { width: "100%", background: "none", border: `1px dashed ${C.border}`, borderRadius: 10, padding: 8, color: C.dim, fontSize: 12, cursor: "pointer", fontFamily: FONT, marginTop: 8 },
  delBtn: { background: "none", border: "none", color: "#4a4f5a", fontSize: 15, cursor: "pointer", padding: "0 4px", marginLeft: "auto", fontFamily: FONT },
  exMeta: { textAlign: "right", fontSize: 11, color: C.dim, marginTop: 8 },
  progBadge: { background: C.orangeSoft, color: C.orange, borderRadius: 8, padding: "6px 10px", fontSize: 11.5, marginBottom: 8, fontWeight: 600 },

  logMeta: { display: "flex", gap: 10, marginBottom: 12 },
  metaField: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },

  // Picker
  catBtn: { width: "100%", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: FONT, fontWeight: 700, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" },
  exItem: { width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: FONT, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  exItemTag: { fontSize: 10, color: C.dim },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  filterChip: { fontSize: 11, padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.card, color: C.dim, cursor: "pointer", fontFamily: FONT, fontWeight: 600 },
  filterChipOn: { fontSize: 11, padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.green}`, background: C.greenSoft, color: C.green, cursor: "pointer", fontFamily: FONT, fontWeight: 700 },

  // Rest timer
  timerBar: { position: "sticky", bottom: 0, background: "rgba(25,27,33,0.97)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, zIndex: 25 },
  timerTime: { fontSize: 24, fontWeight: 800, color: C.green, fontVariantNumeric: "tabular-nums", minWidth: 74 },
  timerBtn: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, width: 38, height: 38, color: C.text, fontSize: 16, cursor: "pointer", fontFamily: FONT },

  // Profil
  avatar: { width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg,${C.greenDark},${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  measGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  meas: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 },
  photoThumb: { flex: 1, minWidth: 0, aspectRatio: "3/4", borderRadius: 12, objectFit: "cover", background: C.line },
  analysisCard: { background: "#161c26", border: `1px solid #2a3a55`, borderRadius: 14, padding: 13, marginBottom: 8 },

  // Selector
  profileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 },
  profileCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: FONT },
  profileAvatar: { width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg,${C.greenDark},${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 },

  // Misc
  empty: { color: "#4a4f5a", textAlign: "center", padding: 30, fontSize: 13 },
  errorBox: { background: C.redSoft, border: `1px solid #4a1a1a`, borderRadius: 10, padding: "10px 12px", color: C.red, fontSize: 12, marginTop: 8 },
  toast: { position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", color: C.white, fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 12, zIndex: 100, fontFamily: FONT, boxShadow: "0 6px 20px rgba(0,0,0,0.4)" },
  chip: { display: "inline-block", fontSize: 11, padding: "4px 10px", borderRadius: 999, marginRight: 6, marginTop: 6 },
};
