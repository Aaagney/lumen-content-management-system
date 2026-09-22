// Centralized error handler — never leaks stack traces to the client.
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[spam-abuse] Unhandled error:', err);
  }
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message || 'Request failed'
  });
}

module.exports = { notFoundHandler, errorHandler };
