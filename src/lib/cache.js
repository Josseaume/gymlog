const PWD = "gymlog.pwd";
const UID = "gymlog.uid";

// Mot de passe partagé
export const getPwd = () => localStorage.getItem(PWD) || "";
export const setPwd = (p) => localStorage.setItem(PWD, p);
export const clearPwd = () => localStorage.removeItem(PWD);

// Profil courant
export const getUid = () => localStorage.getItem(UID) || "";
export const setUid = (id) => localStorage.setItem(UID, String(id));
export const clearUid = () => localStorage.removeItem(UID);

// Cache de lecture par ressource et par profil
const key = (resource, uid) => `gymlog.cache.${uid || getUid()}.${resource}`;

export const getCache = (resource, uid) => {
  try { return JSON.parse(localStorage.getItem(key(resource, uid))) || []; }
  catch { return []; }
};
export const setCache = (resource, data, uid) => {
  try { localStorage.setItem(key(resource, uid), JSON.stringify(data)); }
  catch { /* quota */ }
};
