const isNum = (v) => typeof v === "number" && !Number.isNaN(v);

export function validateSessions(data) {
  if (!Array.isArray(data))
    return { ok: false, error: "Le JSON doit être un tableau de séances." };
  for (const [i, s] of data.entries()) {
    if (!s || typeof s.label !== "string" || !s.label.trim())
      return { ok: false, error: `Séance #${i + 1} : "label" manquant.` };
    if (!Array.isArray(s.exercises))
      return { ok: false, error: `Séance #${i + 1} : "exercises" doit être un tableau.` };
    for (const [j, ex] of s.exercises.entries()) {
      if (!ex || typeof ex.name !== "string")
        return { ok: false, error: `Séance #${i + 1}, exercice #${j + 1} : "name" manquant.` };
      if (!Array.isArray(ex.sets))
        return { ok: false, error: `Séance #${i + 1}, exercice #${j + 1} : "sets" doit être un tableau.` };
      for (const [k, set] of ex.sets.entries())
        if (!isNum(set.kg) || !isNum(set.reps))
          return { ok: false, error: `Séance #${i + 1}, ex #${j + 1}, série #${k + 1} : kg/reps numériques requis.` };
    }
  }
  return { ok: true, value: data };
}
