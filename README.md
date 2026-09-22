# Spam & Abuse Detection Module

A **standalone**, self-contained Spam & Abuse Detection system for an Admin
Content Management System. Built to be dropped into a larger CMS later —
it does not depend on any existing project.

- **Frontend:** React + Vite + JavaScript, React Router, Axios, plain CSS
  (dark navy admin UI matching the reference CMS dashboard screenshot)
- **Backend:** Node.js + Express + JavaScript
- **Persistence:** simple JSON files (no database) — `server/data/*.json`
- **Detection:** deterministic, lightweight algorithms only — no external
  AI APIs. Text normalization + Jaccard similarity, URL analysis, activity
  frequency tracking, and a configurable weighted risk score.

## Project Structure

```
spam-abuse-detection/
  client/                 # React + Vite frontend
    src/
      components/         # Sidebar, Badge, StatCard, Toast, DetectionDetailModal, SimulatorPanel
      pages/               # DashboardPage, SpamAbusePage, PlaceholderPage
      services/api.js     # Axios client
      App.jsx, main.jsx, styles.css
  server/                  # Express backend
    controllers/spamController.js
    services/              # detectionService, restrictionService, auditService, activityService, statsService
    routes/                # spamRoutes.js (admin API), contentRoutes.js (demo post/comment integration)
    middleware/            # adminAuth.js (stub), errorHandler.js
    utils/                 # jsonStore.js, textSimilarity.js, urlAnalysis.js, seed.js
    data/                  # detections.json, restrictions.json, audit.json, contentLog.json, users.json
    config.js              # all thresholds/weights in one place
    server.js
  README.md
```

## Install

```bash
# Backend
cd server
npm install

# Frontend (in a separate terminal)
cd client
npm install
```

## Seed demo data

The backend auto-creates empty JSON files on first run, but for a
populated dashboard on first look, run the seed script once:

```bash
cd server
npm run seed
```

This writes 5 demo detections (LOW/MEDIUM/HIGH mix), 2 restrictions
(one active, one expired), and matching audit log entries.

## Run

