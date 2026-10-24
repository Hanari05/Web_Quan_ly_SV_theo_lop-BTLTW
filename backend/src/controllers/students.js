const students = require('../models/students');
const classes = require('../models/classes');
const validate = require('../validators');
const { fail } = require('../utils');
function existing(id) {
  const student = students.find(id);
  if (!student) fail(404, 'Không tìm thấy sinh viên.');
  return student;
}
function payload(body) {
  const data = validate.studentData(body);
  if (!classes.find(data.lopId)) fail(400, 'Lớp không tồn tại.', [{ field: 'lopId', message: 'Lớp không tồn tại. Vui lòng chọn lại.' }]);
  return data;
}
exports.list = (req, res) => res.json(students.list(validate.listQuery(req.query)));
exports.detail = (req, res) => res.json(existing(validate.id(req.params.id)));
exports.create = (req, res) => {
  const id = students.create(payload(req.body)); res.status(201).json(students.find(id));
};
exports.update = (req, res) => {
  const id = validate.id(req.params.id); existing(id);
  students.update(id, payload(req.body)); res.json(students.find(id));
};
exports.remove = (req, res) => {
  const id = validate.id(req.params.id); existing(id);
  students.remove(id); res.json({ message: 'Đã xóa sinh viên.' });
};
exports.stats = (req, res) => res.json(students.stats());
exports.exportCsv = (req, res) => {
  const { data } = students.list(validate.listQuery(req.query), false);
  const escape = value => {
    let text = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const rows = [['MSSV', 'Họ tên', 'Ngày sinh', 'Email', 'GPA', 'Xếp loại', 'Mã lớp'],
    ...data.map(s => [s.mssv, s.hoTen, s.ngaySinh, s.email, s.gpa.toFixed(2), s.xepLoai, s.maLop])];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sinh-vien-N23DCPT019.csv"');
  res.send('\ufeff' + rows.map(row => row.map(escape).join(',')).join('\r\n'));
};
