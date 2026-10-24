const app = require('./app');
const config = require('./config');
const db = require('./db');
const server = app.listen(config.port, () => console.log(`Backend chạy tại http://localhost:${config.port}`));
function shutdown() { server.close(() => { db.close(); process.exit(0); }); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