```bash
# Terminal 1 — backend (http://localhost:5050)
cd server
npm start          # or: npm run dev  (nodemon, auto-restart)

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies `/api/*`
requests to the backend on port 5050 (see `client/vite.config.js`), so no
CORS setup is needed in development. The backend also has `cors()` enabled
for any other setup.

Go to the **Spam & Abuse** item in the sidebar (or the "Open Spam & Abuse
Detection" button on the Dashboard) to reach the module.

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/spam/analyze` | Run detection on a piece of content directly (not admin-gated — this is the integration point) |
| GET | `/api/spam/detections` | List detections. Supports `search`, `riskLevel`, `contentType`, `status`, `from`, `to`, `page`, `pageSize` |
| GET | `/api/spam/detections/:id` | Full detail for one detection, including audit history |
| POST | `/api/spam/detections/:id/action` | Admin action: `{ action: "ALLOW"\|"BLOCK"\|"WARN"\|"RESTRICT", reason, adminId }` |
| GET | `/api/spam/stats` | Dashboard stat cards |
| GET | `/api/spam/users/:userId/activity` | Full activity view for a user (detections, content history, restriction history) |
| POST | `/api/spam/users/:userId/restrict` | Manually restrict a user |
| POST | `/api/spam/users/:userId/unrestrict` | Remove a user's active restriction(s) |
| GET | `/api/spam/audit` | Audit log, filterable by `userId` / `detectionId` |
| POST | `/api/content/posts` | **Demo integration** — simulates a CMS "create post" endpoint wired through the detector |
| POST | `/api/content/comments` | Same, for comments |

All `/api/spam/*` routes except `/analyze` expect an `x-admin-id` header
(the stub admin-auth middleware in `middleware/adminAuth.js` — swap this
for your real auth when integrating into a CMS).

## How Detection & Scoring Works

1. **Text normalization** strips URLs/punctuation/case, then content is
   compared to the user's recent history using **Jaccard similarity** on
   word-token sets (≥ 80% similarity = near-duplicate; exact-match after
   normalization = exact duplicate).
2. **Activity tracking** counts how much a user has posted/commented in a
   rolling time window (default: 5 items / 10 minutes) and whether the
   exact same content was repeated within the last hour.
3. **URL analysis** flags shortened-URL services (bit.ly, tinyurl, etc.),
   IP-address hosts, and obfuscation patterns (userinfo tricks, excess
   subdomains, suspicious TLDs) — and separately flags an unusually high
   link count. A single ordinary external link is never treated as spam.
4. **Promotional keyword matching** is a simple substring check against a
   configurable keyword list.
5. **Risk score** sums weighted points per signal (see `server/config.js`
   for every weight and threshold), clamped to 0–100:
   - 0–29 → **LOW** → `ALLOW`
   - 30–59 → **MEDIUM** → `FLAG` (goes to admin review, content still visible)
   - 60–100 → **HIGH** → `BLOCK` (content held, moderation record created)
   - No single weak signal can reach HIGH alone (max single weight is 30).
6. **Repeated HIGH-risk behavior** (3+ HIGH detections within 24h) triggers
   an **automatic temporary restriction** (default 24h). Restrictions are
   never permanent bans — admins can remove them any time.
7. Every automatic and manual action is written to the **audit log**.

## Real Integration (not a disconnected demo)

`server/routes/contentRoutes.js` shows the exact flow a real CMS should
use around this module:

```
user submits content
  → restrictionService.isUserRestricted(userId)   (403 if true)
  → detectionService.analyzeContent(...)          (runs full detection)
  → act on detection.action: ALLOW / FLAG / BLOCK
  → content is only actually "saved" if not blocked
```

When wiring this into a real CMS, replace the in-memory "save" step in
`contentRoutes.js` with your actual database write, keeping the same
before/after flow.

## Testing / Demo Scenarios

With both servers running, use the **"Test the Detector"** panel on the
Spam & Abuse page (has one-click presets), or curl directly:

```bash
# 1. Normal post -> LOW -> ALLOW
curl -X POST http://localhost:5050/api/content/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":"u-100","userName":"Test User","text":"Had a great hike this weekend."}'

# 2. Same content twice -> 2nd one flags as duplicate/repeated (MEDIUM/HIGH)
curl -X POST http://localhost:5050/api/content/posts -H "Content-Type: application/json" \
  -d '{"userId":"u-200","userName":"Dup","text":"Check out my amazing product deal today"}'
curl -X POST http://localhost:5050/api/content/posts -H "Content-Type: application/json" \
  -d '{"userId":"u-200","userName":"Dup","text":"Check out my amazing product deal today"}'

# 3. Excessive comments -> 6th+ within 10 min flags excessiveActivity
for i in 1 2 3 4 5 6; do
  curl -X POST http://localhost:5050/api/content/comments -H "Content-Type: application/json" \
    -d "{\"userId\":\"u-300\",\"userName\":\"Rapid\",\"text\":\"comment $i unique text\"}"
done

# 4. Suspicious/multiple links -> HIGH -> BLOCK
curl -X POST http://localhost:5050/api/content/posts -H "Content-Type: application/json" \
  -d '{"userId":"u-400","userName":"Linker","text":"Visit http://bit.ly/a http://192.168.1.5/x http://tinyurl.com/y now"}'

# 5. Manually restrict + verify blocked
curl -X POST http://localhost:5050/api/spam/users/u-500/restrict -H "Content-Type: application/json" \
  -H "x-admin-id: admin" -d '{"reason":"test"}'
curl -X POST http://localhost:5050/api/content/posts -H "Content-Type: application/json" \
  -d '{"userId":"u-500","userName":"Restricted","text":"trying to post"}'
# -> 403 with restriction details

# 6. View audit trail
curl "http://localhost:5050/api/spam/audit?userId=u-500" -H "x-admin-id: admin"
```

All of these were run and verified during development (see the delivery
report for the exact results). In the admin UI: use the filters (search,
risk level, content type, status, date), click any row to open the detail
modal, and use Allow / Warn / Block / Restrict / Remove Restriction from
there.

## Notes for Future Integration into the Larger CMS

- Swap `middleware/adminAuth.js` for the CMS's real auth/role middleware —
  everything downstream only needs `req.adminId` to exist.
- Swap the JSON file store (`utils/jsonStore.js`) for real database calls
  if/when the CMS has a shared database; the service layer (`detectionService`,
  `restrictionService`, etc.) is already isolated behind simple async
  functions, so this is a drop-in replacement.
- Replace the "save" step inside `contentRoutes.js` with the CMS's actual
  post/comment creation logic — the detection call and restriction check
  around it can be copied as-is.
- All thresholds and scoring weights live in `server/config.js` — no
  magic numbers are scattered through the detection logic.
