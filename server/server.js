const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Root Route Check
app.get('/', (req, res) => {
  res.send('CMS Personal Chat Module API Server Running.');
});

// Express error handler for malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload format. Please check your request body.'
    });
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api/chat`);
  console.log(`=================================`);
});