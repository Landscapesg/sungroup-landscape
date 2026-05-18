import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const adminSession = req.cookies.get('admin_session')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminPage && !isLoginPage && !adminSession) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (isLoginPage && adminSession) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
