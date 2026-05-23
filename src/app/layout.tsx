import type { Metadata } from 'next'
import './globals.css'

export const metadata = {
  title: 'Hệ thống Quản lý Cảnh quan · Khối SHE',
  description: 'Hệ thống Quản lý Cảnh quan – Khối Giải trí & Nghỉ dưỡng Sun Group (SHE). Nền tảng số hóa danh mục cây xanh cảnh quan toàn Khối.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
