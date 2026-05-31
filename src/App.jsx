import { useState, useEffect, useRef } from "react";

// ─── ALL BASIC FIT EXERCISES ────────────────────────────────────────────────
const EXERCISE_CATALOG = {
  "Poitrine": [
    "Développé couché haltères","Développé couché barre","Développé incliné haltères",
    "Développé incliné barre","Développé décliné haltères","Écarté haltères couché",
    "Écarté poulie croisée","Pec Deck (butterfly)","Push-up lest","Dips pectoraux",
  ],
  "Dos": [
    "Lat Pulldown machine","Lat Pulldown poulie","Rowing barre","Rowing haltère unilatéral",
    "Rowing machine assise","Tirage horizontal poulie","Pull-up / Traction","Face Pull poulie",
    "Deadlift","Hyperextension","Shrug haltères","Shrug barre",
  ],
  "Épaules": [
    "Développé militaire haltères","Développé militaire barre","Élévation latérale haltères",
    "Élévation frontale haltères","Oiseau haltères","Élévation latérale poulie",
    "Arnold press","Upright row barre","Upright row poulie",
  ],
  "Biceps": [
    "Curl haltères alterné","Curl barre droite","Curl barre EZ","Curl marteau",
    "Curl concentré","Curl poulie basse","Curl incliné haltères","Preacher curl machine",
  ],
  "Triceps": [
    "Dips triceps","Pushdown poulie droite","Pushdown corde","Extension nuque haltère",
    "Extension nuque poulie","Kickback haltère","Close grip bench press","Skull crusher EZ",
  ],
  "Jambes": [
    "Squat barre","Hack squat machine","Leg press machine","Fentes haltères",
    "Leg extension machine","Leg curl machine (couché)","Leg curl machine (assis)",
    "Romanian deadlift","Bulgarian split squat","Calf raise machine","Calf raise debout haltères",
    "Goblet squat","Step-up haltères",
  ],
  "Fessiers": [
    "Hip thrust machine","Hip thrust barre","Glute kickback machine","Abduction machine",
    "Adduction machine","Fentes bulgares haltères","Romanian deadlift unilatéral",
  ],
  "Abdominaux": [
    "Crunch machine","Crunch câble","Planche","Relevé de jambes","Russian twist",
    "Ab wheel","Obliques poulie","Hollow hold",
  ],
  "Cardio": [
    "Tapis de course","Vélo","Elliptique","Rameur","Stepper","Corde à sauter",
  ],
};

const ALL_EXERCISES = Object.entries(EXERCISE_CATALOG).flatMap(([cat, exs]) =>
  exs.map(name => ({ name, cat }))
);

