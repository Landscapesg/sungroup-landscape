'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Leaf, Building2, BarChart2, TrendingUp, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ plants: 0, active: 0, units: 0, groups: 0 })
  const [sheUnits, setSheUnits] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [p, u, g] = await Promise.all([
        supabase.from('plants').select('id, status', { count: 'exact' }),
        supabase.from('she_units').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('plant_groups').select('id', { count: 'exact' }).eq('level', 1),
      ])
      const active = p.data?.filter((x: any) => x.status === 'ACTIVE').length || 0
      setStats({ plants: p.count || 0, active, units: u.count || 0, groups: g.count || 0 })
      setSheUnits(u.data || [])
    }
    load()
  }, [])

  const MANGS = ['Giải trí', 'Nghỉ dưỡng - Tự vận hành', 'Nghỉ dưỡng - Thuê quản lý', 'Sân golf']
  const MANG_COLORS: Record<string, string> = {
    'Giải trí': 'bg-emerald-50 border-emerald-200',
    'Nghỉ dưỡng - Tự vận hành': 'bg-blue-50 border-blue-200',
    'Nghỉ dưỡng - Thuê quản lý': 'bg-purple-50 border-purple-200',
    'Sân golf': 'bg-amber-50 border-amber-200',
  }

  const cards = [
    { label: 'Tổng số loài cây', value: stats.plants, icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Đang hoạt động', value: stats.active, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Đơn vị Khối SHE', value: stats.units, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Nhóm phân loại', value: stats.groups, icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">Kho dữ liệu cảnh quan xanh — Khối SHE</p>
        </div>
        <Link href="/admin/plants" className="btn-primary"><Leaf size={15} />Quản lý Cây <ArrowRight size={14} /></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon size={20} className={c.color} />
            </div>
            <div className="text-3xl font-display font-semibold text-gray-800">{c.value}</div>
            <div className="text-gray-500 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Building2 size={16} className="text-forest-600" />Các đơn vị thành viên Khối SHE
          </h2>
          <Link href="/admin/she-units" className="text-xs text-forest-600 hover:underline flex items-center gap-1">Quản lý đơn vị <ArrowRight size={12} /></Link>
        </div>
        <div className="space-y-5">
          {MANGS.map(mang => {
            const units = sheUnits.filter(u => u.mang === mang)
            if (units.length === 0) return null
            return (
              <div key={mang}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{mang} ({units.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {units.map(u => (
                    <div key={u.id} className={`border rounded-lg px-3 py-2 ${MANG_COLORS[mang] || 'bg-gray-50 border-gray-200'}`}>
                      <div className="font-mono text-xs text-gray-500">{u.code}</div>
                      <div className="text-xs font-medium text-gray-700 leading-tight mt-0.5">{u.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
