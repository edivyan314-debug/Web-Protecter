# Web Protector — Project Specification

A full-stack web app that analyzes any URL and returns a phishing/safety risk score, with a visual risk meter, feature breakdown, and scan history.

---

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS + Lucide Icons | Modern, fast, beautiful UI |
| Backend | Node.js + Express | Pure npm ecosystem |
| AI / Detection | Hybrid (Rules + Lightweight ML) | Easy to implement in JavaScript |
| Database | SQLite (better-sqlite3) or MongoDB Atlas (free tier) | Simple for a mini project |
| Optional AI | TensorFlow.js or Brain.js | Pure JS ML, no external services needed |

---

## 2. Core Features

- **Paste any URL → Instant analysis**
- **Risk Score** — classified as Safe / Suspicious / Phishing, with a confidence percentage
- **Feature breakdown**, including:
  - URL length
  - HTTPS presence/absence
  - Use of raw IP address instead of domain
  - Suspicious keywords (e.g. "login", "verify", "secure", "update")
  - Subdomain count
  - Presence of `@`, `-`, or excessive special characters
  - Domain age / WHOIS lookup (optional, stretch goal)
- **Visual risk meter / progress bar**
- **Scan history** (persisted per session or per user)
- **Dark cybersecurity theme UI**

---

## 3. Project Structure

```
web-protecter/
├── frontend/                 # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlInput.jsx
│   │   │   ├── RiskMeter.jsx
│   │   │   ├── FeatureBreakdown.jsx
│   │   │   └── ScanHistory.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/                  # Node + Express
│   ├── routes/
│   │   └── analyze.js
│   ├── services/              # detection logic
│   │   ├── ruleEngine.js
│   │   └── mlModel.js
│   ├── models/                 # (optional, DB schemas)
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 4. Detection Logic (Backend)

The `services/ruleEngine.js` module should score a URL using a weighted set of rules, e.g.:

| Feature | Signal | Weight |
|---|---|---|
| No HTTPS | Increases risk | Medium |
| IP address instead of domain | Increases risk | High |
| URL length > 75 chars | Increases risk | Low |
| Suspicious keywords present | Increases risk | Medium |
| Subdomain count > 3 | Increases risk | Medium |
| `@` symbol in URL | Increases risk | High |
| Excessive hyphens in domain | Increases risk | Low |

Combine rule-based scores into a 0–100 risk percentage, then map to:
- **0–33:** Safe
- **34–66:** Suspicious
- **67–100:** Phishing

The optional `mlModel.js` can layer a lightweight classifier (TensorFlow.js / Brain.js) trained on a small labeled URL dataset to refine or replace the rule-based score.

---

## 5. API Endpoints (suggested)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Accepts `{ url }`, returns risk score + feature breakdown |
| `GET` | `/api/history` | Returns past scans |
| `DELETE` | `/api/history/:id` | Removes a scan from history |

---

## 6. UI Requirements

- Dark, cybersecurity-inspired theme (deep blues/blacks, neon accent color for alerts)
- Prominent URL input bar as the primary interaction point
- Animated risk meter (progress bar or radial gauge) that fills based on score
- Color-coded result: green (Safe), yellow/orange (Suspicious), red (Phishing)
- Collapsible feature breakdown panel showing each signal and its contribution
- Scrollable scan history list with timestamp, URL, and result badge

---

## 7. Build Notes for Antigravity

- Scaffold `frontend/` with Vite + React + Tailwind first; confirm dev server runs on localhost before wiring the backend.
- Scaffold `backend/` with Express, add CORS for local frontend-backend communication.
- Implement `ruleEngine.js` first (deterministic, no ML dependency) so the app is fully functional end-to-end before adding the optional ML layer.
- Use SQLite via `better-sqlite3` for zero-config local persistence unless MongoDB Atlas is preferred for cloud sync.
- Keep the ML layer (TensorFlow.js/Brain.js) behind a feature flag so it can be toggled on/off without breaking the core rule-based flow.

---

## 8. Execution Progress Checklist

- [x] **Step 1: Setup Frontend** (Scaffold `frontend/` with Vite, React, Tailwind, and Lucide)
- [x] **Step 2: Setup Backend** (Scaffold `backend/` with Express, CORS, and SQLite)
- [x] **Step 3: Implement Logic** (Build `services/ruleEngine.js` deterministic scoring & breakdown)
- [x] **Step 4: Create Endpoints** (`POST /api/analyze`, `GET /api/history`, `DELETE /api/history/:id`)
- [x] **Step 5: Build UI** (Dark cyber theme, animated gauge, feature breakdown, scan history)
- [x] **Step 6: Version Control** (Initialize git, commit "Initial commit: Web Protector scaffolding")