// ─── SEED DATA (tes 6 séances) ───────────────────────────────────────────────
const SEED_SESSIONS = [
  { id:1, label:"Séance 1", date:"2025-01-01", duration:40, notes:"", exercises:[
    { name:"Développé couché haltères", sets:[{kg:20,reps:20,note:"2min pause"},{kg:30,reps:10},{kg:30,reps:5},{kg:25,reps:7}] },
    { name:"Curl haltères alterné", sets:[{kg:27,reps:15},{kg:32,reps:9},{kg:36,reps:5}] },
    { name:"Lat Pulldown machine", sets:[{kg:20,reps:20},{kg:30,reps:15},{kg:40,reps:5}] },
    { name:"Hack squat machine", sets:[{kg:10,reps:10},{kg:10,reps:10},{kg:10,reps:6}] },
    { name:"Développé couché haltères", sets:[{kg:16,reps:10},{kg:18,reps:3}] },
  ]},
  { id:2, label:"Séance 2", date:"2025-01-02", duration:70, notes:"Pas fait jambes. À jeun.", exercises:[
    { name:"Développé couché haltères", sets:[{kg:16,reps:15},{kg:18,reps:9},{kg:20,reps:3},{kg:20,reps:3}], note:"Pas congestionné, activation pecto difficile" },
    { name:"Développé militaire haltères", sets:[{kg:12,reps:13},{kg:12,reps:12},{kg:14,reps:5},{kg:14,reps:1}] },
    { name:"Développé couché haltères", sets:[{kg:15,reps:9},{kg:15,reps:9},{kg:20,reps:2}], note:"Reps variables" },
    { name:"Lat Pulldown machine", sets:[{kg:32,reps:15},{kg:39,reps:14},{kg:45,reps:5},{kg:45,reps:4}] },
    { name:"Curl haltères alterné", sets:[{kg:23,reps:10},{kg:27,reps:7},{kg:32,reps:1}] },
    { name:"Leg press machine", sets:[{kg:10,reps:15},{kg:20,reps:15},{kg:25,reps:10}] },
  ]},
  { id:3, label:"Séance 3", date:"2025-01-03", duration:40, notes:"2 jours d'affilée, fatigue accumulée", exercises:[
    { name:"Développé couché haltères", sets:[{kg:16,reps:15},{kg:18,reps:8},{kg:20,reps:1},{kg:20,reps:0}] },
    { name:"Leg press machine", sets:[{kg:73,reps:15},{kg:86,reps:15},{kg:100,reps:15},{kg:113,reps:10}] },
    { name:"Lat Pulldown machine", sets:[{kg:32,reps:15},{kg:39,reps:9},{kg:45,reps:5}] },
    { name:"Dips triceps", sets:[{kg:45,reps:15},{kg:50,reps:6},{kg:54,reps:4}] },
  ]},
  { id:4, label:"Séance 3bis", date:"2025-01-05", duration:70, notes:"", exercises:[
    { name:"Développé couché haltères", sets:[{kg:16,reps:15},{kg:18,reps:15},{kg:20,reps:6},{kg:22,reps:5}] },
    { name:"Développé couché haltères", sets:[{kg:20,reps:9},{kg:20,reps:3},{kg:20,reps:9},{kg:25,reps:3}] },
    { name:"Curl haltères alterné", sets:[{kg:23,reps:15},{kg:27,reps:15},{kg:32,reps:8},{kg:36,reps:2}] },
    { name:"Lat Pulldown machine", sets:[{kg:20,reps:15},{kg:30,reps:15},{kg:40,reps:4}] },
    { name:"Glute kickback machine", sets:[{kg:5,reps:15},{kg:10,reps:15},{kg:15,reps:10},{kg:20,reps:9}] },
    { name:"Hack squat machine", sets:[{kg:0,reps:7},{kg:5,reps:5}] },
  ]},
  { id:5, label:"Séance 4", date:"2025-01-08", duration:53, notes:"", exercises:[
    { name:"Développé couché haltères", sets:[{kg:18,reps:15},{kg:20,reps:10},{kg:22,reps:6},{kg:24,reps:4}] },
    { name:"Développé couché haltères", sets:[{kg:20,reps:12},{kg:25,reps:4},{kg:25,reps:3}] },
    { name:"Lat Pulldown machine", sets:[{kg:30,reps:15},{kg:40,reps:5}] },
    { name:"Hack squat machine", sets:[{kg:10,reps:10},{kg:15,reps:5},{kg:15,reps:5}] },
    { name:"Curl haltères alterné", sets:[{kg:27,reps:15},{kg:32,reps:10},{kg:36,reps:4}] },
  ]},
  { id:6, label:"Séance 5", date:"2025-01-10", duration:74, notes:"À jeun", exercises:[
    { name:"Développé couché haltères", sets:[{kg:18,reps:15},{kg:20,reps:14},{kg:22,reps:6},{kg:24,reps:2}] },
    { name:"Développé couché haltères", sets:[{kg:20,reps:15},{kg:20,reps:10},{kg:30,reps:2}] },
    { name:"Lat Pulldown machine", sets:[{kg:32,reps:15},{kg:39,reps:15},{kg:45,reps:6},{kg:52,reps:5}] },
    { name:"Glute kickback machine", sets:[{kg:10,reps:15},{kg:20,reps:15},{kg:25,reps:11},{kg:30,reps:10}] },
    { name:"Hack squat machine", sets:[{kg:10,reps:13},{kg:15,reps:6}] },
  ]},
  { id:7, label:"Séance 6", date:"2025-01-12", duration:null, notes:"", exercises:[
    { name:"Développé couché haltères", sets:[{kg:20,reps:15},{kg:22,reps:9},{kg:24,reps:6}], note:"26kg fail" },
    { name:"Développé militaire haltères", sets:[{kg:12,reps:15},{kg:14,reps:15},{kg:16,reps:10}], note:"18kg raté" },
    { name:"Hack squat machine", sets:[{kg:10,reps:11},{kg:15,reps:8}], note:"20kg fail" },
    { name:"Curl haltères alterné", sets:[{kg:27,reps:15},{kg:32,reps:11},{kg:36,reps:2}], note:"Blocage incompris" },
< truncated lines 101-578 >
const S = {
  screen: { background:"#0c0c0c", minHeight:"100vh", fontFamily:"'IBM Plex Mono', 'Courier New', monospace", color:"#e2e2e2", maxWidth:430, margin:"0 auto", display:"flex", flexDirection:"column" },
  topBar: { background:"#111", borderBottom:"1px solid #1f1f1f", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:20 },
  topTitle: { flex:1, fontWeight:700, fontSize:15, letterSpacing:"-0.3px" },
  backBtn: { background:"none", border:"none", color:"#a3e635", fontSize:22, cursor:"pointer", padding:"0 4px", lineHeight:1 },
  scroll: { flex:1, overflowY:"auto", padding:"14px 16px 100px" },

  homeHeader: { background:"#111", padding:"20px 16px 16px", borderBottom:"1px solid #1f1f1f" },
  homeLogo: { fontFamily:"'IBM Plex Mono', monospace", fontWeight:800, fontSize:28, letterSpacing:"-1px", marginBottom:14 },
  homeStats: { display:"flex", gap:16 },
  stat: { display:"flex", flexDirection:"column" },
  statN: { fontWeight:800, fontSize:24, color:"#a3e635", lineHeight:1 },
  statL: { fontSize:11, color:"#444", marginTop:2 },

  actionRow: { display:"flex", gap:10, marginBottom:14 },
  bigBtn: { flex:1, background:"#a3e635", color:"#0c0c0c", border:"none", borderRadius:10, padding:"12px 10px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" },

  exportBox: { background:"#141a0a", border:"1px solid #2a3a1a", borderRadius:12, padding:"14px", marginBottom:16 },
  exportTitle: { fontWeight:700, fontSize:13, color:"#a3e635", marginBottom:4 },
  exportSub: { fontSize:11, color:"#556", lineHeight:1.5, marginBottom:10 },
  exportBtns: { display:"flex", gap:8 },
  exportBtn: { flex:1, background:"#1f2a0f", border:"1px solid #3a5a1a", borderRadius:8, padding:"8px", color:"#a3e635", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:700 },

  secLabel: { fontSize:10, fontWeight:700, color:"#333", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, marginTop:18 },
  sessionRow: { width:"100%", background:"#141414", border:"1px solid #1e1e1e", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:8, marginBottom:8, cursor:"pointer", textAlign:"left" },
  sessionLeft: { flex:1 },
  sessionLabel: { fontWeight:700, fontSize:14 },
  sessionSub: { fontSize:11, color:"#444", marginTop:3 },
  chev: { color:"#333", fontSize:20, lineHeight:1 },

  progFullBtn: { width:"100%", background:"#141414", border:"1px solid #1e1e1e", borderRadius:10, padding:"12px 14px", color:"#a3e635", fontWeight:700, fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"inherit", marginBottom:8 },
  miniProgRow: { width:"100%", background:"#111", border:"none", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6, cursor:"pointer", textAlign:"left" },
  miniProgName: { fontSize:12, color:"#888" },
  miniProgVal: { fontSize:12, color:"#a3e635", fontWeight:700 },

  heroCard: { background:"#141a0a", border:"1px solid #2a3a1a", borderRadius:14, padding:"20px", textAlign:"center", marginBottom:16 },
  heroLabel: { fontSize:10, color:"#556", letterSpacing:"0.1em", marginBottom:8, fontWeight:700 },
  heroVal: { fontSize:36, fontWeight:800, color:"#a3e635", letterSpacing:"-1px", lineHeight:1 },
  heroUnit: { fontSize:16, color:"#666", fontWeight:400, marginLeft:2 },
  heroSub: { fontSize:13, color:"#444", marginTop:6 },

  barWrap: { marginBottom:12 },
  barMeta: { display:"flex", justifyContent:"space-between", marginBottom:4 },
  barName: { fontSize:12, color:"#666" },
  barNum: { fontSize:12, color:"#a3e635", fontWeight:700 },
  barTrack: { height:8, background:"#1e1e1e", borderRadius:4, overflow:"hidden" },
  barFill: { height:"100%", background:"linear-gradient(90deg,#3a6a0a,#a3e635)", borderRadius:4, transition:"width 0.4s" },

  exCard: { background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:"14px", marginBottom:12 },
  exCardHead: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 },
  exCardName: { fontWeight:700, fontSize:14, color:"#a3e635" },
  exCardNote: { fontSize:12, color:"#666", fontStyle:"italic", marginBottom:8, lineHeight:1.5 },
  planTip: { background:"#1a200a", border:"1px solid #2a3a0a", borderRadius:6, padding:"6px 10px", fontSize:12, color:"#8ab44a", marginBottom:8, lineHeight:1.5 },
  progLink: { background:"none", border:"none", fontSize:16, cursor:"pointer" },

  setRow: { display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderTop:"1px solid #1e1e1e" },
  setIdx: { fontSize:11, color:"#333", width:16 },
  setKg: { fontSize:14, color:"#e2e2e2", fontWeight:700, minWidth:40 },
  setReps: { fontSize:14, color:"#e2e2e2", minWidth:40 },
  setX: { color:"#333", fontSize:14 },
  setVol: { fontSize:12, color:"#a3e635" },
  setUnit: { fontSize:10, color:"#444", marginLeft:2 },
  miniIn: { width:64, background:"#0c0c0c", border:"1px solid #2a2a2a", borderRadius:6, padding:"7px 8px", color:"#e2e2e2", fontSize:14, textAlign:"center", fontFamily:"inherit" },
  delBtn: { background:"none", border:"none", color:"#333", fontSize:14, cursor:"pointer", padding:"0 4px", marginLeft:"auto" },
  addSetBtn: { width:"100%", background:"none", border:"1px dashed #222", borderRadius:6, padding:"7px", color:"#444", fontSize:12, cursor:"pointer", fontFamily:"inherit", marginTop:6 },
  exVol: { textAlign:"right", fontSize:11, color:"#444", marginTop:6 },

  totalVolBox: { background:"#141a0a", border:"1px solid #2a3a1a", borderRadius:10, padding:"12px 16px", textAlign:"center", fontSize:14, color:"#a3e635", marginTop:12 },
  dangerBtn: { width:"100%", background:"none", border:"1px solid #3a1a1a", borderRadius:8, padding:"10px", color:"#7a3a3a", fontSize:12, cursor:"pointer", fontFamily:"inherit", marginTop:20 },

  logMeta: { display:"flex", gap:10, marginBottom:10 },
  metaField: { flex:1, display:"flex", flexDirection:"column", gap:4 },
  metaLabel: { fontSize:10, color:"#333", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" },
  metaIn: { background:"#141414", border:"1px solid #1e1e1e", borderRadius:8, padding:"8px 10px", color:"#e2e2e2", fontSize:13, fontFamily:"inherit" },
  titleInput: { background:"none", border:"none", color:"#e2e2e2", fontSize:15, fontWeight:700, fontFamily:"inherit", width:"100%", outline:"none" },
  saveTopBtn: { background:"#a3e635", color:"#0c0c0c", border:"none", borderRadius:8, padding:"7px 14px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" },

  searchIn: { width:"100%", background:"#141414", border:"1px solid #1e1e1e", borderRadius:8, padding:"10px 12px", color:"#e2e2e2", fontSize:13, fontFamily:"inherit", marginBottom:8, boxSizing:"border-box" },
  catBtn: { width:"100%", background:"#0f0f0f", border:"1px solid #1e1e1e", borderRadius:8, padding:"10px 14px", color:"#888", fontSize:12, cursor:"pointer", textAlign:"left", fontFamily:"inherit", fontWeight:700, marginBottom:4, display:"flex", justifyContent:"space-between" },
  exItem: { width:"100%", background:"#141414", border:"none", borderLeft:"2px solid #2a2a2a", padding:"9px 14px 9px 20px", color:"#ccc", fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"inherit", display:"block" },

  focusBanner: { background:"#0f1a1f", border:"1px solid #1a3a4a", borderRadius:8, padding:"8px 12px", fontSize:13, color:"#60a5fa", marginBottom:12 },
  noteBox: { background:"#141414", borderLeft:"3px solid #a3e635", borderRadius:"0 8px 8px 0", padding:"10px 12px", fontSize:12, color:"#666", marginBottom:12, lineHeight:1.5 },

  importInstr: { background:"#141414", borderRadius:12, padding:"16px", marginBottom:16 },
  importStep: { display:"flex", alignItems:"flex-start", gap:12, marginBottom:10, fontSize:13, color:"#888", lineHeight:1.5 },
  stepNum: { background:"#a3e635", color:"#0c0c0c", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, flexShrink:0, marginTop:1 },
  jsonArea: { width:"100%", background:"#0c0c0c", border:"1px solid #1e1e1e", borderRadius:8, padding:"12px", color:"#a3e635", fontSize:11, fontFamily:"'IBM Plex Mono', monospace", resize:"vertical", boxSizing:"border-box", lineHeight:1.6 },
  errorBox: { background:"#1f0a0a", border:"1px solid #4a1a1a", borderRadius:8, padding:"10px 12px", color:"#f87171", fontSize:12, marginTop:8, marginBottom:8 },
  primaryBtn: { width:"100%", background:"#a3e635", color:"#0c0c0c", border:"none", borderRadius:10, padding:"14px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:12 },

  toast: { position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", color:"#0c0c0c", fontWeight:800, fontSize:13, padding:"10px 20px", borderRadius:10, zIndex:100, fontFamily:"inherit" },
  empty: { color:"#333", textAlign:"center", padding:30, fontSize:13 },

  exProgRow: { width:"100%", background:"#141414", border:"1px solid #1e1e1e", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:8, cursor:"pointer", textAlign:"left" },
  exProgLeft: { flex:1, display:"flex", flexDirection:"column", gap:4 },
  exProgName: { fontWeight:700, fontSize:13 },
  exProgBest: { fontSize:13, color:"#a3e635", fontWeight:700 },
};
