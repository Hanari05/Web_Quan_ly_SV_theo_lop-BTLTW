const db = require('../db');
const { toStudent } = require('../utils');
const { ranks } = require('../validators');
const select = 'SELECT s.*, l.maLop, l.tenLop, l.khoa FROM sinh_vien s JOIN lop l ON l.id = s.lopId';
function filter(query) {
  const conditions = [], params = [];
  if (query.q) {
    conditions.push("(s.mssv LIKE ? ESCAPE '\\' OR s.hoTen LIKE ? ESCAPE '\\')");
    const term = '%' + query.q.replace(/[\\%_]/g, '\\$&') + '%';
    params.push(term, term);
  }
  if (query.lopId) { conditions.push('s.lopId = ?'); params.push(query.lopId); }
  if (query.gpaMin !== undefined) { conditions.push('s.gpa >= ?'); params.push(query.gpaMin); }
  const bounds = { 'Xuất sắc': [3.6, null], 'Giỏi': [3.2, 3.6], 'Khá': [2.5, 3.2], 'Trung bình': [2, 2.5], 'Yếu': [0, 2] };
  if (query.xepLoai) {
    const [min, max] = bounds[query.xepLoai];
    conditions.push('s.gpa >= ?'); params.push(min);
    if (max !== null) { conditions.push('s.gpa < ?'); params.push(max); }
  }
  return { where: conditions.length ? ' WHERE ' + conditions.join(' AND ') : '', params };
}
module.exports = {
  find: id => toStudent(db.prepare(select + ' WHERE s.id = ?').get(id)),
  list(query, paginated = true) {
    const { where, params } = filter(query);
    const order = ' ORDER BY s.' + query.sort + ' ' + query.order.toUpperCase() + ', s.id ASC';
    const total = db.prepare('SELECT COUNT(*) AS total FROM sinh_vien s' + where).get(...params).total;
    const rows = paginated
      ? db.prepare(select + where + order + ' LIMIT ? OFFSET ?').all(...params, query.limit, (query.page - 1) * query.limit)
      : db.prepare(select + where + order).all(...params);
    return { data: rows.map(toStudent), page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) };
  },
  create(data) {
    return Number(db.prepare('INSERT INTO sinh_vien (mssv, hoTen, ngaySinh, email, gpa, lopId) VALUES (?, ?, ?, ?, ?, ?)')
      .run(data.mssv, data.hoTen, data.ngaySinh, data.email, data.gpa, data.lopId).lastInsertRowid);
  },
  update(id, data) {
    db.prepare('UPDATE sinh_vien SET mssv = ?, hoTen = ?, ngaySinh = ?, email = ?, gpa = ?, lopId = ? WHERE id = ?')
      .run(data.mssv, data.hoTen, data.ngaySinh, data.email, data.gpa, data.lopId, id);
  },
  remove: id => db.prepare('DELETE FROM sinh_vien WHERE id = ?').run(id),
  stats() {
    const byClass = db.prepare('SELECT l.id, l.maLop, l.tenLop, ROUND(AVG(s.gpa), 2) AS averageGpa, COUNT(s.id) AS studentCount FROM lop l LEFT JOIN sinh_vien s ON s.lopId = l.id GROUP BY l.id ORDER BY l.maLop').all();
    const counts = db.prepare("SELECT CASE WHEN gpa >= 3.6 THEN 'Xuất sắc' WHEN gpa >= 3.2 THEN 'Giỏi' WHEN gpa >= 2.5 THEN 'Khá' WHEN gpa >= 2 THEN 'Trung bình' ELSE 'Yếu' END AS xepLoai, COUNT(*) AS count FROM sinh_vien GROUP BY xepLoai").all();
    return { byClass, byRank: ranks.map(xepLoai => ({ xepLoai, count: counts.find(row => row.xepLoai === xepLoai)?.count || 0 })) };
  },
};
