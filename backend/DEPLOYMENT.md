# Heart Sync Backend — Production Deployment Guide

This guide documents the requirements and steps for deploying the Heart Sync Express API to production cloud hosting platforms (e.g. Render, Railway, AWS ECS/App Runner, Heroku, or a dedicated Linux VPS).

---

## 1. Runtime & Environment Requirements

| Requirement | Specification |
| :--- | :--- |
| **Runtime** | Node.js `>= 18.0.0` (LTS recommended) |
| **Package Manager** | npm `>= 9.0.0` |
| **Architecture** | Stateless JSON REST API |
| **Persistent Disk** | **Not Required** (all clinical data, users, and audit logs reside in MongoDB) |

---

## 2. Install & Start Commands

When configuring your hosting platform build and run settings:

- **Root Directory:** `backend` (if deploying from a monorepo)
- **Install Command:**
  ```bash
  npm ci --omit=dev
  # or
  npm install --omit=dev
  ```
- **Start Command:**
  ```bash
  npm start
  ```
  *(Executes `node server.js` as defined in `package.json`).*

---

## 3. Required Production Environment Variables

Configure the following environment variables in your hosting provider's dashboard (e.g., Render Environment Settings, Railway Variables, or AWS Parameter Store).

> ⚠️ **CRITICAL SECURITY RULE:** Never commit real secrets or production `.env` files to Git.

| Variable Name | Required | Description / Example Format |
| :--- | :---: | :--- |
| `NODE_ENV` | **Yes** | Set to `production`. Enables strict CORS, proxy IP trust, error masking, and disables default secrets. |
| `PORT` | **Yes** | Port for the Express HTTP server (typically injected automatically by Render/Railway/Heroku, defaults to `5000`). |
| `MONGODB_URI` | **Yes** | Full MongoDB Atlas connection URI with database name, e.g.: `mongodb+srv://<user>:<password>@cluster.example.mongodb.net/heart_sync?retryWrites=true&w=majority`. |
| `JWT_SECRET` | **Yes** | 64+ character cryptographically random key used for signing and verifying tokens. Generate via: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. Server will refuse to start if missing or default. |
| `FRONTEND_URL` | **Yes** | Single production domain or comma-separated list of approved frontend origins for CORS, e.g.: `https://heartsync.org,https://admin.heartsync.org`. No trailing slash. |

*(Note: `MONGO_URI` is also accepted as a fallback alias for `MONGODB_URI`).*

---

## 4. Health Check Endpoints

Configure your cloud platform's health check monitor / probes to:

- **Endpoint:** `GET /api/health`
- **Expected Status:** `HTTP 200`
- **Response Format:**
  ```json
  {
    "status": "healthy",
    "service": "Heart Sync Enterprise Blood Bank & Hospital Coordination Platform",
    "timestamp": "2026-11-14T...",
    "environment": "production"
  }
  ```
- **Root Fallback:** `GET /` returns `HTTP 200` (`Heart Sync Enterprise API Running ✅`).

Both endpoints are lightweight, unauthenticated, and do not leak database credentials, stack traces, or internal server paths.

---

## 5. Security Architecture Notes

1. **Reverse Proxy Trust:** When `NODE_ENV === "production"`, Express automatically sets `trust proxy: 1` so rate limiters track real client IPs behind cloud reverse proxies and load balancers.
2. **CORS Isolation:** In production, localhost origins (`localhost:5173`, etc.) are stripped. Only origins explicitly listed in `FRONTEND_URL` are granted access.
3. **Payload Protection:** JSON request bodies are limited to `15kb` to prevent Denial-of-Service (DoS) memory consumption attacks.
4. **Data Protection Guard:** Database seeding (`npm run seed`) contains an automated guard that unconditionally refuses to run when `NODE_ENV === "production"` to prevent accidental loss of live records.
