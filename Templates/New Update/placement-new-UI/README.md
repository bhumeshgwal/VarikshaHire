# VrikshaHire

VrikshaHire is a campus placement portal with a Node.js/Express backend and a React frontend.

## Project structure

- `backend/` — Express API, Mongo models, auth, and server logic
- `frontend/` — Vite React client app
- `README.md` — local run instructions

## Run locally

1. Create a backend environment file:

   ```env
   MONGO_URI=your-mongodb-connection-string
   JWTsec=your-long-random-jwt-secret
   ADMIN_EMAIL=your-admin-email
   ADMIN_PASSWORD=your-admin-password
   GEMINI_API_KEY=your-google-ai-key
   ```

   Put this in `backend/.env` and keep it private.

2. Start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

3. In a second terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. Open the frontend URL shown by Vite, usually `http://localhost:5173`.

## Features

- Students can register, sign in, browse jobs, apply when eligible, and review their application status.
- The admin portal manages company approvals, job approvals, and placement overview data.
- The AI career assistant is served by the backend and uses the `GEMINI_API_KEY` when configured.
- MongoDB stores students, companies, applications, notices, and job data.
