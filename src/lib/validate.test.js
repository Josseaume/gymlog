import { describe, it, expect } from "vitest";
import { validateSessions } from "./validate.js";

describe("validateSessions", () => {
  it("accepte un tableau de séances bien formées", () => {
    const data = [{ label: "S1", date: "2025-01-01", duration: 40, notes: "", exercises: [
      { name: "Squat barre", sets: [{ kg: 50, reps: 5 }] },
    ] }];
    expect(validateSessions(data)).toEqual({ ok: true, value: data });
  });
  it("rejette si ce n'est pas un tableau", () => {
    expect(validateSessions({}).ok).toBe(false);
  });
  it("rejette une séance sans label", () => {
    expect(validateSessions([{ exercises: [] }]).ok).toBe(false);
  });
  it("rejette une série sans kg/reps numériques", () => {
    const bad = [{ label: "S", exercises: [{ name: "X", sets: [{ kg: "a", reps: 5 }] }] }];
    expect(validateSessions(bad).ok).toBe(false);
  });
  it("accepte une séance cardio (distance/durée)", () => {
    const data = [{ label: "Run", exercises: [
      { name: "Course extérieure", type: "cardio", sets: [{ distance: 5, duration: 1500 }] },
    ] }];
    expect(validateSessions(data).ok).toBe(true);
  });
  it("rejette une série cardio avec distance non numérique", () => {
    const bad = [{ label: "Run", exercises: [
      { name: "Course extérieure", type: "cardio", sets: [{ distance: "loin", duration: 1500 }] },
    ] }];
    expect(validateSessions(bad).ok).toBe(false);
  });
});
