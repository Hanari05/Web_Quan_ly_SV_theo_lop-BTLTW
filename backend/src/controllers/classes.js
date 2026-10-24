const classes = require('../models/classes');
const validate = require('../validators');
const { fail } = require('../utils');
function existing(id) { if (!classes.find(id)) fail(404, 'Không tìm thấy lớp.'); }
exports.list = (req, res) => res.json(classes.all());
exports.create = (req, res) => {
  const id = classes.create(validate.classData(req.body));
  res.status(201).json(classes.find(id));
};
exports.update = (req, res) => {
  const id = validate.id(req.params.id); existing(id);
  classes.update(id, validate.classData(req.body)); res.json(classes.find(id));
};
exports.remove = (req, res) => {
  const id = validate.id(req.params.id); existing(id);
  if (classes.hasStudents(id)) fail(409, 'Không thể xóa lớp còn sinh viên.');
  classes.remove(id); res.json({ message: 'Đã xóa lớp.' });
};
