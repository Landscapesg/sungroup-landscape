import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sun Group — Kho dữ liệu cảnh quan xanh',
  description: 'Hệ thống quản lý danh mục cây cảnh quan toàn hệ thống Sun Group',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
