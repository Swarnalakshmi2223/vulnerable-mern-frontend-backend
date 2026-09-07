require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// VULN (CWE-942): CORS wide open with credentials allowed — any origin can
// make authenticated cross-site requests against this API.
app.use(cors({ origin: '*', credentials: true }));

app.use(express.json());

// NOTE: no helmet(), no request logging, no rate limiting anywhere in the
// app (CWE-16: configuration) — left out deliberately.

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// VULN (CWE-209): global error handler returns raw stack traces to the client.
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vulnerable_mern')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('Mongo connection error:', err));
