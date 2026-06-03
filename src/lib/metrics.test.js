import { describe, it, expect } from "vitest";
import {
  setVolume, exerciseVolume, sessionVolume,
  bestSet, estimate1RM, sessionStats, byMuscleGroup, exerciseTimeline,
  totalReps, totalSets, totalDuration, volumeSeries, personalRecords,
  pace, speed, fmtPace, fmtDuration, sessionDistance, totalDistance, bestRunTime,
  weightProgression, shouldIncreaseWeight, exercisesReadyToProgress,
  bodyweightSeries, latestMetric, latestAnalysis, goalProgress, heroGoal,
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
  it("personalRecords ignore les séries sans charge (cardio)", () => {
    const pr = personalRecords([{ exercises: [
      { name: "Course extérieure", type: "cardio", sets: [{ distance: 5, duration: 1500 }] },
    ] }]);
    expect(pr).toEqual([]);
  });
});

describe("metrics cardio", () => {
  const run = { distance: 5, duration: 1500 }; // 5 km en 25 min
  it("pace = secondes par km", () => {
    expect(pace(run)).toBe(300); // 5:00/km
    expect(pace({ distance: 0, duration: 100 })).toBeNull();
  });
  it("speed = km/h", () => {
    expect(speed(run)).toBe(12);
    expect(speed({ distance: 5 })).toBeNull();
  });
  it("fmtPace formate m:ss/km", () => {
    expect(fmtPace(330)).toBe("5:30/km");
    expect(fmtPace(null)).toBe("—");
  });
  it("fmtDuration formate m:ss et h:mm", () => {
    expect(fmtDuration(90)).toBe("1:30");
    expect(fmtDuration(3700)).toBe("1h01");
  });
  it("sessionDistance / totalDistance somment les km", () => {
    const s = { exercises: [{ name: "Course extérieure", sets: [{ distance: 5, duration: 1500 }, { distance: 2, duration: 600 }] }] };
    expect(sessionDistance(s)).toBe(7);
    expect(totalDistance([s, s])).toBe(14);
  });
  it("bestRunTime renvoie le meilleur temps proche de la distance cible", () => {
    const sessions = [
      { date: "2025-01-01", exercises: [{ name: "Course extérieure", sets: [{ distance: 5, duration: 1600 }] }] },
      { date: "2025-01-08", exercises: [{ name: "Course extérieure", sets: [{ distance: 5, duration: 1500 }] }] },
    ];
    expect(bestRunTime(sessions, 5).duration).toBe(1500);
    expect(bestRunTime(sessions, 42)).toBeNull();
  });
});

describe("progression de charge & règle des reps", () => {
  const sessions = [
    { date: "2025-01-01", exercises: [{ name: "Curl haltères alterné", sets: [{ kg: 20, reps: 10 }] }] },
    { date: "2025-02-01", exercises: [{ name: "Curl haltères alterné", sets: [{ kg: 30, reps: 14 }, { kg: 30, reps: 13 }] }] },
  ];
  it("weightProgression : charge max par séance, trié", () => {
    expect(weightProgression(sessions, "Curl haltères alterné")).toEqual([
      { date: "2025-01-01", kg: 20 },
      { date: "2025-02-01", kg: 30 },
    ]);
  });
  it("shouldIncreaseWeight vrai si toutes les séries de travail ≥ seuil", () => {
    expect(shouldIncreaseWeight({ sets: [{ kg: 30, reps: 14 }, { kg: 30, reps: 13 }] })).toBe(true);
    expect(shouldIncreaseWeight({ sets: [{ kg: 30, reps: 14 }, { kg: 30, reps: 8 }] })).toBe(false);
    expect(shouldIncreaseWeight({ sets: [{ kg: 0, reps: 0 }] })).toBe(false);
  });
  it("exercisesReadyToProgress regarde la dernière séance", () => {
    const ready = exercisesReadyToProgress(sessions);
    expect(ready.map((r) => r.name)).toEqual(["Curl haltères alterné"]);
  });
});

describe("profil & objectifs", () => {
  const metrics = [
    { id: 1, kind: "weight", date: "2025-01-01", value: 73 },
    { id: 2, kind: "weight", date: "2025-03-01", value: 75 },
    { id: 3, kind: "arm_l", date: "2025-03-01", value: 36 },
  ];
  it("bodyweightSeries trié + latestMetric", () => {
    expect(bodyweightSeries(metrics).map((m) => m.value)).toEqual([73, 75]);
    expect(latestMetric(metrics, "weight").value).toBe(75);
  });
  it("latestAnalysis renvoie la plus récente", () => {
    const a = latestAnalysis([
      { date: "2025-01-01", text: "vieux" }, { date: "2025-05-01", text: "récent" },
    ]);
    expect(a.text).toBe("récent");
  });
  it("goalProgress lift", () => {
    const sessions = [
      { date: "2025-01-01", exercises: [{ name: "Curl haltères alterné", sets: [{ kg: 20, reps: 10 }] }] },
      { date: "2025-03-01", exercises: [{ name: "Curl haltères alterné", sets: [{ kg: 26, reps: 8 }] }] },
    ];
    const g = goalProgress({ type: "lift", exercise: "Curl haltères alterné", target: 30 }, { sessions });
    expect(g.current).toBe(26);
    expect(g.baseline).toBe(20);
    expect(g.pct).toBeCloseTo(0.6, 2);
    expect(g.remaining).toBe(4);
  });
  it("goalProgress bodyweight", () => {
    const g = goalProgress({ type: "bodyweight", target: 78, baseline: 73 }, { metrics });
    expect(g.current).toBe(75);
    expect(g.pct).toBeCloseTo(0.4, 2);
  });
  it("goalProgress running (plus bas = mieux)", () => {
    const sessions = [{ date: "2025-01-01", exercises: [{ name: "Course extérieure", sets: [{ distance: 5, duration: 1700 }] }] }];
    const g = goalProgress({ type: "running", target_distance: 5, target_seconds: 1500, baseline: 1700 }, { sessions });
    expect(g.current).toBe(1700);
    expect(g.pct).toBe(0);
    expect(g.ok).toBe(false);
  });
  it("heroGoal préfère l'objectif épinglé", () => {
    const goals = [
      { id: 1, type: "bodyweight", target: 78 },
      { id: 2, type: "bodyweight", target: 80, pinned: true },
    ];
    expect(heroGoal(goals, { metrics }).id).toBe(2);
  });
});
