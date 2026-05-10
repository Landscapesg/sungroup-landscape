# 🌿 Sun Group — Kho dữ liệu cảnh quan xanh

Hệ thống quản lý danh mục cây cảnh quan toàn hệ thống Sun Group.

## Cài đặt & Chạy

```bash
# Bước 1: Cài dependencies
npm install

# Bước 2: Chạy trên máy (development)
npm run dev
```

Mở trình duyệt vào: **http://localhost:3000**

## Các trang

| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ |
| `/plants` | Thư viện cây (công khai) |
| `/admin` | Tổng quan quản trị |
| `/admin/plants` | Quản lý danh sách cây |
| `/admin/plants/new` | Thêm cây mới |

## Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Cấu hình môi trường

File `.env.local` đã được điền sẵn thông tin Supabase.
Khi deploy lên Vercel, thêm 2 biến này vào Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
