
# Movie Review Platform (Starter)

This is a starter scaffold for the Movie Review Platform assignment.
It includes a React frontend (Vite), an Express backend prepared for Firebase Functions,
and basic Firestore integration scaffolding.

## What is included
- Frontend: `src/` with routes and components
- Backend: `functions/` Express app for reviews
- `firebase.json` for hosting + rewrites to functions
- `.gitignore`

## Quick notes
- Add your Firebase config values to `.env` (Vite uses `VITE_` prefixed vars).
- Replace `VITE_TMDB_API_KEY` with your TMDB API key.
- To deploy: install Firebase CLI, run `firebase init` (Hosting + Functions), then `firebase deploy`.

