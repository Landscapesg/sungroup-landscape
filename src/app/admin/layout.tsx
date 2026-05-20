'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf, LayoutDashboard, TreePine, Database, ChevronRight, LogOut, Building2, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin',              label: 'Tổng quan',      icon: LayoutDashboard, exact: true },
  { href: '/admin/plants',       label: 'Quản lý Cây',    icon: Leaf },
  { href: '/admin/units',        label: 'Quản lý Đơn vị', icon: Building2 },
  { href: '/admin/master-data',  label: 'Master Data',    icon: Database },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Trang login không có sidebar ──────────────────────────────────────────
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  function handleLogout() {
    document.cookie = 'admin_session=; path=/; max-age=0'
    router.push('/admin/login')
    router.refresh()
  }

  const currentLabel =
    pathname.includes('/plants')     ? 'Quản lý Cây'    :
    pathname.includes('/units')      ? 'Quản lý Đơn vị' :
    pathname.includes('/master-data')? 'Master Data'     : ''

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── SIDEBAR DESKTOP (ẩn trên mobile) ── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col flex-shrink-0">
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
          <Link href="/plants" className="sidebar-link"><Leaf size={16} />Thư viện cây (Public)</Link>
          <div className="text-xs font-semibold text-gray-400 px-3 mt-5 mb-3 uppercase tracking-wider">Quản trị</div>
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
                <item.icon size={16} />{item.label}
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
            <button onClick={handleLogout} title="Đăng xuất" className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── DRAWER MOBILE (overlay từ trái) ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* panel */}
          <div className="w-64 bg-white flex flex-col h-full shadow-xl">
            <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setDrawerOpen(false)}>
                <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
                  <TreePine size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm leading-none">Sun Group</div>
                  <div className="text-gray-400 text-xs mt-0.5">Cảnh quan xanh</div>
                </div>
              </Link>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-400 px-3 mb-3 uppercase tracking-wider">Ứng dụng</div>
              <Link href="/plants" className="sidebar-link" onClick={() => setDrawerOpen(false)}>
                <Leaf size={16} />Thư viện cây (Public)
              </Link>
              <div className="text-xs font-semibold text-gray-400 px-3 mt-5 mb-3 uppercase tracking-wider">Quản trị</div>
              {navItems.map(item => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href}
                    className={`sidebar-link ${active ? 'active' : ''}`}
                    onClick={() => setDrawerOpen(false)}>
                    <item.icon size={16} />{item.label}
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
                  <div className="text-sm font-medium text-gray-700">Admin</div>
                  <div className="text-xs text-gray-400">SUPERADMIN</div>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
          {/* dim overlay */}
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* topbar — mobile có nút hamburger */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
          {/* hamburger — chỉ mobile */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden mr-1 text-gray-500 hover:text-gray-800 transition-colors">
            <Menu size={20} />
          </button>

          <Link href="/admin" className="hover:text-forest-600 flex-shrink-0">Trang quản trị</Link>
          {pathname !== '/admin' && currentLabel && (
            <>
              <ChevronRight size={14} className="flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate">{currentLabel}</span>
            </>
          )}
        </div>

        <div className="p-4 md:p-6 flex-1">{children}</div>
      </main>
    </div>
  )
}
