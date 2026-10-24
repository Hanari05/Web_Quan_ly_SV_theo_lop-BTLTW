import { notFound } from 'next/navigation';
import StudentForm from '../../../student-form';
import { api } from '../../../api';

export default async function EditStudent({ params }) {
  let student;
  try { student = await api(`/sinh-vien/${params.id}`, { cache: 'no-store' }); }
  catch (error) { if (error.status === 404 || error.status === 400) notFound(); throw error; }
  return <StudentForm initial={student} />;
}
