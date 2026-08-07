const multer = require('multer');
const HttpError = require('../utils/httpError');

const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large. Maximum size is 5MB.'
      : err.message;
    return res.status(400).json({ error: message });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    error: status >= 500 ? 'Internal server error.' : err.message
  });
};

module.exports = { notFound, errorHandler };
