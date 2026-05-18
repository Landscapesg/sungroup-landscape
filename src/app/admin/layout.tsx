'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf, LayoutDashboard, TreePine, Database, ChevronRight, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/plants', label: 'Quản lý Cây', icon: Leaf },
  { href: '/admin/master-data', label: 'Master Data', icon: Database },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center group-hover:bg-forest-600 transition-colors">
              <TreePine size={18} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm leading-none">Sun Group</div>
              <div className="text-gray-400 text-xs mt-0.5">Cảnh quan xanh</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 px-3 mb-3 uppercase tracking-wider">Ứng dụng</div>
          <Link href="/plants" className="sidebar-link">
            <Leaf size={16} /> Thư viện cây (Public)
          </Link>
          <div className="text-xs font-semibold text-gray-400 px-3 mt-5 mb-3 uppercase tracking-wider">Quản trị</div>
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center">
              <span className="text-forest-700 text-sm font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">Admin</div>
              <div className="text-xs text-gray-400 truncate">SUPERADMIN</div>
            </div>
            <button onClick={handleLogout} title="Đăng xuất"
              className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-forest-600">Trang quản trị</Link>
          {pathname !== '/admin' && (
            <>
              <ChevronRight size={14} />
              <span className="text-gray-800 font-medium">
                {pathname.includes('/plants') ? 'Quản lý Cây' : 'Master Data'}
              </span>
            </>
          )}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
