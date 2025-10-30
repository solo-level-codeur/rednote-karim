require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const noteRoutes = require('./routes/noteRoutes');
const pool = require('./config/db');

// Test database connection
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/notes', noteRoutes);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
