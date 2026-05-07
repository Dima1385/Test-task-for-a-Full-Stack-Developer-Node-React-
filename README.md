# Job Processor

Node.js + React app that demonstrates real-time job processing via WebSocket and HTTP polling.

**GitHub:** https://github.com/Dima1385/Test-task-for-a-Full-Stack-Developer-Node-React-  
**Live demo:** https://job-processor-21287.web.app  
**Backend API:** https://test-task-for-a-full-stack-developer.onrender.com

> **Part 0 (design)** — user scenarios, flow diagram, and architecture rationale are in [`DESIGN.md`](./DESIGN.md).

## Running locally

**Backend** (port 4000)
```bash
cd backend
npm install
npm run dev
```

**Frontend** (port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## Stack

- **Backend** — Express, `ws`, `better-sqlite3`
- **Frontend** — React 18, Vite
- **DB** — SQLite (file `backend/data/jobs.db`, created automatically)

---

## API

```
POST /jobs        { option, value }   → creates job, starts pipeline async
GET  /jobs/:id                        → current job state from DB
WS   /?jobId=:id                      → subscribe to real-time job events
```

WebSocket message shape:
```json
{ "event": "progress", "jobId": "...", "progress": 66 }
{ "event": "done",     "jobId": "...", "progress": 100, "result": { ... } }
```

---

## Project layout

```
backend/src/
  index.js          — server entry (HTTP + WS on same port)
  app.js            — Express setup
  websocket.js      — WS server, Map<jobId, Set<ws>> subscriptions
  db/database.js    — SQLite helpers (insert / get / update)
  api/jobs.router.js
  jobs/job.service.js
  pipeline/
    pipeline.js     — ordered STEPS array, easy to extend
    step1.validate.js
    step2.transform.js
    step3.finalize.js

frontend/src/
  App.jsx           — step router (1 → 2 → 3 → reset)
  components/       — Screen1, Screen2, Screen3, CircularProgress, ...
  hooks/
    useWebSocketJob.js   — WS transport
    usePollingJob.js     — polling + RAF interpolation
  services/api.js   — fetch wrappers
```

---

## Adding a pipeline step

1. Create `backend/src/pipeline/stepN.name.js`, export an async function `(context) => context`.
2. Add it to the `STEPS` array in `pipeline.js` with `progressStart` / `progressEnd`.

That's it.

---

## Deployment

### Backend → Render

1. Push the repo to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service** → connect the repo.
3. Render will pick up `render.yaml` automatically.
4. After deploy, copy the service URL (e.g. `https://job-processor-backend.onrender.com`).

> Free tier note: the Disk addon requires a paid plan. On the free tier SQLite data resets on restart — fine for a demo.

### Frontend → Firebase Hosting

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Create a project at console.firebase.google.com, then set it here
#    Project ID: job-processor-21287 (already set in .firebaserc)

# 4. Build with the real backend URL
echo "VITE_API_URL=https://your-backend.onrender.com" > frontend/.env.production
cd frontend && npm run build && cd ..

# 5. Deploy
firebase deploy --only hosting
```

---

## Architecture notes

**Single port for HTTP and WS.** `http.createServer(app)` is passed to both Express and `WebSocketServer` — avoids the CORS issues that come with running them on separate ports.

**SQLite over Postgres/Mongo.** No external service to spin up. `better-sqlite3` is synchronous, which keeps the DB layer dead simple. Perfectly adequate for a single-process job runner.

**Pipeline is just an array.** No factory, no DI. Each step is a plain async function that receives a context object and returns it (or throws). To add a step, you add a file and one line. That's the whole extensibility story.

**Two transport modes share one job model.** Both WS (`useWebSocketJob`) and polling (`usePollingJob`) talk to the same `POST /jobs` endpoint. The hooks expose an identical interface `{ status, progress, result, start, reset }` — Screen3 doesn't care which transport is active.

**HTTP mode shows an indeterminate bar.** Polling at 1 s intervals would make a determinate bar jump visibly. An indeterminate animation is more honest: it signals "something is happening" without implying accuracy we don't have.
