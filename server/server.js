const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const contentRoutes = require('./routes/contentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/content', contentRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CMS Module Backend API Server is running.'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Requested API endpoint not found.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});