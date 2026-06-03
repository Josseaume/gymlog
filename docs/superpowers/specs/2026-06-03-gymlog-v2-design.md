# GymLog v2 — Design (coaching, course à pied, profil, objectifs)

**Date:** 2026-06-03
**Statut:** En revue

## But

Faire évoluer GymLog d'un simple carnet de musculation vers une **app de coaching
perso**, plus motivante et moins « brute » :

1. **Course à pied & cardio** intégrés à côté de la muscu.
2. **Catalogue d'exercices complet** type Basic Fit + ajout d'exos perso.
3. **Dashboard repensé** (direction « Coach moderne », sombre doux, cartes
   arrondies, dégradés) dont le **héros est la proximité avec l'objectif**, pas le
   volume.
4. **Section Profil** : analyse de Claude (horodatée), poids de corps, photos de
   progression, mensurations, objectifs.
5. **Suivi de progression** : poids soulevé par exercice dans le temps (« 20 → 30
   kg par bras ») et **règle des reps** (≥ 13 reps sur toutes les séries →
   « monte le poids »), affichée dans l'app **et** injectée dans l'export IA.
6. **Timer de repos** (« bip ») : après avoir noté une série, compte à rebours
   réglable (défaut 2 min) qui bipe/vibre pour lancer la série suivante.
7. **Export IA enrichi** : historique + objectifs + analyse + règle des reps →
   pré-prompt prêt à coller dans n'importe quelle IA, qui lui demande de
   **proposer un plan** pour atteindre les objectifs.

