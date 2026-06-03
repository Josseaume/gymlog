// Catalogue d'exercices GymLog v2.
// Couverture type Basic Fit : tous les groupes musculaires (machines guidées,
// poulies, haltères, barres, poids du corps) + cardio (machines) + course.
//
// Chaque exercice : { name, group, type, equipment }
//   type      : "strength" (kg × reps) | "cardio" (distance + temps → allure)
//   equipment : "barre"|"haltère"|"machine"|"poulie"|"poids du corps"|"cardio"|"course"
//
// IMPORTANT : les noms utilisés par data/seed.js doivent rester identiques pour
// que les agrégations par groupe musculaire continuent de fonctionner.

const G = {
  "Poitrine": { type: "strength", items: [
    ["Développé couché barre", "barre"],
    ["Développé couché haltères", "haltère"],
    ["Développé couché Smith", "machine"],
    ["Développé incliné barre", "barre"],
    ["Développé incliné haltères", "haltère"],
    ["Développé décliné barre", "barre"],
    ["Développé décliné haltères", "haltère"],
    ["Développé poitrine machine", "machine"],
    ["Pec Deck (butterfly)", "machine"],
    ["Écarté haltères couché", "haltère"],
    ["Écarté incliné haltères", "haltère"],
    ["Écarté poulie haute (croisé)", "poulie"],
    ["Écarté poulie basse", "poulie"],
    ["Pull-over haltère", "haltère"],
    ["Pompes", "poids du corps"],
    ["Pompes lestées", "poids du corps"],
    ["Dips pectoraux", "poids du corps"],
    ["Dips machine assistée", "machine"],
  ]},
  "Dos": { type: "strength", items: [
    ["Tractions pronation", "poids du corps"],
    ["Tractions supination", "poids du corps"],
    ["Traction assistée machine", "machine"],
    ["Lat Pulldown machine", "machine"],
    ["Lat Pulldown poulie large", "poulie"],
    ["Lat Pulldown prise serrée", "poulie"],
    ["Tirage horizontal poulie", "poulie"],
    ["Tirage horizontal machine assise", "machine"],
    ["Rowing barre", "barre"],
    ["Rowing T-barre", "barre"],
    ["Rowing haltère unilatéral", "haltère"],
    ["Rowing machine assise", "machine"],
    ["Pull-over poulie", "poulie"],
    ["Face Pull poulie", "poulie"],
    ["Soulevé de terre (deadlift)", "barre"],
    ["Soulevé de terre roumain", "barre"],
    ["Hyperextension (lombaires)", "poids du corps"],
    ["Shrug haltères", "haltère"],
    ["Shrug barre", "barre"],
    ["Shrug poulie", "poulie"],
  ]},
  "Épaules": { type: "strength", items: [
    ["Développé militaire barre", "barre"],
    ["Développé militaire haltères", "haltère"],
    ["Développé épaules machine", "machine"],
    ["Développé Arnold", "haltère"],
    ["Élévation latérale haltères", "haltère"],
    ["Élévation latérale poulie", "poulie"],
    ["Élévation latérale machine", "machine"],
    ["Élévation frontale haltères", "haltère"],
    ["Élévation frontale poulie", "poulie"],
    ["Oiseau haltères (deltoïde post.)", "haltère"],
    ["Oiseau poulie", "poulie"],
    ["Pec Deck inversé (deltoïde post.)", "machine"],
    ["Tirage menton barre", "barre"],
    ["Tirage menton poulie", "poulie"],
  ]},
  "Biceps": { type: "strength", items: [
    ["Curl barre droite", "barre"],
    ["Curl barre EZ", "barre"],
    ["Curl haltères alterné", "haltère"],
    ["Curl haltères simultané", "haltère"],
    ["Curl marteau", "haltère"],
    ["Curl incliné haltères", "haltère"],
    ["Curl concentré", "haltère"],
    ["Curl pupitre (preacher) barre", "barre"],
    ["Curl pupitre machine", "machine"],
    ["Curl poulie basse", "poulie"],
    ["Curl poulie haute (crucifix)", "poulie"],
    ["Curl Zottman", "haltère"],
  ]},
  "Triceps": { type: "strength", items: [
    ["Barre au front (skull crusher)", "barre"],
    ["Extension nuque haltère", "haltère"],
    ["Extension nuque poulie corde", "poulie"],
    ["Pushdown poulie barre", "poulie"],
    ["Pushdown poulie corde", "poulie"],
    ["Développé couché prise serrée", "barre"],
    ["Dips triceps", "poids du corps"],
    ["Dips machine", "machine"],
    ["Kickback haltère", "haltère"],
    ["Kickback poulie", "poulie"],
    ["Extension triceps machine", "machine"],
  ]},
  "Avant-bras": { type: "strength", items: [
    ["Curl poignets barre", "barre"],
    ["Curl poignets inversé", "barre"],
    ["Curl poignets haltères", "haltère"],
    ["Farmer walk haltères", "haltère"],
  ]},
  "Jambes": { type: "strength", items: [
    ["Squat barre", "barre"],
    ["Squat avant (front squat)", "barre"],
    ["Squat Smith", "machine"],
    ["Hack squat machine", "machine"],
    ["Leg press machine", "machine"],
    ["Presse à cuisses horizontale", "machine"],
    ["Fentes haltères", "haltère"],
    ["Fentes marchées", "haltère"],
    ["Fente bulgare haltères", "haltère"],
    ["Goblet squat", "haltère"],
    ["Leg extension machine", "machine"],
    ["Leg curl assis machine", "machine"],
    ["Leg curl couché machine", "machine"],
    ["Soulevé de terre jambes tendues", "barre"],
    ["Adducteurs machine", "machine"],
    ["Abducteurs machine", "machine"],
    ["Step-up haltères", "haltère"],
    ["Sissy squat", "poids du corps"],
  ]},
  "Fessiers": { type: "strength", items: [
    ["Hip thrust barre", "barre"],
    ["Hip thrust machine", "machine"],
    ["Glute bridge", "poids du corps"],
    ["Glute kickback machine", "machine"],
    ["Kickback fessier poulie", "poulie"],
    ["Abduction poulie", "poulie"],
    ["Fente bulgare (fessiers)", "haltère"],
    ["Soulevé de terre roumain unilatéral", "haltère"],
  ]},
  "Mollets": { type: "strength", items: [
    ["Mollets debout machine", "machine"],
    ["Mollets assis machine", "machine"],
    ["Mollets à la presse", "machine"],
    ["Mollets debout haltères", "haltère"],
  ]},
  "Abdominaux": { type: "strength", items: [
    ["Crunch au sol", "poids du corps"],
    ["Crunch machine", "machine"],
    ["Crunch poulie (corde)", "poulie"],
    ["Relevé de jambes suspendu", "poids du corps"],
    ["Relevé de jambes banc", "poids du corps"],
    ["Planche", "poids du corps"],
    ["Planche latérale", "poids du corps"],
    ["Russian twist", "poids du corps"],
    ["Roue abdominale (ab wheel)", "poids du corps"],
    ["Obliques poulie (woodchopper)", "poulie"],
    ["Hollow hold", "poids du corps"],
    ["Sit-up lesté", "poids du corps"],
  ]},
  "Full body": { type: "strength", items: [
    ["Burpees", "poids du corps"],
    ["Kettlebell swing", "haltère"],
    ["Thrusters", "haltère"],
    ["Clean and press", "barre"],
    ["Box jump", "poids du corps"],
    ["Battle ropes", "poids du corps"],
    ["Slam ball", "poids du corps"],
    ["Mountain climbers", "poids du corps"],
  ]},
  "Cardio": { type: "cardio", items: [
    ["Tapis de course (marche)", "cardio"],
    ["Tapis de course (course)", "cardio"],
    ["Vélo (spinning)", "cardio"],
    ["Vélo assis (semi-allongé)", "cardio"],
    ["Air bike", "cardio"],
    ["Elliptique", "cardio"],
    ["Rameur", "cardio"],
    ["Stepper / escalier", "cardio"],
    ["Cross trainer", "cardio"],
    ["Corde à sauter", "cardio"],
  ]},
  "Course": { type: "cardio", items: [
    ["Course extérieure", "course"],
    ["Course fractionnée", "course"],
    ["Trail", "course"],
    ["Marche rapide", "course"],
  ]},
};

