'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, request, queryString } from './api';
import { RANKS } from './validation';

const DEFAULT_FILTERS = { q: '', lopId: '', xepLoai: '', gpaMin: '', sort: 'mssv', order: 'asc' };
export default function StudentList() {
  const [students, setStudents] = useState({ data: [], page: 1, limit: 8, total: 0, totalPages: 0 });
  const [classes, setClasses] = useState([]);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classError, setClassError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setClassError('');
    api('/lop', { signal: controller.signal }).then(setClasses).catch(e => {
      if (e.name !== 'AbortError') setClassError(e.message);
    });
    return () => controller.abort();
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setExportError('');
    api(`/sinh-vien?${queryString({ ...applied, page, limit: 8 })}`, { signal: controller.signal })
      .then(data => {
        if (page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
        else setStudents(data);
      })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applied, page, reload]);

  function update(key, value) { setDraft(current => ({ ...current, [key]: value })); }
  function apply(event) { event.preventDefault(); setPage(1); setApplied({ ...draft }); }
  function clear() { setDraft(DEFAULT_FILTERS); setApplied({ ...DEFAULT_FILTERS }); setPage(1); }
  async function exportCsv() {
    setExporting(true); setExportError('');
    try {
      const response = await request(`/sinh-vien/export?${queryString(applied)}`);
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'sinh-vien-N23DCPT019.csv';
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setExportError(e.message); }
    finally { setExporting(false); }
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  return <section>
    <div className="hero"><div><p className="eyebrow">ĐỀ 04 · QUẢN LÝ SINH VIÊN</p><h1>Danh sách sinh viên</h1><p className="muted">Tra cứu, cập nhật và xuất dữ liệu theo lớp sinh hoạt.</p></div><Link className="button primary" href="/students/new">+ Thêm sinh viên</Link></div>
    <form className="panel filters" onSubmit={apply}>
      <label className="search-field">Tìm kiếm<input placeholder="MSSV hoặc họ tên..." value={draft.q} onChange={e => update('q', e.target.value)} /></label>
      <label>Lớp<select value={draft.lopId} onChange={e => update('lopId', e.target.value)}><option value="">Tất cả lớp</option>{classes.map(c => <option key={c.id} value={c.id}>{c.maLop}</option>)}</select></label>
      <label>Xếp loại<select value={draft.xepLoai} onChange={e => update('xepLoai', e.target.value)}><option value="">Tất cả xếp loại</option>{RANKS.map(rank => <option key={rank}>{rank}</option>)}</select></label>
      <label>GPA từ<input type="number" min="0" max="4" step="0.01" placeholder="0.00" value={draft.gpaMin} onChange={e => update('gpaMin', e.target.value)} /></label>
      <label>Sắp xếp theo<select value={draft.sort} onChange={e => update('sort', e.target.value)}><option value="mssv">MSSV</option><option value="hoTen">Họ tên</option><option value="gpa">GPA</option></select></label>
      <label>Thứ tự<select value={draft.order} onChange={e => update('order', e.target.value)}><option value="asc">Tăng dần</option><option value="desc">Giảm dần</option></select></label>
      <div className="actions full-width">
        <button className="button primary">Lọc</button>
        <button className="button" type="button" onClick={clear}>Đặt lại</button>
        <button className="button secondary" type="button" disabled={loading || Boolean(error) || exporting || !students.total} onClick={exportCsv}>{exporting ? 'Đang xuất...' : 'Xuất CSV'}</button>
        <span className="muted">CSV gồm toàn bộ kết quả của bộ lọc đã áp dụng.</span>
      </div>
    </form>
    {dirty && <p className="notice" role="status">Bộ lọc đã thay đổi. Bấm “Lọc” để cập nhật bảng và CSV.</p>}
    {classError && <p className="error" role="alert">Không tải được danh mục lớp. <button className="button" onClick={() => setReload(v => v + 1)}>Thử lại</button></p>}
    {exportError && <p className="error" role="alert">{exportError}</p>}
    {loading ? <div className="state" role="status">Đang tải dữ liệu...</div> : error ? <div className="state error" role="alert">{error} <button className="button" onClick={() => setReload(v => v + 1)}>Thử lại</button></div> : <>
      <div className="table-wrap"><table><caption className="sr-only">Danh sách sinh viên theo bộ lọc hiện tại</caption><thead><tr><th scope="col">MSSV</th><th scope="col">Họ tên</th><th scope="col">Lớp</th><th scope="col">GPA</th><th scope="col">Xếp loại</th><th scope="col">Thao tác</th></tr></thead><tbody>
        {students.data.map(s => <tr key={s.id}><td><strong>{s.mssv}</strong></td><td>{s.hoTen}</td><td>{s.maLop}</td><td>{s.gpa.toFixed(2)}</td><td><span className="tag">{s.xepLoai}</span></td><td><Link href={`/students/${s.id}`} aria-label={`Chi tiết ${s.mssv}`}>Chi tiết</Link></td></tr>)}
      </tbody></table>{!students.data.length && <div className="state">Không có sinh viên phù hợp.</div>}</div>
      <div className="pagination"><span>{students.total} sinh viên</span><div className="actions"><button className="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(v => v - 1)}>←</button><span>Trang {students.page}/{students.totalPages || 1}</span><button className="button" aria-label="Trang sau" disabled={page >= students.totalPages} onClick={() => setPage(v => v + 1)}>→</button></div></div>
    </>}
  </section>;
}
