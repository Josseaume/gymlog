# GymLog

Suivi de musculation perso. Front Vite/React + backend serverless Vercel + Postgres.
Données protégées par un mot de passe simple, persistées en base (survivent au nettoyage du navigateur).

## Fonctionnalités
- Accueil : stats (nb séances, volume total), liste des séances, export/import JSON.
- Éditeur de séance : titre, date, durée, notes, exercices et séries (kg × reps), volume calculé.
- Sélecteur d'exercice : recherche + catalogue par groupe musculaire.
- Progression : volume par groupe musculaire, et courbe par exercice (meilleure série, volume par séance).

## Dév local
1. `npm install`
2. Mettre `GYM_PASSWORD` et `POSTGRES_URL` dans `.env.local` (ou utiliser une base Vercel liée).
3. `vercel dev` (nécessite la CLI Vercel ; le front seul tourne avec `npm run dev` mais l'API a besoin de `vercel dev`).

## Déploiement (Vercel)
1. Pousser sur GitHub, importer le repo dans Vercel.
2. Storage → ajouter **Vercel Postgres** (injecte `POSTGRES_URL`).
3. Settings → Environment Variables → ajouter `GYM_PASSWORD`.
4. Déployer. Au premier `GET /api/sessions`, la table est créée et les 7 séances seed insérées.

## Tests
`npm test`
