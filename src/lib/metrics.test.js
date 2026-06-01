import { describe, it, expect } from "vitest";
import {
  setVolume, exerciseVolume, sessionVolume,
  bestSet, estimate1RM, sessionStats, byMuscleGroup, exerciseTimeline,
  totalReps, totalSets, totalDuration, volumeSeries, personalRecords,
} from "./metrics.js";

const session = {
  id: 1, date: "2025-01-01", exercises: [
    { name: "Développé couché haltères", sets: [{ kg: 20, reps: 10 }, { kg: 30, reps: 5 }] },
    { name: "Squat barre", sets: [{ kg: 50, reps: 4 }] },
  ],
};

describe("metrics", () => {
  it("setVolume = kg * reps", () => {
    expect(setVolume({ kg: 20, reps: 10 })).toBe(200);
    expect(setVolume({ kg: 0, reps: 5 })).toBe(0);
  });
  it("exerciseVolume somme les séries", () => {
    expect(exerciseVolume(session.exercises[0])).toBe(200 + 150);
  });
  it("sessionVolume somme les exercices", () => {
    expect(sessionVolume(session)).toBe(350 + 200);
  });
  it("estimate1RM utilise Epley (kg*(1+reps/30))", () => {
    expect(estimate1RM({ kg: 30, reps: 5 })).toBeCloseTo(35, 1);
  });
  it("bestSet renvoie la série au 1RM estimé max", () => {
    expect(bestSet([{ kg: 20, reps: 10 }, { kg: 30, reps: 5 }])).toEqual({ kg: 30, reps: 5 });
    expect(bestSet([])).toBeNull();
  });
  it("sessionStats compte séances et volume total", () => {
    const s = sessionStats([session, { id: 2, date: "2025-01-02", exercises: [] }]);
    expect(s.count).toBe(2);
    expect(s.totalVolume).toBe(550);
  });
  it("byMuscleGroup agrège le volume par catégorie", () => {
    const g = byMuscleGroup([session]);
    expect(g.Poitrine).toBe(350);
    expect(g.Jambes).toBe(200);
  });
  it("exerciseTimeline donne les points {date, volume, top} pour un exercice", () => {
    const t = exerciseTimeline([session], "Développé couché haltères");
    expect(t).toEqual([{ date: "2025-01-01", volume: 350, top: 200 }]);
  });
});

describe("metrics dashboard", () => {
  const s2 = {
    id: 2, date: "2025-01-02", duration: 40, exercises: [
      { name: "Squat barre", sets: [{ kg: 60, reps: 3 }] },
    ],
  };
  const sessions = [{ ...session, duration: 60 }, s2];

  it("totalReps somme toutes les répétitions", () => {
    expect(totalReps([session])).toBe(10 + 5 + 4);
  });
  it("totalSets compte toutes les séries", () => {
    expect(totalSets([session])).toBe(3);
  });
  it("totalDuration somme les durées (ignore null)", () => {
    expect(totalDuration(sessions)).toBe(100);
    expect(totalDuration([{ exercises: [] }])).toBe(0);
  });
  it("volumeSeries renvoie {date,label,volume} trié par date", () => {
    const v = volumeSeries(sessions);
    expect(v.map((x) => x.volume)).toEqual([550, 180]);
    expect(v[0].date).toBe("2025-01-01");
  });
  it("personalRecords trie par 1RM estimé décroissant", () => {
    const pr = personalRecords(sessions);
    expect(pr[0].name).toBe("Squat barre");
    expect(pr[0]).toMatchObject({ kg: 60, reps: 3 });
    expect(pr.find((p) => p.name === "Développé couché haltères")).toMatchObject({ kg: 30, reps: 5 });
  });
});
