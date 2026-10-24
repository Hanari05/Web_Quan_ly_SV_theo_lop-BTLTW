const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
module.exports = {
  port: Number(process.env.PORT || 5007),
  databaseFile: process.env.DATABASE_FILE || './data/students.db',
  studentId: 'N23DCPT019',
  defaultLimit: 8,
};
