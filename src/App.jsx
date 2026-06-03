import { useState, useEffect } from "react";
import { getPwd, clearPwd, getUid, setUid, clearUid, getCache, setCache } from "./lib/cache.js";
import * as api from "./lib/api.js";
import { buildPreprompt } from "./lib/aiExport.js";
import Login from "./components/Login.jsx";
import ProfileSelector from "./components/ProfileSelector.jsx";
import TabBar from "./components/TabBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import SessionList from "./components/SessionList.jsx";
import SessionEditor from "./components/SessionEditor.jsx";
import ExerciseProgress from "./components/ExerciseProgress.jsx";
import Profile from "./components/Profile.jsx";
import Settings from "./components/Settings.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | login | selector | app
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [sub, setSub] = useState(null); // {type:'editor',session} | {type:'exo',name} | {type:'settings'}
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2400); };
  const onError = (e) => {
    if (e instanceof api.AuthError) { clearPwd(); setPhase("login"); }
    else notify(e.message || "Erreur", "error");
  };

  // ── Chargement initial ──
  useEffect(() => {
    if (!getPwd()) { setPhase("login"); return; }
    api.checkAuth(getPwd())
      .then((ok) => { if (ok) afterAuth(); else { clearPwd(); setPhase("login"); } })
      .catch(() => setPhase("login"));
  }, []);

  const afterAuth = async () => {
    try {
      const us = await api.listUsers();
      setUsers(us);
      const uid = getUid();
      if (uid && us.some((u) => String(u.id) === String(uid))) selectProfile(uid, us);
      else { clearUid(); setPhase("selector"); }
    } catch (e) { onError(e); }
  };

  const refreshData = async (id) => {
    const [se, go, me, an, ph] = await Promise.all([
      api.listSessions(), api.listGoals(), api.listMetrics(), api.listAnalyses(), api.listPhotos(),
    ]);
    setSessions(se); setCache("sessions", se, id);
    setGoals(go); setCache("goals", go, id);
    setMetrics(me); setCache("metrics", me, id);
    setAnalyses(an); setCache("analyses", an, id);
    setPhotos(ph); setCache("photos", ph, id);
  };

  const selectProfile = async (id, us = users) => {
    setUid(id);
    const prof = us.find((u) => String(u.id) === String(id)) || (await api.getUser(id));
    setProfile(prof);
    // cache → affichage instantané
    setSessions(getCache("sessions", id)); setGoals(getCache("goals", id));
    setMetrics(getCache("metrics", id)); setAnalyses(getCache("analyses", id));
    setPhotos(getCache("photos", id));
    setTab("dashboard"); setSub(null); setPhase("app");
    try { await refreshData(id); } catch (e) { onError(e); }
  };

  const createProfile = async (u) => {
    try {
      const created = await api.createUser(u);
      const us = await api.listUsers();
      setUsers(us);
      await selectProfile(created.id, us);
    } catch (e) { onError(e); }
  };

  // ── Séances ──
  const saveSession = async (s) => {
    try {
      if (s.id != null) await api.updateSession(s.id, s);
      else await api.createSession(s);
      await refreshData(getUid());
      notify("Séance enregistrée"); setSub(null); setTab("sessions");
    } catch (e) { onError(e); }
  };
  const removeSession = async (id) => {
    try { await api.deleteSession(id); await refreshData(getUid()); notify("Supprimée"); setSub(null); }
    catch (e) { onError(e); }
  };
  const importSessions = async (data) => {
    try { for (const s of data) await api.createSession(s); await refreshData(getUid()); notify(`${data.length} séances importées`); }
    catch (e) { onError(e); }
  };

  // ── Objectifs / métriques / analyses / photos ──
  const wrap = (fn, msg) => async (...a) => {
    try { await fn(...a); await refreshData(getUid()); if (msg) notify(msg); }
    catch (e) { onError(e); }
  };
  const addGoal = wrap((g) => api.createGoal(g), "Objectif ajouté");
  const updateGoal = wrap((id, g) => api.updateGoal(id, g));
  const deleteGoal = wrap((id) => api.deleteGoal(id));
  const addMetric = wrap((m) => api.createMetric(m), "Enregistré");
  const addAnalysis = wrap((a) => api.createAnalysis(a), "Analyse ajoutée");
  const deleteAnalysis = wrap((id) => api.deleteAnalysis(id));
  const addPhoto = wrap((p) => api.createPhoto(p), "Photo ajoutée");
  const deletePhoto = wrap((id) => api.deletePhoto(id));

  // ── Profil / réglages ──
  const saveSettings = async (patch) => {
    try {
      const updated = await api.updateUser(getUid(), { ...profile, ...patch });
      setProfile(updated);
      setUsers((us) => us.map((u) => (String(u.id) === String(updated.id) ? updated : u)));
      notify("Réglages enregistrés"); setSub(null);
    } catch (e) { onError(e); }
  };
  const switchProfile = () => { clearUid(); setProfile(null); setSub(null); setPhase("selector"); afterAuth(); };
  const logout = () => { clearPwd(); clearUid(); setProfile(null); setPhase("login"); };
  const deleteProfile = async () => {
    if (!window.confirm("Supprimer ce profil et toutes ses données ?")) return;
    try { await api.deleteUser(getUid()); clearUid(); setProfile(null); setSub(null); setPhase("selector"); afterAuth(); }
    catch (e) { onError(e); }
  };

  const exportAI = async () => {
    const text = buildPreprompt({ profile, goals, sessions, metrics, analyses });
    try { await navigator.clipboard.writeText(text); notify("Pré-prompt copié ! Colle-le dans ton IA"); }
    catch {
      const blob = new Blob([text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "gymlog-prompt.txt"; a.click();
      URL.revokeObjectURL(a.href); notify("Pré-prompt téléchargé");
    }
  };

  const openExercise = (name) => setSub({ type: "exo", name });

  // ── Rendu ──
  if (phase === "loading") return <div style={{ background: "#14151a", minHeight: "100vh" }} />;
  if (phase === "login") return <Login onSuccess={afterAuth} />;
  if (phase === "selector") return <ProfileSelector users={users} onPick={(id) => selectProfile(id)} onCreate={createProfile} />;

  // sous-vues plein écran
  if (sub?.type === "editor")
    return (<><Toast toast={toast} />
      <SessionEditor initial={sub.session} onSave={saveSession} onDelete={removeSession}
        onBack={() => setSub(null)} restSeconds={profile?.rest_seconds || 120} repsThreshold={profile?.reps_threshold || 13} />
    </>);
  if (sub?.type === "exo")
    return (<><Toast toast={toast} />
      <ExerciseProgress sessions={sessions} name={sub.name} onBack={() => setSub(null)} /></>);
  if (sub?.type === "settings")
    return (<><Toast toast={toast} />
      <Settings profile={profile} onSave={saveSettings} onSwitchProfile={switchProfile}
        onLogout={logout} onDeleteProfile={deleteProfile} onBack={() => setSub(null)} /></>);

  return (
    <>
      <Toast toast={toast} />
      {tab === "dashboard" && (
        <Dashboard profile={profile} sessions={sessions} goals={goals} metrics={metrics}
          onOpenExercise={openExercise} onAddGoal={() => setTab("profile")} />
      )}
      {tab === "sessions" && (
        <SessionList sessions={sessions} onOpen={(s) => setSub({ type: "editor", session: s })}
          onNew={() => setSub({ type: "editor", session: null })} onImport={importSessions} notify={notify} />
      )}
      {tab === "profile" && (
        <Profile profile={profile} sessions={sessions} goals={goals} metrics={metrics}
          analyses={analyses} photos={photos}
          onAddMetric={addMetric} onAddAnalysis={addAnalysis} onDeleteAnalysis={deleteAnalysis}
          onAddPhoto={addPhoto} onDeletePhoto={deletePhoto}
          onAddGoal={addGoal} onDeleteGoal={deleteGoal} onUpdateGoal={updateGoal}
          onExport={exportAI} onSwitchProfile={switchProfile}
          onOpenSettings={() => setSub({ type: "settings" })} notify={notify} />
      )}
      <TabBar tab={tab} onChange={setTab} />
    </>
  );
}
