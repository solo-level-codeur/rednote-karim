require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const tagRoutes = require('./routes/tagRoutes');
const shareRoutes = require('./routes/shareRoutes');
const commentRoutes = require('./routes/commentRoutes');
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

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // URLs du frontend possibles
  credentials: true // Permettre l'envoi des cookies
}));
app.use(bodyParser.json());
app.use(cookieParser());

// API routes
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/comments', commentRoutes);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
