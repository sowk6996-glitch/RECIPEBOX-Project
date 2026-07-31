Render deployment notes

- Ensure the service uses the repo root as the build context (default). The backend Dockerfile now copies from `backend/` paths so CI can build from repo root.
- In Render Dashboard for the backend service set the Dockerfile path to `backend/Dockerfile` (already in `render.yaml`).
- Add the following environment variables in the Render service settings (do NOT commit secrets to git):
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `PORT` (optional — Render sets a port automatically; app falls back to `process.env.PORT`)
- Trigger a manual deploy in Render after setting env vars.
- If you prefer to use a custom build context, set Build Context to `backend` in Render and keep the original Dockerfile.

If the build still fails, paste the Render build log here and I'll diagnose further.