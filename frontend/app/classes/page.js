'use client';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { validateClass } from '../validation';
import Field from '../components/field';
import ConfirmDialog from '../components/confirm-dialog';

const EMPTY = { maLop: '', tenLop: '', khoa: '' };
export default function Classes() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadError('');
    api('/lop', { signal: controller.signal }).then(setItems).catch(e => {
      if (e.name !== 'AbortError') setLoadError(e.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);
  function reset() { setForm(EMPTY); setEditing(null); setErrors({}); setError(''); }
  function edit(item) {
    setForm({ maLop: item.maLop, tenLop: item.tenLop, khoa: item.khoa });
    setEditing(item.id); setErrors({}); setError(''); setMessage('');
    document.getElementById('maLop')?.focus();
  }
  async function save(event) {
    event.preventDefault();
    const validation = validateClass(form);
    setErrors(validation); setError(''); setMessage('');
    if (Object.keys(validation).length) return;
    setPending(true);
    try {
      await api(editing ? `/lop/${editing}` : '/lop', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setMessage(editing ? 'Đã cập nhật lớp.' : 'Đã thêm lớp.');
      reset(); setReload(v => v + 1);
    } catch (e) { setError(e.message); setErrors(e.fields || {}); }
    finally { setPending(false); }
  }
  async function remove(item) {
    setPending(true); setError(''); setMessage('');
    try {
      await api(`/lop/${item.id}`, { method: 'DELETE' });
      if (editing === item.id) reset();
      setMessage('Đã xóa lớp.'); setReload(v => v + 1);
    } catch (e) { setError(e.message); }
    finally { setPending(false); setDeleting(null); }
  }
  return <section>
    <div className="hero"><div><p className="eyebrow">DANH MỤC</p><h1>Quản lý lớp học</h1><p className="muted">Thêm, cập nhật lớp và quản lý thông tin khóa học.</p></div></div>
    <div className="panel"><h2 className="panel-title">{editing ? 'Sửa lớp' : 'Thêm lớp'}</h2>
      <form className="class-form" onSubmit={save} noValidate>
        {Object.entries({ maLop: 'Mã lớp', tenLop: 'Tên lớp', khoa: 'Khóa' }).map(([name, label]) => <Field key={name} name={name} label={label} value={form[name]} error={errors[name]} required disabled={pending} onChange={e => {
          setForm(current => ({ ...current, [name]: e.target.value })); setErrors(current => ({ ...current, [name]: '' }));
        }} />)}
        <div className="actions full-width"><button className="button primary" disabled={pending}>{pending ? 'Đang xử lý...' : editing ? 'Lưu thay đổi' : 'Thêm lớp'}</button>{editing && <button className="button" type="button" disabled={pending} onClick={reset}>Hủy sửa</button>}</div>
      </form>
    </div>
    {error && <p className="notice error" role="alert">{error}</p>}
    {message && <p className="notice success" role="status">{message}</p>}
    {loading ? <div className="state" role="status">Đang tải lớp...</div> : loadError ? <div className="state error" role="alert">{loadError} <button className="button" onClick={() => setReload(v => v + 1)}>Thử lại</button></div> : !items.length ? <div className="state">Chưa có lớp học. Hãy thêm lớp đầu tiên.</div> : <div className="cards section-space">{items.map(item => <article className="panel class-card" key={item.id}><h2 className="card-title">{item.maLop}</h2><span>{item.tenLop}</span><small>{item.khoa}</small><div className="actions"><button className="button" disabled={pending} onClick={() => edit(item)} aria-label={`Sửa lớp ${item.maLop}`}>Sửa</button><button className="button danger" disabled={pending} onClick={() => setDeleting(item)} aria-label={`Xóa lớp ${item.maLop}`}>Xóa</button></div></article>)}</div>}
    <ConfirmDialog open={Boolean(deleting)} title="Xóa lớp học?" description={`Bạn sắp xóa lớp "${deleting?.maLop || ''}". Chỉ có thể xóa lớp không còn sinh viên.`} pending={pending} onCancel={() => setDeleting(null)} onConfirm={() => remove(deleting)} />
  </section>;
}
