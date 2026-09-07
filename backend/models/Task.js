const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // VULN (CWE-79): description is rendered on the client with
  // dangerouslySetInnerHTML and never sanitized here or on output — stored XSS.
  description: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Task', TaskSchema);
