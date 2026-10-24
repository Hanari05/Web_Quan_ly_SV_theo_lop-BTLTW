import './styles.css';
import Link from 'next/link';
export const metadata = { title: 'Quản lý sinh viên theo lớp', description: 'Đề 04 - N23DCPT019' };
export default function Layout({ children }) {
  return <html lang="vi"><body>
    <a className="skip-link" href="#main">Đến nội dung chính</a>
    <header><div className="container nav"><Link className="brand" href="/">StudentHub</Link><nav aria-label="Điều hướng chính"><Link href="/">Sinh viên</Link><Link href="/classes">Lớp học</Link><Link href="/stats">Thống kê</Link></nav></div></header>
    <main id="main" className="container">{children}</main>
    <footer>Nguyễn Ngọc Gia Hân – N23DCPT019 – Đề 04</footer>
  </body></html>;
}
