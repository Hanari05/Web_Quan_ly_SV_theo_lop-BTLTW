const { studentId } = require('../config');
function identity(req, res, next) { res.setHeader('X-Student-Id', studentId); next(); }
function requestLogger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    if (process.env.NODE_ENV !== 'test') console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
}
function notFound(req, res) { res.status(404).json({ error: 'Không tìm thấy đường dẫn.', details: [] }); }
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  // node:sqlite exposes SQLite's extended numeric error code.
  if (error.code === 'ERR_SQLITE_ERROR' && error.errcode === 2067) {
    const isClass = error.message.includes('lop.maLop');
    const message = isClass ? 'Mã lớp đã tồn tại.' : 'MSSV hoặc email đã tồn tại.';
    const fields = isClass ? ['maLop'] : ['mssv', 'email'];
    return res.status(409).json({ error: message, details: fields.map(field => ({ field, message })) });
  }
  if (error.code === 'ERR_SQLITE_ERROR' && error.errcode === 787) {
    return res.status(409).json({ error: 'Dữ liệu đang được tham chiếu hoặc lớp không còn tồn tại.', details: [] });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  const message = error.type === 'entity.parse.failed' ? 'Nội dung JSON không hợp lệ.'
    : status >= 500 ? 'Lỗi máy chủ. Vui lòng thử lại.' : error.message;
  res.status(status).json({ error: message, details: error.details || [] });
}
module.exports = { identity, requestLogger, notFound, errorHandler };
