const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// VULN (CWE-798 style / hardcoded fallback): if JWT_SECRET is missing,
// this silently falls back to a guessable default instead of failing loudly.
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

// Register — stores password in plaintext (see models/User.js)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    res.status(201).json({ message: 'User created', user }); // VULN (CWE-200): leaks full user doc, password included
  } catch (err) {
    // VULN (CWE-209): raw error/stack sent to client, leaks internals
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Login — classic NoSQL injection point
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // VULN (CWE-943): username/password are passed straight into the Mongo
  // query with no type-checking or sanitization. An attacker can send
  // { "username": "admin", "password": { "$ne": null } } as JSON and bypass
  // the password check entirely, because Mongo interprets $ne as an operator.
  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // VULN (CWE-613): token has no expiry (`expiresIn` omitted), so a stolen
  // token is valid forever.
  const token = jwt.sign(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    JWT_SECRET
  );

  res.json({ token, user }); // also leaks password field again
});

// NOTE: there is deliberately no rate limiting / login-attempt throttling
// on this router (CWE-307) — brute force is unrestricted.

module.exports = router;
