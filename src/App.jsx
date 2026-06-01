import { useState, useEffect } from "react";
import { getPwd, getCache, setCache, clearPwd } from "./lib/cache.js";
import * as api from "./lib/api.js";
import Login from "./components/Login.jsx";
import Home from "./components/Home.jsx";
import SessionEditor from "./components/SessionEditor.jsx";
import Progress from "./components/Progress.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [sessions, setSessions] = useState(getCache());
  const [view, setView] = useState("home"); // home | editor | progress
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const refresh = async () => {
    try {
      const rows = await api.listSessions();
      setSessions(rows);
      setCache(rows);
    } catch (e) {
      if (e instanceof api.AuthError) { clearPwd(); setAuthed(false); }
      else notify(e.message, "error");
    }
  };

  useEffect(() => {
    if (!getPwd()) return;
    api.checkAuth(getPwd())
      .then((ok) => { if (ok) { setAuthed(true); refresh(); } else clearPwd(); })
      .catch(() => {});
  }, []);

  if (!authed) return <Login onSuccess={() => { setAuthed(true); refresh(); }} />;

  const save = async (s) => {
    try {
      if (s.id != null) await api.updateSession(s.id, s);
      else await api.createSession(s);
      await refresh();
      notify("Enregistré");
      setView("home");
    } catch (e) { notify(e.message, "error"); }
  };

  const remove = async (id) => {
    try {
      await api.deleteSession(id);
      await refresh();
      notify("Supprimée");
      setView("home");
    } catch (e) { notify(e.message, "error"); }
  };

  const importAll = async (data) => {
    try {
      for (const s of data) await api.createSession(s);
      await refresh();
      notify(`${data.length} séances importées`);
    } catch (e) { notify(e.message, "error"); }
  };

  return (
    <>
      <Toast toast={toast} />
      {view === "home" && (
        <Home sessions={sessions}
              onOpen={(s) => { setEditing(s); setView("editor"); }}
              onNew={() => { setEditing(null); setView("editor"); }}
              onProgress={() => setView("progress")}
              onImport={importAll} notify={notify} />
      )}
      {view === "editor" && (
        <SessionEditor initial={editing} onSave={save} onDelete={remove}
                       onBack={() => setView("home")} />
      )}
      {view === "progress" && (
        <Progress sessions={sessions} onBack={() => setView("home")} />
      )}
    </>
  );
}
