'use client';
import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStats(null); setError('');
    api('/sinh-vien/stats', { signal: controller.signal }).then(setStats).catch(e => {
      if (e.name !== 'AbortError') setError(e.message);
    });
    return () => controller.abort();
  }, [reload]);
  return <section>
    <div className="hero"><div><p className="eyebrow">BÁO CÁO</p><h1>Thống kê sinh viên</h1><p className="muted">Tổng hợp GPA theo lớp và phân bố kết quả học tập.</p></div><button className="button" onClick={() => setReload(v => v + 1)}>Làm mới</button></div>
    {error ? <div className="state error" role="alert">{error}<button className="button" onClick={() => setReload(v => v + 1)}>Thử lại</button></div> : !stats ? <div className="state" role="status">Đang tải thống kê...</div> : <>
      <h2>GPA trung bình theo lớp</h2>
      {!stats.byClass.length ? <div className="state">Chưa có lớp học.</div> : <div className="cards">{stats.byClass.map(c => <article className="panel stat-card" key={c.id}><small>{c.maLop}</small><span>{c.tenLop}</span><strong className="stat-number">{c.averageGpa == null ? '—' : c.averageGpa.toFixed(2)}</strong><span>{c.studentCount} sinh viên</span></article>)}</div>}
      <h2>Phân bố xếp loại</h2>
      <div className="cards ranks">{stats.byRank.map(r => <article className="panel stat-card" key={r.xepLoai}><span>{r.xepLoai}</span><strong className="stat-number">{r.count}</strong><small>sinh viên</small></article>)}</div>
    </>}
  </section>;
}
