# N23DCPT019_De04

Ứng dụng quản lý sinh viên theo lớp — Đề 04.

- Họ tên: **Nguyễn Ngọc Gia Hân**
- MSSV: **N23DCPT019**
- Backend: Node.js + Express + SQLite, cổng **5007**
- Frontend: Next.js 14 App Router + React, cổng **3000**
- API danh sách mặc định **8** sinh viên/trang.

## Yêu cầu môi trường

Dùng **Node.js >= 22.13.0** (đã kiểm tra với Node.js 24) vì backend sử dụng `node:sqlite` tích hợp sẵn. Không cần cài máy chủ CSDL riêng.

## Chạy trên Windows

Terminal thứ nhất, tại thư mục gốc:

```powershell
cd backend
Copy-Item .env.example .env
npm ci
npm run seed
npm run dev
```

Lệnh `npm run seed` **xóa dữ liệu lớp/sinh viên cũ** và tạo lại 3 lớp, 15 sinh viên mẫu. Chỉ chạy khi cần khởi tạo hoặc đặt lại dữ liệu.

Terminal thứ hai:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). API tại [http://localhost:5007/api/sinh-vien](http://localhost:5007/api/sinh-vien).

Trên macOS/Linux, thay `Copy-Item` bằng `cp`. Các lệnh npm giữ nguyên.

## Cấu hình

Backend đọc `backend/.env`:
- `PORT=5007`
- `DATABASE_FILE=./data/students.db` — đường dẫn tương đối tính từ thư mục backend.

Frontend đọc `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:5007/api`

Giữ cổng 5007 khi demo theo đề. Nếu đổi URL backend, khởi động lại frontend; bản production cần build lại. Chưa seed thì ứng dụng hiển thị trạng thái rỗng, có thể thêm lớp/sinh viên bằng giao diện.

## Cấu trúc

```text
N23DCPT019_De04/
├── backend/
│   ├── src/
│   │   ├── routes/         # Khai báo REST endpoints
│   │   ├── controllers/    # Xử lý request và quy tắc nghiệp vụ
│   │   ├── models/         # Truy vấn SQLite có tham số
│   │   ├── middlewares/    # Header định danh, log, xử lý lỗi tập trung
│   │   ├── validators/     # Validate body và query, lỗi theo từng trường
│   │   ├── app.js          # Cấu hình Express, xuất app cho kiểm thử
│   │   ├── server.js       # Khởi động và dừng server
│   │   ├── config.js       # Cấu hình môi trường
│   │   ├── db.js           # Schema, khóa ngoại và chỉ mục
│   │   ├── seed.js         # Seed trong transaction
│   │   └── utils.js        # Xếp loại, chuẩn hóa kết quả và lỗi
│   ├── test/api.test.js    # Kiểm thử tích hợp, CSDL trong bộ nhớ
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── classes/page.js
│   │   ├── stats/page.js
│   │   ├── students/[id]/page.js
│   │   ├── students/[id]/edit/page.js
│   │   ├── students/new/page.js
│   │   ├── components/
│   │   ├── student-form.js
│   │   ├── student-list.js
│   │   ├── api.js
│   │   ├── validation.js
│   │   ├── layout.js
│   │   ├── loading.js
│   │   ├── error.js
│   │   ├── not-found.js
│   │   └── styles.css
│   ├── .env.local.example
│   └── package.json
├── scripts/package.ps1
└── README.md
```

## Chức năng đã làm

- CRUD lớp: danh sách, thêm, sửa, xóa; cấm xóa lớp còn sinh viên (409).
- CRUD sinh viên; trang chi tiết lấy dữ liệu bằng Server Component và kèm thông tin lớp.
- Xóa sinh viên và lớp có xác nhận; trạng thái đang xử lý tránh gửi lặp.
- Validate cả client và backend: mẫu/duy nhất MSSV, tên 3–60 ký tự, ngày sinh có thật và đủ 17 tuổi, email đúng MSSV viết thường và miền trường, GPA 0–4, lớp tồn tại.
- Form thêm/sửa dùng Client Component, GPA nhận số thập phân, lỗi hiển thị dưới từng trường.
- Tìm kiếm MSSV/họ tên; lọc lớp, xếp loại, GPA tối thiểu; sắp xếp GPA/họ tên/MSSV tăng hoặc giảm; phân trang.
- Thống kê GPA trung bình theo lớp và số sinh viên ở cả 5 xếp loại, kể cả số lượng bằng 0.
- CSV UTF-8 có BOM, header tải file, escape dữ liệu; xuất toàn bộ kết quả theo **bộ lọc đã áp dụng** và đúng thứ tự sắp xếp, không giới hạn ở trang đang xem.
- Giao diện có trạng thái tải/rỗng/lỗi, thử lại, hỗ trợ màn hình hẹp và nhãn cho input.
- SQLite lưu bền vững, khóa ngoại, chỉ mục lớp/GPA; seed 3 lớp và 15 sinh viên đủ 5 mức, họ tên chứa N23DCPT019.
- Log method/URL/status/thời gian; CORS; lỗi tập trung; header `X-Student-Id: N23DCPT019` kể cả preflight và JSON lỗi.
- Footer: Nguyễn Ngọc Gia Hân – N23DCPT019 – Đề 04.

**Chưa làm trong phạm vi yêu cầu:** Không còn chức năng được liệt kê là chưa triển khai. Xác thực tài khoản/phân quyền không thuộc phạm vi đề.

## API

| Method | Đường dẫn | Chức năng |
|---|---|---|
| GET / POST | /api/lop | Danh sách / thêm lớp |
| PUT / DELETE | /api/lop/:id | Sửa / xóa lớp |
| GET / POST | /api/sinh-vien | Danh sách / thêm sinh viên |
| GET / PUT / DELETE | /api/sinh-vien/:id | Chi tiết / sửa / xóa sinh viên |
| GET | /api/sinh-vien/stats | Thống kê |
| GET | /api/sinh-vien/export | Tải CSV |

Danh sách hỗ trợ `q, lopId, xepLoai, gpaMin, sort, order, page, limit`. CSV dùng cùng bộ lọc và sắp xếp; bỏ phân trang khi xuất.

Ví dụ: `/api/sinh-vien?gpaMin=3.2&sort=gpa&order=desc&page=1&limit=8`.

Response danh sách: `{ data, page, limit, total, totalPages }`. Xếp loại: ≥3.6 Xuất sắc; ≥3.2 Giỏi; ≥2.5 Khá; ≥2.0 Trung bình; còn lại Yếu.

Thành công: 200, thêm mới: 201. Dữ liệu sai: 400; không tìm thấy: 404; trùng dữ liệu hoặc xóa lớp có sinh viên: 409. Lỗi có dạng:

```json
{
  "error": "Dữ liệu không hợp lệ.",
  "details": [{ "field": "gpa", "message": "GPA phải là số từ 0.00 đến 4.00." }]
}
```

## Kiểm tra và chạy production

```powershell
cd backend
npm test
# Tại terminal backend:
npm start
```

```powershell
cd frontend
npm run build
npm start
```

Test backend dùng SQLite trong bộ nhớ, không thay đổi dữ liệu đang dùng. Bộ test bao phủ CRUD, lỗi trùng, ràng buộc lớp, ngày/tuổi, validate dữ liệu/query, phân trang, xếp loại sát ngưỡng, thống kê, CSV và header định danh.

Luồng demo: xem danh sách → tìm/lọc/sắp xếp/phân trang → thêm sinh viên GPA 3.75 → sửa → xem chi tiết → xóa/cancel xác nhận → thêm/sửa/xóa lớp rỗng → thử xóa lớp có sinh viên → thống kê → xuất CSV.

## Đóng gói nộp bài

Chạy từ thư mục gốc bằng PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package.ps1
```

Kết quả là `N23DCPT019_De04.zip` có thư mục gốc **N23DCPT019_De04/**, gồm backend, frontend và README. Script loại `node_modules`, `.next`, `.git`, CSDL đang dùng và file môi trường thật; giữ file cấu hình mẫu và lockfile. Sau giải nén, chạy cài đặt và seed theo hướng dẫn ở trên. Script có thể chạy từ checkout mang tên khác mà bản nộp vẫn đúng tên yêu cầu.
