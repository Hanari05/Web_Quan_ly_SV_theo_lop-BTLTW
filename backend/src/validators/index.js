const { fail } = require('../utils');
const { defaultLimit } = require('../config');
const ranks = ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu'];
const text = value => typeof value === 'string' ? value.trim() : '';
const numeric = value => (typeof value === 'number' || typeof value === 'string')
  && String(value).trim() !== '' && Number.isFinite(Number(value));
function bodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'Dữ liệu phải là một đối tượng JSON.');
}
function finish(errors) {
  if (errors.length) fail(400, 'Dữ liệu không hợp lệ.', errors);
}
function id(value) {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) fail(400, 'ID phải là số nguyên dương.');
  return Number(value);
}
function classData(body) {
  bodyObject(body);
  const data = { maLop: text(body.maLop), tenLop: text(body.tenLop), khoa: text(body.khoa) };
  const labels = { maLop: 'Mã lớp', tenLop: 'Tên lớp', khoa: 'Khóa' };
  finish(Object.keys(data).filter(field => !data[field]).map(field => ({ field, message: labels[field] + ' là bắt buộc.' })));
  return data;
}
function studentData(body) {
  bodyObject(body);
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  const data = {
    mssv: text(body.mssv), hoTen: text(body.hoTen), ngaySinh: text(body.ngaySinh),
    email: text(body.email), gpa: Number(body.gpa), lopId: Number(body.lopId),
  };
  if (!/^N\d{2}DC[A-Z]{2}\d{3}$/.test(data.mssv)) add('mssv', 'MSSV phải có dạng N23DCPT001.');
  if (data.hoTen.length < 3 || data.hoTen.length > 60) add('hoTen', 'Họ tên phải dài 3–60 ký tự.');
  const date = new Date(data.ngaySinh + 'T00:00:00Z');
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(data.ngaySinh) && !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === data.ngaySinh;
  if (!validDate) add('ngaySinh', 'Ngày sinh không hợp lệ.');
  else {
    const today = new Date();
    const age = today.getFullYear() - date.getUTCFullYear()
      - (today.getMonth() < date.getUTCMonth() || (today.getMonth() === date.getUTCMonth() && today.getDate() < date.getUTCDate()) ? 1 : 0);
    if (age < 17) add('ngaySinh', 'Sinh viên phải đủ 17 tuổi.');
  }
  if (!/^[^@\s]+@student\.ptithcm\.edu\.vn$/.test(data.email)) add('email', 'Email phải có đuôi @student.ptithcm.edu.vn.');
  else if (data.email !== data.mssv.toLowerCase() + '@student.ptithcm.edu.vn') add('email', 'Email phải chứa đúng MSSV viết thường.');
  if (!numeric(body.gpa) || data.gpa < 0 || data.gpa > 4) add('gpa', 'GPA phải là số từ 0.00 đến 4.00.');
  if (!numeric(body.lopId) || !Number.isSafeInteger(data.lopId) || data.lopId < 1) add('lopId', 'Vui lòng chọn lớp hợp lệ.');
  finish(errors);
  return data;
}
function listQuery(query) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'string') add(key, 'Mỗi tham số chỉ được có một giá trị.');
  }
  finish(errors);
  const result = {
    q: text(query.q), lopId: query.lopId ? Number(query.lopId) : undefined,
    xepLoai: query.xepLoai || '', gpaMin: query.gpaMin ? Number(query.gpaMin) : undefined,
    sort: query.sort || 'mssv', order: query.order || 'asc',
    page: query.page ? Number(query.page) : 1, limit: query.limit ? Number(query.limit) : defaultLimit,
  };
  if (query.lopId && (!Number.isSafeInteger(result.lopId) || result.lopId < 1)) add('lopId', 'Lớp không hợp lệ.');
  if (result.xepLoai && !ranks.includes(result.xepLoai)) add('xepLoai', 'Xếp loại không hợp lệ.');
  if (result.gpaMin !== undefined && (!numeric(query.gpaMin) || result.gpaMin < 0 || result.gpaMin > 4)) add('gpaMin', 'GPA tối thiểu phải từ 0 đến 4.');
  if (!['gpa', 'hoTen', 'mssv'].includes(result.sort)) add('sort', 'Chỉ sắp xếp theo GPA, họ tên hoặc MSSV.');
  if (!['asc', 'desc'].includes(result.order)) add('order', 'Thứ tự phải là asc hoặc desc.');
  if (!Number.isSafeInteger(result.page) || result.page < 1 || !Number.isSafeInteger((result.page - 1) * result.limit)) add('page', 'Trang phải là số nguyên dương hợp lệ.');
  if (!Number.isSafeInteger(result.limit) || result.limit < 1 || result.limit > 100) add('limit', 'Số dòng mỗi trang phải là số nguyên từ 1 đến 100.');
  finish(errors);
  return result;
}
module.exports = { id, classData, studentData, listQuery, ranks };
