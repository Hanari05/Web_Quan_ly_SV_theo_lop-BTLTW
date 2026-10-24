'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../api';
import ConfirmDialog from './confirm-dialog';

export default function DeleteStudent({ id, name }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setPending(true); setError('');
    try {
      await api(`/sinh-vien/${id}`, { method: 'DELETE' });
      setConfirming(false);
      router.push('/'); router.refresh();
    } catch (e) { setError(e.message); setConfirming(false); setPending(false); }
  }
  return <div>
    <button className="button danger" disabled={pending} onClick={() => setConfirming(true)}>Xóa sinh viên</button>
    <ConfirmDialog open={confirming} title="Xóa sinh viên?" description={`Bạn sắp xóa "${name}". Thao tác này không thể hoàn tác.`} pending={pending} onCancel={() => setConfirming(false)} onConfirm={remove} />
    {error && <p className="error" role="alert">{error}</p>}
  </div>;
}
