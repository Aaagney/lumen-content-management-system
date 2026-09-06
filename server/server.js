const express = require('express');
const cors = require('cors');
require('dotenv').config();

const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// 1. Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 2. Parse JSON request bodies
app.use(express.json());

// 3. Define routes
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});