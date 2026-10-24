import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '../../api';
import DeleteStudent from '../../components/delete-student';

export default async function StudentDetail({ params }) {
  let student;
  try { student = await api(`/sinh-vien/${params.id}`, { cache: 'no-store' }); }
  catch (error) { if (error.status === 404 || error.status === 400) notFound(); throw error; }
  const fields = [
    ['MSSV', student.mssv], ['Email', student.email], ['Ngày sinh', student.ngaySinh.split('-').reverse().join('/')],
    ['Lớp', `${student.maLop} - ${student.tenLop}`], ['Khóa', student.khoa],
    ['GPA', student.gpa.toFixed(2)], ['Xếp loại', student.xepLoai],
  ];
  return <section className="narrow">
    <Link href="/" className="back">← Danh sách</Link>
    <div className="hero"><div><p className="eyebrow">{student.mssv}</p><h1>{student.hoTen}</h1><p className="muted">{student.xepLoai}</p></div></div>
    <div className="panel detail-grid">{fields.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <div className="actions section-space">
      <Link className="button primary" href={`/students/${student.id}/edit`}>Sửa thông tin</Link>
      <DeleteStudent id={student.id} name={student.hoTen} />
    </div>
  </section>;
}
