const db = require('../db');
module.exports = {
  all: () => db.prepare('SELECT * FROM lop ORDER BY maLop').all(),
  find: id => db.prepare('SELECT * FROM lop WHERE id = ?').get(id),
  hasStudents: id => Boolean(db.prepare('SELECT 1 FROM sinh_vien WHERE lopId = ? LIMIT 1').get(id)),
  create(data) {
    return Number(db.prepare('INSERT INTO lop (maLop, tenLop, khoa) VALUES (?, ?, ?)').run(data.maLop, data.tenLop, data.khoa).lastInsertRowid);
  },
  update(id, data) {
    db.prepare('UPDATE lop SET maLop = ?, tenLop = ?, khoa = ? WHERE id = ?').run(data.maLop, data.tenLop, data.khoa, id);
  },
  remove: id => db.prepare('DELETE FROM lop WHERE id = ?').run(id),
};
