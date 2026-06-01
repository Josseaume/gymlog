const KEY = "gymlog.cache";
const PWD = "gymlog.pwd";

export const getCache = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
export const setCache = (sessions) => {
  try { localStorage.setItem(KEY, JSON.stringify(sessions)); } catch { /* quota */ }
};
export const getPwd = () => localStorage.getItem(PWD) || "";
export const setPwd = (p) => localStorage.setItem(PWD, p);
export const clearPwd = () => localStorage.removeItem(PWD);
