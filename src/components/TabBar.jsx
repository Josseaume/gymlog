import { S, COLORS } from "../styles.js";

const TABS = [
  { key: "dashboard", icon: "📊", label: "Dashboard" },
  { key: "sessions", icon: "🏋️", label: "Séances" },
  { key: "profile", icon: "👤", label: "Profil" },
];

export default function TabBar({ tab, onChange }) {
  return (
    <div style={S.tabBar}>
      {TABS.map((t) => {
        const on = tab === t.key;
        return (
          <button key={t.key} style={{ ...S.tab, color: on ? COLORS.green : COLORS.dim }}
                  onClick={() => onChange(t.key)}>
            <span style={{ ...S.tabIcon, filter: on ? "none" : "grayscale(0.6) opacity(0.7)" }}>{t.icon}</span>
            <span style={S.tabLabel}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
