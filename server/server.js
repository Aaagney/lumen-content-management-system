const express = require('express');
const cors = require('cors');
require('dotenv').config();
const articleRoutes = require('./routes/articleRoutes');
const searchRoutes = require('./routes/searchRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const appealRoutes = require('./routes/appealRoutes');

const app = express();

// 1. MUST BE FIRST: Enable CORS specifically for your React app
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// 2. Parse JSON request bodies
app.use(express.json());

// 3. Define routes AFTER middleware
app.use('/api/articles', articleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appeals', appealRoutes);

const PORT = process.env.PORT || 5000;

console.log("PORT VALUE:", PORT);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`SERVER LISTENING ON http://127.0.0.1:${PORT}`);
});