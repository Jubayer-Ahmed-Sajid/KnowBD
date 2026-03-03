/**
 * Global error-handler middleware.
 *
 * Normalises Mongoose / JWT / Node errors into a consistent JSON shape:
 *   { success: false, error: <message>, stack?: <dev only> }
 *
 * Mount this AFTER all route handlers:
 *   app.use(errorHandler);
 */
const errorHandler = (err, _req, res, _next) => {
  // Clone so we don't mutate the original
  let error = { ...err, message: err.message };

  // Log for devs
  if (process.env.NODE_ENV === 'development') {
    console.error('\x1b[31m%s\x1b[0m', err.stack || err);
  }

  // ── Mongoose bad ObjectId ─────────────────────────────────
  if (err.name === 'CastError') {
    error.message = `Resource not found (invalid id: ${err.value})`;
    error.statusCode = 404;
  }

  // ── Mongoose duplicate key (code 11000) ───────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error.message = `Duplicate value for field: ${field}`;
    error.statusCode = 400;
  }

  // ── Mongoose validation errors ────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error.message = messages.join('. ');
    error.statusCode = 400;
  }

  // ── JWT errors ────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token — authorisation denied';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired — please log in again';
    error.statusCode = 401;
  }

  // ── Send response ────────────────────────────────────────
  const statusCode = error.statusCode || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