**Exigence ferme (demande explicite d'Arthur) :** tout est persisté côté serveur
(vrai backend). `localStorage` ne sert que de cache de lecture. Aucune donnée
nouvelle (objectifs, profil, analyses, photos, réglages) ne vit uniquement dans
le navigateur.

**Multi-utilisateur léger (décidé en cours de route) :** l'app sert à Arthur **et
ses potes**. On retient un **sélecteur de profils** façon Netflix : un seul mot de
passe partagé pour entrer dans l'app, puis un écran « Qui es-tu ? ». Chaque profil
a SES données (séances, objectifs, physique, photos, réglages). Pas de comptes
individuels ni de mots de passe par personne, pas de vie privée entre profils
(groupe de confiance). Toutes les tables de données portent un `user_id`.

## État de départ

App existante fonctionnelle : SPA Vite/React mobile-first, thème terminal
(monospace, lime `#a3e635`), 3 vues (`home`, `editor`, `progress`). Backend
serverless Vercel `/api/sessions` (+ `[id]`) sur Neon Postgres, auth par mot de
passe partagé (`Authorization: Bearer <pwd>` vs `GYM_PASSWORD`). Modèle :
`session { id, label, date, duration, notes, exercises:[{name, note?,
sets:[{kg, reps, note?}] }] }`. Modules purs testés dans `src/lib/`
(`metrics`, `validate`, `cache`, `api`).

## Direction visuelle (validée)

« Coach moderne » :
- Fond charbon `#14151a`, cartes `#1e2128`, bordures `#262a33`.
- Typo **système sans-serif** (fini le monospace), labels en casse normale
  (fini les MAJUSCULES partout).
- Accent **vert émeraude** en dégradé `#1f6f43 → #23c55e` (remplace le lime).
  Secondaire texte `#7e8694`. Alerte/nudge orange `#f59e0b`. Accent « Claude »
  bleu `#7aa2ff`.
- Cartes très arrondies (16–20px), anneaux/barres de progression, icônes/emojis.

Le design system actuel (`src/styles.js`, objet `S`) est **réécrit** pour ce
langage visuel. Les composants existants migrent vers le nouveau `S`.

---

## Architecture

### Navigation

Passage de 3 vues à une coquille à **3 onglets** (barre du bas, style coach) +
un panneau Réglages :

- **Dashboard** — écran coach : héros objectif, liste d'objectifs, KPIs
  secondaires, « ça progresse » (dont les nudges reps).
- **Séances** — liste des séances (récentes en haut) + bouton « Nouvelle
  séance » → éditeur. Ouvre `ExerciseProgress` au tap sur un exercice.
- **Profil** — identité, poids de corps, photos, mensurations, analyses de
  Claude, bouton « Exporter pour l'IA ».
- **Réglages** (feuille/modale depuis l'en-tête) — durée de repos, seuil de reps,
  export/import JSON, déconnexion.

Avant les onglets, deux portes : **login** (mot de passe partagé) puis
**sélecteur de profils** (`ProfileSelector` — « Qui es-tu ? », création de profil
possible). Le profil choisi est mémorisé (`gymlog.uid`) et envoyé en en-tête
`X-User-Id`. Un bouton « changer de profil » (dans Réglages / en-tête) y revient.

`App.jsx` gère l'auth, le profil courant, l'onglet actif (`tab`) + l'état
d'édition. L'éditeur et `ExerciseProgress` restent des sous-vues plein écran.

### Modèle de données

#### Exercices typés (cœur du changement)

Chaque exercice porte un **type** qui détermine la forme de ses séries :

- `type: "strength"` → `sets: [{ kg, reps, note? }]` (forme actuelle, inchangée).
- `type: "cardio"` → `sets: [{ distance, duration, note? }]`
  - `distance` en km (nombre), `duration` en **secondes**.
  - allure (min/km) et vitesse (km/h) **dérivées**, jamais stockées.
  - une « série » cardio = une portion d'effort (1 pour une course continue,
    plusieurs pour du fractionné/intervalles).

`session.exercises[i]` devient `{ name, type, note?, sets: [...] }`.
**Rétro-compatibilité :** un exercice sans `type` est traité comme `"strength"`
(les 7 séances seed existantes restent valides sans migration de données).

#### Catalogue (`data/catalog.js`)

Réécrit en **liste d'objets** pour porter le type et l'équipement, tout en
gardant un regroupement par groupe musculaire pour le sélecteur :

```js
// chaque exo : { name, group, type, equipment }
// group: Poitrine|Dos|Épaules|Biceps|Triceps|Avant-bras|Jambes|Fessiers|
//        Abdominaux|Mollets|Full body|Cardio|Course
// type: "strength" | "cardio"
// equipment: "machine"|"haltère"|"barre"|"poulie"|"poids du corps"|"cardio"
```

Couverture **complète Basic Fit** (~120–150 exos) : tous les groupes musculaires
avec machines guidées, poulies, haltères, barres et poids du corps + le cardio
(tapis, vélo, vélo assis, elliptique, rameur, stepper, escalier) + **Course**
(course extérieure, manuelle). Helpers dérivés conservés/adaptés :
`EXERCISE_CATALOG` (groupé), `ALL_EXERCISES`, `EXERCISE_CAT` (nom→groupe),
`EXERCISE_TYPE` (nom→type). Ajout d'exos perso : possible à la volée dans le
sélecteur (saisie libre → type au choix), persisté avec la séance.

#### Objectifs (`goals`)

```
goal {
  id, type, label,
  exercise?,        // pour type "lift"/"running" lié à un exo
  target,           // nombre cible (kg, ou kg de poids de corps, ou cm…)
  target_seconds?,  // pour course : temps cible sur une distance
  target_distance?, // pour course : distance de référence (km)
  baseline?,        // valeur de départ (sinon 1re valeur connue)
  pinned,           // booléen → objectif "héros" du dashboard
  created_at
}
type ∈ "lift" | "bodyweight" | "running" | "measurement"
```

Progression calculée à la volée (jamais stockée) :
- **lift** : meilleure charge de travail actuelle sur l'exo vs `target`
  (baseline = 1re charge connue ou `baseline`).
- **bodyweight** : dernier poids de corps vs `target`.
- **running** : meilleur temps sur `target_distance` vs `target_seconds`.
- **measurement** : dernière mensuration vs `target`.
- `% = clamp((courant − baseline) / (target − baseline), 0..1)`.

Un seul objectif `pinned` à la fois = héros du dashboard.

#### Profils (utilisateurs) & métriques corporelles

- `users` (= profils) : `{ id, name, emoji, height_cm, level, rest_seconds
  (défaut 120), reps_threshold (défaut 13), created_at }`. Une ligne par personne.
  Remplace l'idée d'une table `profile` à ligne unique.
- `body_metrics` : `{ id, user_id, date, kind, value }` où `kind ∈ weight, arm_l,
  arm_r, chest, waist, thigh, …`. Poids de corps = `kind:"weight"`. Extensible
  sans changer le schéma.
- `analyses` : `{ id, user_id, date, text, focus[] }` — analyses de Claude
  horodatées, `focus` = tags d'axes à améliorer (ex. `["Dos","Ischios"]`).
- `photos` : `{ id, user_id, date, label, url }` — `url` pointe vers **Vercel Blob**.
- `sessions` et `goals` portent aussi un `user_id`.

**Migration :** `ensureSchema` crée la table `users`, garantit un profil par
défaut, ajoute `user_id` aux tables existantes si absent et rattache les anciennes
lignes (les 7 séances seed) au profil par défaut.

### Backend (`/api`, serverless Vercel)

Neon Postgres (client `@vercel/postgres` existant) + **Vercel Blob**
(`@vercel/blob`) pour les photos. Tout protégé par `requireAuth`.

Tables (créées par `ensureSchema`) : `users`, `sessions`, `goals`,
`body_metrics`, `analyses`, `photos`. `seedIfEmpty` crée le profil par défaut
(Arthur) + ses 7 séances seed.

**Scoping :** `requireAuth` (mot de passe partagé) garde tous les endpoints. Les
endpoints de données lisent l'en-tête `X-User-Id` (profil courant) et filtrent /
insèrent avec ce `user_id` ; absent → 400. Les endpoints `users` sont globaux
(pas de scoping, juste l'auth) car ils alimentent le sélecteur.

Endpoints :
- `GET/POST /api/users`, `GET/PUT/DELETE /api/users/[id]` — profils (identité +
  réglages). DELETE supprime le profil et ses données (cascade).
- `GET/POST /api/sessions`, `PUT/DELETE /api/sessions/[id]` — scoping `X-User-Id`,
  étendus au champ `type`/cardio des exercices.
- `GET/POST /api/goals`, `PUT/DELETE /api/goals/[id]`.
- `GET/POST /api/metrics`, `DELETE /api/metrics/[id]` (poids + mensurations).
- `GET/POST /api/analyses`, `DELETE /api/analyses/[id]`.
- `GET/POST /api/photos`, `DELETE /api/photos/[id]` — POST envoie le fichier vers
  Blob et enregistre l'URL ; DELETE supprime Blob + ligne.

Logique partagée `api/_lib.js` étendue : `ensureSchema` (toutes les tables +
migration `user_id`), `seedIfEmpty`, `requireAuth` (inchangé), `requireUser(req)`
(lit/valide `X-User-Id`).

### Couche cliente

- `src/lib/api.js` — étendu : clients pour goals, profile, metrics, analyses,
  photos (multipart pour l'upload). Gère 401 → login.
- `src/lib/cache.js` — cache de lecture par ressource (`gymlog.cache.sessions`,
  `.goals`, `.profile`, …). Affichage instantané puis refetch.
- `src/lib/metrics.js` — ajouts purs et testables :
  - cardio : `pace(set)` (min/km), `speed(set)` (km/h), `sessionDistance`,
    `bestRun(sessions, distance)`.
  - `goalProgress(goal, {sessions, metrics})` → `{ current, pct, remaining }`.
  - `shouldIncreaseWeight(exercise, threshold)` → bool (toutes les séries de
    travail de la dernière occurrence ≥ seuil).
  - `weightProgression(sessions, name)` → série charge max/travail dans le temps.
  - `bodyweightSeries(metrics)`.
- `src/lib/aiExport.js` — **nouveau** : `buildPreprompt({profile, goals,
  sessions, metrics, analyses})` → chaîne markdown (voir « Export IA »).
- `src/lib/validate.js` — étendu : valide séances avec exos cardio, objectifs,
  métriques à l'import.

### Composants (`src/components/`)

- **Coquille** : `App.jsx` (auth + profil + onglets), `ProfileSelector.jsx`
  (« Qui es-tu ? » + création), `TabBar.jsx`, `Settings.jsx`.
- **Dashboard** : `Dashboard.jsx` (héros objectif, liste objectifs, KPIs, « ça
  progresse » avec nudges reps). Remplace l'usage actuel de `Progress` comme
  écran d'accueil de stats.
- **Séances** : `SessionList.jsx` (ex-`Home` épuré), `SessionEditor.jsx` (étendu
  cardio + timer de repos), `ExercisePicker.jsx` (filtre par type/équipement +
  ajout perso), `ExerciseProgress.jsx` (charge dans le temps, conservé/restylé).
- **Profil** : `Profile.jsx`, `BodyWeightCard.jsx`, `MeasurementsCard.jsx`,
  `PhotosCard.jsx`, `AnalysisCard.jsx`, `GoalsEditor.jsx`.
- **Repos** : `RestTimer.jsx` (barre de compte à rebours + bip/vibration).
- Conservés : `Login.jsx`, `Toast.jsx`.

### Timer de repos (« bip »)

- Dans l'éditeur, valider/ajouter une série **démarre** un compte à rebours
  (durée = `profile.rest_seconds`, défaut 120 s, réglable ±15 s à la volée et
  dans Réglages).
- Barre persistante en bas de l'éditeur : temps restant, pause/reset, +/-.
- À 0 : **bip** (Web Audio `AudioContext` — pas de fichier) + **vibration**
  (`navigator.vibrate`) + toast « À toi pour la série suivante 💪 ».
- Limite assumée : timer **au premier plan** (le navigateur n'exécute pas de
  façon fiable en arrière-plan/écran verrouillé). YAGNI : pas de notification
  push ni de service worker pour la v2.

### Export IA (pré-prompt)

`buildPreprompt` produit un bloc markdown copié dans le presse-papier (bouton
Profil), structuré ainsi :

1. **Contexte** : rôle (« tu es coach sportif »), consigne finale (« propose un
   plan concret pour atteindre les objectifs ci-dessous »).
2. **Profil** : poids de corps actuel + tendance, taille, niveau, dernières
   mensurations, **dernière analyse de Claude** + axes à améliorer.
3. **Objectifs** : chacun avec cible, valeur courante, % et reste à faire.
4. **Règle de progression** explicite : « Quand toutes les séries de travail d'un
   exercice atteignent ≥ {seuil} reps, recommande d'augmenter la charge. » +
   liste des exercices **déjà au-dessus du seuil** (prêts à augmenter).
5. **Historique** : séances récentes (exos, séries kg×reps, et pour le cardio
   distance/temps/allure), + progression de charge par exercice clé.

### Flux de données

1. Montage : pas de mot de passe → `login`. Sinon `checkAuth` ; si OK, afficher
   les caches puis refetch `sessions`, `goals`, `profile`, `metrics`, `analyses`,
   `photos`.
2. CRUD sur n'importe quelle ressource → appel API → maj état + cache.
3. 401 → purge mot de passe → `login`.

## Config & déploiement

- `package.json` : ajouter `@vercel/blob`.
- Variables : `GYM_PASSWORD`, `POSTGRES_URL` (Neon, existant),
  `BLOB_READ_WRITE_TOKEN` (Vercel Blob).
- `.env.example` mis à jour. Dev : `vercel dev`. Prod : intégration Blob ajoutée
  au projet Vercel.

## Tests

- `metrics` : pace/speed, `goalProgress` (4 types), `shouldIncreaseWeight`
  (seuil, séries partielles), `weightProgression`, `bodyweightSeries`,
  rétro-compat exos sans `type`.
- `aiExport` : présence des sections clés, exos au-dessus du seuil listés.
- `validate` : séances cardio, objectifs, métriques (formes correctes/incorrectes).
- `requireAuth` : inchangé (bon/mauvais/absent).
- Build prod (`vite build`) sans erreur.
- Parcours manuel : login → créer séance muscu + course → timer de repos bipe →
  définir objectifs → dashboard montre le héros → ajouter poids de corps + photo
  + analyse au profil → exporter pour l'IA.

## Phasage (pour le plan d'implémentation)

1. **Fondations** : schéma backend (toutes tables) + endpoints + Blob ; catalogue
   complet typé ; design system `S` réécrit ; coquille à onglets.
2. **Cardio** : exos typés dans l'éditeur + sélecteur + métriques pace/speed.
3. **Objectifs** : modèle, CRUD, `goalProgress`.
4. **Dashboard coach** : héros objectif, liste, KPIs, nudges reps.
5. **Profil** : poids de corps, mensurations, analyses, photos (Blob).
6. **Timer de repos** : `RestTimer` + réglages.
7. **Export IA** : `aiExport` + bouton Profil.

## Hors périmètre (YAGNI)

- **Comptes individuels** (identifiant + mot de passe par personne) et vie privée
  entre profils : on s'arrête au sélecteur de profils sous mot de passe commun.
- GPS / cartes / traces pour la course (saisie manuelle uniquement).
- Génération de plan **dans** l'app (c'est l'IA externe via l'export qui le fait).
- Timer en arrière-plan / notifications push / service worker.
- Synchro temps réel multi-appareils au-delà du refetch.
