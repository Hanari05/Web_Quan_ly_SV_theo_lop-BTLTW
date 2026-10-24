'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from './api';
import { validateStudent } from './validation';
import Field from './components/field';

export default function StudentForm({ initial }) {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classError, setClassError] = useState('');
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initial
    ? { mssv: initial.mssv, hoTen: initial.hoTen, ngaySinh: initial.ngaySinh, email: initial.email, gpa: initial.gpa, lopId: initial.lopId }
    : { mssv: '', hoTen: '', ngaySinh: '', email: '', gpa: '', lopId: '' });

  useEffect(() => {
    const controller = new AbortController();
    setClassesLoading(true); setClassError('');
    api('/lop', { signal: controller.signal }).then(setClasses).catch(e => {
      if (e.name !== 'AbortError') setClassError(e.message);
    }).finally(() => { if (!controller.signal.aborted) setClassesLoading(false); });
    return () => controller.abort();
  }, [reload]);

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: '' }));
    setError('');
  }
  async function submit(event) {
    event.preventDefault();
    const validation = validateStudent(form);
    setErrors(validation); setError('');
    if (Object.keys(validation).length) {
      document.getElementById(Object.keys(validation)[0])?.focus();
      return;
    }
    setSaving(true);
    try {
      const student = await api(initial ? `/sinh-vien/${initial.id}` : '/sinh-vien', {
        method: initial ? 'PUT' : 'POST', body: JSON.stringify(form),
      });
      router.push(`/students/${student.id}`);
      router.refresh();
    } catch (e) {
      setErrors(e.fields || {}); setError(e.message); setSaving(false);
    }
  }
  const input = (label, name, props = {}) => <Field label={label} name={name} error={errors[name]} value={form[name]} onChange={e => update(name, e.target.value)} disabled={saving} required {...props} />;
  return <section className="narrow">
    <Link href={initial ? `/students/${initial.id}` : '/'} className="back">← Quay lại</Link>
    <h1>{initial ? 'Sửa sinh viên' : 'Thêm sinh viên'}</h1>
    <p className="muted">Điền đầy đủ thông tin. Email dùng MSSV viết thường.</p>
    {classError && <div className="notice error" role="alert">{classError} <button className="button" onClick={() => setReload(value => value + 1)}>Thử lại</button></div>}
    {!classesLoading && !classError && !classes.length && <p className="notice">Chưa có lớp. <Link href="/classes">Thêm lớp học</Link> trước khi lưu sinh viên.</p>}
    <form className="panel form" onSubmit={submit} noValidate aria-busy={saving}>
      {input('MSSV', 'mssv', { placeholder: 'N23DCPT019', autoComplete: 'off' })}
      {input('Họ tên', 'hoTen', { minLength: 3, maxLength: 60, autoComplete: 'name' })}
      {input('Ngày sinh', 'ngaySinh', { type: 'date' })}
      {input('Email', 'email', { type: 'email', placeholder: 'n23dcpt019@student.ptithcm.edu.vn' })}
      {input('GPA', 'gpa', { type: 'number', min: 0, max: 4, step: '0.01' })}
      <Field label="Lớp" name="lopId" error={errors.lopId}>
        <select id="lopId" name="lopId" required value={form.lopId} disabled={saving || classesLoading} aria-invalid={Boolean(errors.lopId)} aria-describedby={errors.lopId ? 'lopId-error' : undefined} onChange={e => update('lopId', e.target.value)}>
          <option value="">{classesLoading ? 'Đang tải lớp...' : 'Chọn lớp'}</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.maLop} - {c.tenLop}</option>)}
        </select>
      </Field>
      {error && <p className="error full-width" role="alert">{error}</p>}
      <div className="actions full-width">
        <button className="button primary" disabled={saving || classesLoading || Boolean(classError) || !classes.length}>{saving ? 'Đang lưu...' : 'Lưu sinh viên'}</button>
        <Link className="button" href={initial ? `/students/${initial.id}` : '/'}>Hủy</Link>
      </div>
    </form>
  </section>;
}
