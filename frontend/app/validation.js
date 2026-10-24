export const RANKS = ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu'];
export function validateStudent(form) {
  const errors = {};
  const mssv = form.mssv.trim();
  if (!/^N\d{2}DC[A-Z]{2}\d{3}$/.test(mssv)) errors.mssv = 'MSSV phải có dạng N23DCPT001.';
  if (form.hoTen.trim().length < 3 || form.hoTen.trim().length > 60) errors.hoTen = 'Họ tên phải dài 3–60 ký tự.';
  const date = new Date(form.ngaySinh + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.ngaySinh) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== form.ngaySinh) {
    errors.ngaySinh = 'Vui lòng nhập ngày sinh hợp lệ.';
  } else {
    const today = new Date();
    const age = today.getFullYear() - date.getUTCFullYear()
      - (today.getMonth() < date.getUTCMonth() || (today.getMonth() === date.getUTCMonth() && today.getDate() < date.getUTCDate()) ? 1 : 0);
    if (age < 17) errors.ngaySinh = 'Sinh viên phải đủ 17 tuổi.';
  }
  if (form.email.trim() !== mssv.toLowerCase() + '@student.ptithcm.edu.vn') errors.email = 'Email phải là MSSV viết thường + @student.ptithcm.edu.vn.';
  if (String(form.gpa).trim() === '' || !Number.isFinite(Number(form.gpa)) || Number(form.gpa) < 0 || Number(form.gpa) > 4) errors.gpa = 'GPA phải là số từ 0.00 đến 4.00.';
  if (!form.lopId) errors.lopId = 'Vui lòng chọn lớp.';
  return errors;
}
export function validateClass(form) {
  const errors = {};
  for (const [key, label] of Object.entries({ maLop: 'Mã lớp', tenLop: 'Tên lớp', khoa: 'Khóa' })) {
    if (!form[key].trim()) errors[key] = label + ' là bắt buộc.';
  }
  return errors;
}
