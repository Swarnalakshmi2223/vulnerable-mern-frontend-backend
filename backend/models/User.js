const mongoose = require('mongoose');

// VULN (CWE-256): password is stored and compared as plaintext.
// A real schema should never store the raw password — only a bcrypt/argon2 hash.
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plaintext on purpose — see VULNERABILITIES.md #2
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
