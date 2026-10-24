import Link from 'next/link';
export default function NotFound() {
  return <div className="state"><h1>Không tìm thấy dữ liệu</h1><p>Đường dẫn không tồn tại hoặc sinh viên đã được xóa.</p><Link className="button" href="/">Về danh sách</Link></div>;
}
