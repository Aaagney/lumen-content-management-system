const express = require('express');
const cors = require('cors');
require('dotenv').config();
const articleRoutes = require('./routes/articleRoutes');

const app = express();

// 1. MUST BE FIRST: Enable CORS specifically for your React app
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 2. Parse JSON request bodies
app.use(express.json());

// 3. Define routes AFTER middleware
app.use('/api/articles', articleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));