// Liste maître
export const EXERCISES = Object.entries(G).flatMap(([group, { type, items }]) =>
  items.map(([name, equipment]) => ({ name, group, type, equipment })));

// Vue groupée (groupe → [noms]) pour le sélecteur
export const EXERCISE_CATALOG = Object.fromEntries(
  Object.entries(G).map(([group, { items }]) => [group, items.map(([n]) => n)])
);

// Liste plate { name, cat, type, equipment } (cat = group, conservé pour compat)
export const ALL_EXERCISES = EXERCISES.map((e) => ({
  name: e.name, cat: e.group, type: e.type, equipment: e.equipment,
}));

// Maps nom → …
export const EXERCISE_CAT = Object.fromEntries(EXERCISES.map((e) => [e.name, e.group]));
export const EXERCISE_TYPE = Object.fromEntries(EXERCISES.map((e) => [e.name, e.type]));
export const EXERCISE_EQUIP = Object.fromEntries(EXERCISES.map((e) => [e.name, e.equipment]));

// Type d'un exercice (défaut "strength" pour un nom inconnu / exo perso)
export const exerciseType = (name) => EXERCISE_TYPE[name] || "strength";

// Liste des groupes dans l'ordre d'affichage
export const GROUPS = Object.keys(G);
export const EQUIPMENTS = ["barre", "haltère", "machine", "poulie", "poids du corps", "cardio", "course"];
