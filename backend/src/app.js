const express = require('express');
const cors = require('cors');
const { identity, requestLogger, errorHandler, notFound } = require('./middlewares');
const app = express();
app.disable('x-powered-by');
// Include preflight and JSON parsing errors in identity headers and request logs.
app.use(identity);
app.use(requestLogger);
app.use(cors({ exposedHeaders: ['Content-Disposition', 'X-Student-Id'] }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/lop', require('./routes/classes'));
app.use('/api/sinh-vien', require('./routes/students'));
app.use(notFound);
app.use(errorHandler);
module.exports = app;
