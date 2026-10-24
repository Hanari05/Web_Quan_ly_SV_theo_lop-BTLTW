function getXepLoai(gpa) {
  if (gpa >= 3.6) return 'Xuất sắc';
  if (gpa >= 3.2) return 'Giỏi';
  if (gpa >= 2.5) return 'Khá';
  if (gpa >= 2) return 'Trung bình';
  return 'Yếu';
}
function toStudent(row) {
  return row ? { ...row, gpa: Number(row.gpa), xepLoai: getXepLoai(Number(row.gpa)) } : null;
}
function fail(status, message, details = []) {
  const error = new Error(message); error.status = status; error.details = details; throw error;
}
module.exports = { getXepLoai, toStudent, fail };
