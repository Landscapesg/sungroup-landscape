'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Leaf, Building2, BarChart2 } from 'lucide-react'

export default function StatisticsPage() {
  const [plants, setPlants] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [sheUnits, setSheUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, g, u] = await Promise.all([
        supabase.from('plants').select('id, group_lv1_id, group_lv2_id, she_unit_ids, status'),
        supabase.from('plant_groups').select('*').order('sort_order'),
        supabase.from('she_units').select('*').order('sort_order'),
      ])
      setPlants(p.data || [])
      setGroups(g.data || [])
      setSheUnits(u.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Đang tải...</div>

  const groups1 = groups.filter(g => g.level === 1)
  const groups2 = groups.filter(g => g.level === 2)
  const MANGS = ['Giải trí', 'Nghỉ dưỡng - Tự vận hành', 'Nghỉ dưỡng - Thuê quản lý', 'Sân golf']

  // Thống kê theo nhóm Cấp 1
  const byGroup1 = groups1.map(g => ({
    ...g,
    count: plants.filter(p => p.group_lv1_id === g.id).length,
    subGroups: groups2.filter(g2 => g2.parent_id === g.id).map(g2 => ({
      ...g2,
      count: plants.filter(p => p.group_lv2_id === g2.id).length
    }))
  })).filter(g => g.count > 0)

  // Thống kê theo đơn vị SHE
  const byUnit = sheUnits.map(u => ({
    ...u,
    count: plants.filter(p => (p.she_unit_ids || []).includes(u.id)).length
  }))

  const maxGroupCount = Math.max(...byGroup1.map(g => g.count), 1)
  const maxUnitCount = Math.max(...byUnit.map(u => u.count), 1)

  return (
    <div className="max-w-5xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Thống kê cảnh quan</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng {plants.length} loài cây · Khối SHE</p>
        </div>
        <Link href="/admin/plants" className="btn-secondary"><ArrowLeft size={15} />Quay lại</Link>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng số loài', value: plants.length, icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Đang hoạt động', value: plants.filter(p => p.status === 'ACTIVE').length, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Số nhóm Cấp 1', value: byGroup1.length, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Số đơn vị SHE', value: sheUnits.length, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="text-3xl font-display font-semibold text-gray-800">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theo nhóm Cấp 1 */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-forest-600" />Số lượng theo Nhóm Cấp 1
          </h2>
          <div className="space-y-3">
            {byGroup1.map(g => (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{g.name}</span>
                  <span className="text-sm font-semibold text-forest-700">{g.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-forest-500 h-2 rounded-full transition-all" style={{ width: `${(g.count / maxGroupCount) * 100}%` }} />
                </div>
                {g.subGroups.filter((s: any) => s.count > 0).length > 0 && (
                  <div className="ml-4 mt-1.5 space-y-1">
                    {g.subGroups.filter((s: any) => s.count > 0).map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between text-xs text-gray-500">
                        <span>↳ {s.name}</span>
                        <span>{s.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Theo mảng & đơn vị SHE */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-forest-600" />Số lượng theo Đơn vị Khối SHE
          </h2>
          <div className="space-y-4">
            {MANGS.map(mang => {
              const units = byUnit.filter(u => u.mang === mang && u.count > 0)
              if (units.length === 0) return null
              return (
                <div key={mang}>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{mang}</div>
                  <div className="space-y-2">
                    {units.map(u => (
                      <div key={u.id}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-gray-600"><span className="font-mono text-gray-400 mr-1">{u.code}</span>{u.name}</span>
                          <span className="text-xs font-semibold text-forest-700">{u.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(u.count / maxUnitCount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {byUnit.every(u => u.count === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">Chưa có cây nào được gán đơn vị</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
