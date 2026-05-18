'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TreePine, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

const ADMIN_EMAIL = 'admin@sungroup.com'
const ADMIN_PASSWORD = 'SHE@2024!'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Kiểm tra credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Set cookie session
      document.cookie = 'admin_session=true; path=/; max-age=86400; SameSite=Strict'
      router.push('/admin')
      router.refresh()
    } else {
      setError('Email hoặc mật khẩu không đúng!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TreePine size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Sun Group</h1>
          <p className="text-gray-400 text-sm mt-1">Kho cảnh quan xanh — Khối SHE</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Đăng nhập quản trị</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pl-10" placeholder="admin@sungroup.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
