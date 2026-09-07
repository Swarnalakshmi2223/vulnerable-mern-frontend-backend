const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

// This middleware exists but is NOT applied to every route that needs it —
// see routes/tasks.js. That inconsistency is itself the vulnerability
// (CWE-284/862: missing authorization on some endpoints).
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    // VULN (CWE-347): no algorithm allow-list passed to verify(), so if a
    // future dependency change or misconfig ever allows alg confusion
    // (e.g. "none"), this won't catch it. Always pass { algorithms: ['HS256'] }.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = requireAuth;
