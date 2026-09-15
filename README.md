# 🛡️ Web Protector — Real-time URL Threat & Phishing Intelligence

A modern full-stack cybersecurity application that analyzes any URL and returns a phishing/safety risk score, an animated circular risk gauge, an interactive heuristic feature breakdown, and persistent scan history stored in SQLite.

---

## ⚡ Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + CORS
- **Detection Logic**: Deterministic heuristic rule engine (`services/ruleEngine.js`)
- **Database**: SQLite with `better-sqlite3` (zero-config, high-performance WAL mode)

---

## 🎯 Features

- **Instant URL Threat Analysis**: Deep heuristic inspection of protocols, hostnames, keywords, brand impersonation, and obfuscation.
- **Risk Score & Classification**:
  - `0 – 33`: **Safe** (Emerald glow)
  - `34 – 66`: **Suspicious** (Amber glow)
  - `67 – 100`: **Phishing** (Rose / Red glow)
- **Animated Circular Risk Gauge**: Dynamic SVG stroke animation with live confidence percentage.
- **Collapsible Heuristic Breakdown**: Detailed cards showing status, weight, detected values, and point contributions for:
  - Protocol Security (HTTPS vs. plain HTTP)
  - Host Identification (Registered domain vs. raw IP address)
  - URL Length (> 75 characters)
  - Sensitive & Credential Keywords (`login`, `verify`, `banking`, `account`, etc.)
  - Subdomain Nesting Depth (> 3 subdomains)
  - Authentication Obfuscation (`@` symbol deception)
  - Domain Hyphens (Brand impersonation stringing)
  - Encoding & Redirect Obfuscation
- **Persistent Scan History**: Automatically records all scans to SQLite, supports click-to-inspect, search filtering, aggregate threat counters, and deletion.
- **Dark Cybersecurity UI**: Built with an operations center (SOC) aesthetic, subtle gridlines, neon glows, and responsive layouts.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)

### 2. Start Backend Server
From the root directory:
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 3. Start Frontend Dev Server
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` (with `/api` proxy preconfigured).*

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Accepts `{ "url": "https://example.com" }`, executes rule engine, stores and returns scan record |
| `GET` | `/api/history` | Returns list of past scans sorted by newest first |
| `GET` | `/api/history/:id` | Returns details of a specific scan |
| `DELETE` | `/api/history/:id` | Deletes a scan record from the database |
| `DELETE` | `/api/history` | Clears all scan history |
| `GET` | `/api/health` | Service health status |

---

## 🧪 Testing

Run automated API test suite:
```bash
cd backend
npm test
```
