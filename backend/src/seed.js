const db = require('./db');

const STUDENTS = [
  ['N23DCPT019', 'Nguyễn Ngọc Gia Hân N23DCPT019', '2004-05-12', 3.8, 0],
  ['N23DCPT002', 'Trần Minh Anh', '2004-06-01', 3.6, 0],
  ['N23DCPT003', 'Lê Hoàng Nam', '2004-08-21', 3.3, 0],
  ['N23DCPT004', 'Phạm Khánh Linh', '2004-02-15', 2.7, 0],
  ['N23DCPT005', 'Võ Tuấn Kiệt', '2004-11-30', 1.8, 0],
  ['N23DCPT006', 'Đỗ Hải Yến', '2003-03-09', 2.1, 1],
  ['N23DCPT007', 'Bùi Quốc Bảo', '2003-04-19', 3.9, 1],
  ['N23DCPT008', 'Nguyễn Thùy Dương', '2003-07-20', 3.4, 1],
  ['N23DCPT009', 'Hoàng Đức Long', '2003-09-01', 2.6, 1],
  ['N23DCPT010', 'Phan Ngọc Mai', '2003-10-18', 1.5, 1],
  ['N24DCPT011', 'Nguyễn Nhật Minh', '2005-01-11', 3.7, 2],
  ['N24DCPT012', 'Lý Gia Huy', '2005-02-22', 3.2, 2],
  ['N24DCPT013', 'Đặng Mai Chi', '2005-03-13', 2.9, 2],
  ['N24DCPT014', 'Trương Bảo Ngọc', '2005-04-07', 2.0, 2],
  ['N24DCPT015', 'Đinh Anh Khoa', '2005-05-29', 1.2, 2],
];

function seed() {
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM sinh_vien; DELETE FROM lop;');
    const insertClass = db.prepare('INSERT INTO lop (maLop, tenLop, khoa) VALUES (?, ?, ?)');
    const classes = [
      insertClass.run('D23CQPTUD01-N', 'Công nghệ phần mềm 01', 'K23').lastInsertRowid,
      insertClass.run('D23CQPTUD02-N', 'Công nghệ phần mềm 02', 'K23').lastInsertRowid,
      insertClass.run('D24CQPTUD01-N', 'Công nghệ phần mềm 01', 'K24').lastInsertRowid,
    ];
    const insert = db.prepare('INSERT INTO sinh_vien (mssv, hoTen, ngaySinh, email, gpa, lopId) VALUES (?, ?, ?, ?, ?, ?)');
    for (const [mssv, hoTen, ngaySinh, gpa, classIndex] of STUDENTS) {
      insert.run(mssv, hoTen, ngaySinh, mssv.toLowerCase() + '@student.ptithcm.edu.vn', gpa, classes[classIndex]);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

if (require.main === module) {
  seed();
  console.log('Đã seed 3 lớp và 15 sinh viên.');
  db.close();
}
module.exports = seed;
