export const EXERCISE_CATALOG = {
  "Poitrine": [
    "Développé couché haltères","Développé couché barre","Développé incliné haltères",
    "Développé incliné barre","Développé décliné haltères","Écarté haltères couché",
    "Écarté poulie croisée","Pec Deck (butterfly)","Push-up lest","Dips pectoraux",
  ],
  "Dos": [
    "Lat Pulldown machine","Lat Pulldown poulie","Rowing barre","Rowing haltère unilatéral",
    "Rowing machine assise","Tirage horizontal poulie","Pull-up / Traction","Face Pull poulie",
    "Deadlift","Hyperextension","Shrug haltères","Shrug barre",
  ],
  "Épaules": [
    "Développé militaire haltères","Développé militaire barre","Élévation latérale haltères",
    "Élévation frontale haltères","Oiseau haltères","Élévation latérale poulie",
    "Arnold press","Upright row barre","Upright row poulie",
  ],
  "Biceps": [
    "Curl haltères alterné","Curl barre droite","Curl barre EZ","Curl marteau",
    "Curl concentré","Curl poulie basse","Curl incliné haltères","Preacher curl machine",
  ],
  "Triceps": [
    "Dips triceps","Pushdown poulie droite","Pushdown corde","Extension nuque haltère",
    "Extension nuque poulie","Kickback haltère","Close grip bench press","Skull crusher EZ",
  ],
  "Jambes": [
    "Squat barre","Hack squat machine","Leg press machine","Fentes haltères",
    "Leg extension machine","Leg curl machine (couché)","Leg curl machine (assis)",
    "Romanian deadlift","Bulgarian split squat","Calf raise machine","Calf raise debout haltères",
    "Goblet squat","Step-up haltères",
  ],
  "Fessiers": [
    "Hip thrust machine","Hip thrust barre","Glute kickback machine","Abduction machine",
    "Adduction machine","Fentes bulgares haltères","Romanian deadlift unilatéral",
  ],
  "Abdominaux": [
    "Crunch machine","Crunch câble","Planche","Relevé de jambes","Russian twist",
    "Ab wheel","Obliques poulie","Hollow hold",
  ],
  "Cardio": [
    "Tapis de course","Vélo","Elliptique","Rameur","Stepper","Corde à sauter",
  ],
};

export const ALL_EXERCISES = Object.entries(EXERCISE_CATALOG).flatMap(([cat, exs]) =>
  exs.map(name => ({ name, cat }))
);

// Map nom d'exercice -> catégorie (agrégations par groupe musculaire)
export const EXERCISE_CAT = Object.fromEntries(
  ALL_EXERCISES.map((e) => [e.name, e.cat])
);
