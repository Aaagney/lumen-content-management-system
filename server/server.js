const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const spamRoutes = require('./routes/spamRoutes');
const contentRoutes = require('./routes/contentRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', module: 'spam-abuse-detection', time: new Date().toISOString() });
});

// Spam & Abuse Detection API
app.use('/api/spam', spamRoutes);

// Demo content endpoints showing real integration into a create-post/comment flow
app.use('/api/content', contentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Spam & Abuse Detection server running on http://localhost:${config.PORT}`);
});
