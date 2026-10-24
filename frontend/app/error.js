'use client';
export default function ErrorPage({ reset }) {
  return <div className="state" role="alert"><h1>Không thể tải trang</h1><p>Vui lòng kiểm tra kết nối với backend và thử lại.</p><button className="button primary" onClick={reset}>Thử lại</button></div>;
}
