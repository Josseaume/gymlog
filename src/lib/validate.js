const isNum = (v) => typeof v === "number" && !Number.isNaN(v);
const isOptNum = (v) => v == null || isNum(v);

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
      const cardio = ex.type === "cardio";
      for (const [k, set] of ex.sets.entries()) {
        const where = `Séance #${i + 1}, ex #${j + 1}, série #${k + 1}`;
        if (cardio) {
          if (!isOptNum(set.distance) || !isOptNum(set.duration))
            return { ok: false, error: `${where} : distance/durée numériques requis (cardio).` };
        } else if (!isNum(set.kg) || !isNum(set.reps)) {
          return { ok: false, error: `${where} : kg/reps numériques requis.` };
        }
      }
    }
  }
  return { ok: true, value: data };
}
