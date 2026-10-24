'use client';
import { useEffect, useId, useRef } from 'react';

export default function ConfirmDialog({ open, title, description, pending, onCancel, onConfirm }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => {
    event.preventDefault();
    if (!pending) onCancel();
  }}>
    <h2 id={titleId}>{title}</h2>
    <p id={descriptionId}>{description}</p>
    <div className="actions">
      <button className="button" autoFocus disabled={pending} onClick={onCancel}>Hủy</button>
      <button className="button danger" disabled={pending} onClick={onConfirm}>{pending ? 'Đang xóa...' : 'Xác nhận xóa'}</button>
    </div>
  </dialog>;
}
