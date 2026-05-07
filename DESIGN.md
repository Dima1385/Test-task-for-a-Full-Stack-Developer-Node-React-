# Design

## User scenarios

**Scenario A — WebSocket**

User picks an option on screen 1, enters a number on screen 2, then hits "WebSocket" on screen 3.
A `POST /jobs` fires, the server creates a DB record (`status: queued`) and immediately kicks off the pipeline in the background. The client opens a WS connection scoped to that job id. As each pipeline step runs, the server broadcasts `progress` events; the UI updates the ring progress in real time. On `done` the ring hits 100 % and the result appears. "Reset" clears everything and sends the user back to screen 1.

**Scenario B — HTTP polling**

Same first two screens. On screen 3 the user hits "HTTP Polling". Same `POST /jobs`, same server-side pipeline. The client polls `GET /jobs/:id` every second and drives an indeterminate bar — no percentage shown because 1 s resolution makes any precise number look janky. When the poll returns `done`, polling stops and the result is shown.

---

## How job processing works

```
POST /jobs
  └─ insert row  { status: queued,      progress: 0   }
  └─ return { id }
  └─ _processPipeline(id)  ← fire-and-forget (no await)

_processPipeline
  ├─ update  { status: processing }
  ├─ step 1 — validate   0 → 33 %   (1.2 s delay)
  ├─ step 2 — transform  33 → 66 %  (1.4 s delay)
  └─ step 3 — finalize   66 → 100 % (1.0 s delay)
  └─ update  { status: done, progress: 100, result: {...} }

After each progress tick:
  update DB row  →  broadcast to all WS clients subscribed to this jobId
```

`GET /jobs/:id` reads the current DB row directly — no in-memory cache, no race conditions.

---

## Status delivery

| | WebSocket | HTTP polling |
|---|---|---|
| Trigger | server push | client pull (1 s) |
| Progress bar | circular ring with % | indeterminate (no %) |
| Payload | `{ event, jobId, progress, result? }` | full job row from DB |

---

## Flow diagram

```
Browser                         Express                     SQLite
  │                                │                            │
  │── POST /jobs ──────────────────▶│                            │
  │                                │─── INSERT (queued) ────────▶│
  │◀── { id, status: "queued" } ───│                            │
  │                                │                            │
  │   ┌── [WebSocket path] ─────────────────────────────────┐   │
  │   │── WS connect ?jobId=<id> ──▶│                        │   │
  │   │                            │─ step1 ─ UPDATE ────────────▶│
  │   │◀── { event: "progress" } ──│                        │   │
  │   │                            │─ step2 ─ UPDATE ────────────▶│
  │   │◀── { event: "progress" } ──│                        │   │
  │   │                            │─ step3 ─ UPDATE ────────────▶│
  │   │◀── { event: "done" } ──────│                        │   │
  │   └────────────────────────────────────────────────────────┘   │
  │                                │                            │
  │   ┌── [HTTP polling path] ──────────────────────────────┐   │
  │   │── GET /jobs/:id ───────────▶│                        │   │
  │   │                            │─── SELECT ─────────────────▶│
  │   │◀── { status, progress } ───│◀── row ────────────────────│
  │   │   (repeat every 1 s)       │                        │   │
  │   └────────────────────────────────────────────────────────┘   │
```
