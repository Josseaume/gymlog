# GymLog — Design (application de suivi de sport, perso)

**Date:** 2026-06-02
**Statut:** Approuvé

## But

Finir GymLog : une app perso de suivi de musculation, utilisée au téléphone à la
salle. Données persistantes via un vrai backend (survivent au nettoyage du
navigateur). Hébergement Vercel. Usage strictement personnel, protégé par un
mot de passe simple.

État actuel : `src/App.jsx` contient seulement les données (`EXERCISE_CATALOG`,
`ALL_EXERCISES`, `SEED_SESSIONS` — 7 séances réelles de janvier 2025) et un objet
de styles `S`. **Aucun composant React, aucun `export default`** → l'app ne rend
rien aujourd'hui. Tout le composant + le backend sont à construire.

## Décisions

- **Périmètre :** app complète (accueil, éditeur de séance, sélecteur
  d'exercice, progression/graphiques, import/export JSON, login).
- **Backend :** fonctions serverless Vercel (`/api`) + Vercel Postgres (Neon).
- **Auth :** mot de passe partagé unique via en-tête `Authorization: Bearer <pwd>`,
  comparé à `process.env.GYM_PASSWORD`.
- **Seed :** les 7 séances existantes chargées dans la base si elle est vide.
- **Édition :** sauvegarde explicite par séance (bouton « Enregistrer »), pas
  d'autosave à chaque frappe.
- **Hors-ligne :** Postgres = source de vérité ; `localStorage` = cache de lecture
  (affichage instantané + tolérance au wifi).

## Architecture

### Front (Vite + React, `src/`)
SPA mobile-first (max 430px, thème sombre, accent lime `#a3e635`, monospace) —
styles déjà fournis par `S`.

Écrans (état `view` dans `App`) :
- **login** — saisie du mot de passe ; mémorisé en `localStorage` ; testé via un
  appel API au montage.
- **home** — stats (nb séances, volume total cumulé, dernière séance), boutons
  « Nouvelle séance » et « Progression », liste des séances (récentes en haut),
  bloc export/import JSON.
- **session** (éditeur) — label, date, durée, notes ; liste d'exercices ; par
  exercice : séries `{kg, reps, note?}` éditables (ajout/suppression), volume
  calculé ; bouton ajouter exercice → sélecteur ; bouton « Enregistrer » ;
  suppression de la séance.
- **picker** — recherche texte + catégories repliables depuis `EXERCISE_CATALOG`.
- **progress** — vue globale : volume total, records (1RM estimé / charge max),
  barres par groupe musculaire ; liste d'exercices → détail.
- **exercise-progress** — pour un exercice : meilleure perf, historique des
  charges/volumes dans le temps (mini-courbe/barres via styles `barWrap`).

Modules utilitaires purs (testables) dans `src/lib/` :
- `metrics.js` — `setVolume`, `exerciseVolume`, `sessionVolume`, `bestSet`,
  `estimate1RM` (Epley), agrégations par groupe musculaire, série temporelle par
  exercice.
- `api.js` — client fetch typé : `listSessions`, `createSession`,
  `updateSession`, `deleteSession`, `checkAuth` ; injecte l'en-tête Bearer ;
  gère erreurs (401 → retour login).
- `cache.js` — lecture/écriture du cache `localStorage` (clé `gymlog.cache`).

### Back (`/api`, fonctions serverless Vercel)
Base Vercel Postgres via `@vercel/postgres`.

Table :
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id         BIGSERIAL PRIMARY KEY,
  label      TEXT NOT NULL,
  date       TEXT,                 -- ISO 'YYYY-MM-DD'
  duration   INTEGER,              -- minutes, nullable
  notes      TEXT DEFAULT '',
  exercises  JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
```
Le JSONB `exercises` colle exactement à la forme actuelle :
`[{ name, note?, sets: [{ kg, reps, note? }] }]`.

Logique partagée `api/_lib.js` :
- `requireAuth(req)` — vérifie `Authorization: Bearer <pwd>` vs `GYM_PASSWORD` ;
  renvoie 401 sinon.
- `ensureSchema()` — crée la table si absente.
- `seedIfEmpty()` — insère les 7 séances seed si la table est vide.

Endpoints :
- `GET  /api/sessions` → `ensureSchema` + `seedIfEmpty` + liste triée par date desc.
- `POST /api/sessions` → crée une séance (body = séance sans id).
- `PUT  /api/sessions/[id]` → remplace les champs d'une séance.
- `DELETE /api/sessions/[id]` → supprime.
Toutes protégées par `requireAuth`.

### Flux de données
1. Montage : si pas de mot de passe en cache → `login`. Sinon `checkAuth` ; si OK,
   afficher le cache immédiatement puis `GET /api/sessions` et remplacer.
2. Création/édition/suppression → appel API → sur succès, maj de l'état + cache.
3. 401 à tout moment → purge le mot de passe et retour `login`.

### Import / Export
- **Export** : sérialise toutes les séances en JSON, copie presse-papier +
  téléchargement fichier.
- **Import** : zone de texte JSON → validation de forme → remplace/merge via API
  (POST en boucle). Erreurs affichées dans `errorBox`.

## Config & déploiement
- `package.json` : ajouter `@vercel/postgres`.
- `vercel.json` : preset Vite + fonctions `/api` (zero-config sinon).
- `.env.example` : `GYM_PASSWORD=...` (et `POSTGRES_URL` injecté par Vercel).
- Dev local : `vercel dev`. Prod : connecter le repo à Vercel, ajouter
  l'intégration Postgres, définir `GYM_PASSWORD`.

## Tests
- Unitaires sur `src/lib/metrics.js` (volumes, 1RM, agrégations, série temporelle)
  et sur `requireAuth` (bon/mauvais mot de passe, en-tête manquant).
- Validation d'import JSON (forme correcte / incorrecte).
- Build de prod (`vite build`) sans erreur.
- Vérification manuelle du parcours : login → créer séance → ajouter exercices →
  enregistrer → voir progression → export/import.

## Hors périmètre (YAGNI)
- Multi-utilisateurs / comptes.
- Programmes/coaching automatique (les styles `planTip`/`focusBanner` existent
  mais ne sont pas câblés à de la génération de programme — réservé à plus tard).
- Synchronisation temps réel multi-appareils au-delà du simple refetch.
