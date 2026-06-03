import { describe, it, expect } from "vitest";
import { buildPreprompt } from "./aiExport.js";

const fixture = {
  profile: { name: "Arthur", height_cm: 180, level: "intermédiaire", reps_threshold: 13 },
  goals: [
    { type: "lift", exercise: "Curl haltères alterné", target: 30, label: "Curl 30 kg" },
    { type: "running", target_distance: 5, target_seconds: 1500 },
  ],
  metrics: [
    { id: 1, kind: "weight", date: "2025-01-01", value: 73 },
    { id: 2, kind: "weight", date: "2025-03-01", value: 75 },
    { id: 3, kind: "arm_l", date: "2025-03-01", value: 36 },
  ],
  analyses: [{ date: "2025-05-01", text: "Dos en retard.", focus: ["Dos", "Ischios"] }],
  sessions: [
    { label: "Push", date: "2025-03-01", duration: 50, exercises: [
      { name: "Curl haltères alterné", sets: [{ kg: 26, reps: 14 }, { kg: 26, reps: 13 }] },
      { name: "Course extérieure", type: "cardio", sets: [{ distance: 5, duration: 1600 }] },
    ] },
  ],
};

describe("buildPreprompt", () => {
  const out = buildPreprompt(fixture);

  it("inclut les sections clés", () => {
    expect(out).toContain("## Profil");
    expect(out).toContain("## Objectifs");
    expect(out).toContain("## Règle de progression des charges");
    expect(out).toContain("## Historique récent");
  });
  it("énonce la règle des reps avec le seuil", () => {
    expect(out).toContain("13 répétitions ou plus");
  });
  it("liste les exercices prêts à monter en charge", () => {
    expect(out).toContain("Curl haltères alterné");
    expect(out).toMatch(/prêts à monter en charge.*Curl haltères alterné/s);
  });
  it("formate le cardio (distance/temps/allure)", () => {
    expect(out).toContain("5 km");
    expect(out).toMatch(/cardio/);
  });
  it("inclut profil et analyse", () => {
    expect(out).toContain("Poids de corps : 75 kg");
    expect(out).toContain("Dos en retard.");
    expect(out).toContain("Axes à améliorer : Dos, Ischios");
  });
  it("se termine par la demande de plan", () => {
    expect(out.trim().endsWith("Propose maintenant un plan pour atteindre les objectifs ci-dessus.")).toBe(true);
  });
  it("ne plante pas sans données", () => {
    expect(() => buildPreprompt()).not.toThrow();
    expect(buildPreprompt()).toContain("## Profil");
  });
});
