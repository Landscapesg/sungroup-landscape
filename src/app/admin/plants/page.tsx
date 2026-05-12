'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Edit2, Leaf, BarChart2, Download } from 'lucide-react'

export default function AdminPlantsPage() {
  const [plants, setPlants] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [sheUnits, setSheUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedMang, setSelectedMang] = useState('')

  const MANGS = ['Giải trí', 'Nghỉ dưỡng - Tự vận hành', 'Nghỉ dưỡng - Thuê quản lý', 'Sân golf']

  useEffect(() => {
    supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order').then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => setSheUnits(data || []))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('plants').select(`*, g1:plant_groups!group_lv1_id(name)`).order('plant_code')
      if (search) q = q.ilike('name_vi', `%${search}%`)
      if (selectedGroup) q = q.eq('group_lv1_id', selectedGroup)
      const { data } = await q
      let result = data || []
      if (selectedUnit) result = result.filter((p: any) => (p.she_unit_ids || []).includes(selectedUnit))
      if (selectedMang) {
        const unitIds = sheUnits.filter(u => u.mang === selectedMang).map(u => u.id)
        result = result.filter((p: any) => (p.she_unit_ids || []).some((id: string) => unitIds.includes(id)))
      }
      setPlants(result)
      setLoading(false)
    }
    load()
  }, [search, selectedGroup, selectedUnit, selectedMang, sheUnits])

  const filteredUnits = selectedMang ? sheUnits.filter(u => u.mang === selectedMang) : sheUnits

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Quản lý Cây</h1>
          <p className="text-gray-500 text-sm mt-1">{plants.length} loài cây · Khối SHE</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/plants/statistics" className="btn-secondary"><BarChart2 size={15} />Thống kê</Link>
          <Link href="/admin/plants/new" className="btn-primary"><Plus size={16} />Thêm cây mới</Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card p-4 mb-5 flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Tìm tên cây..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">Tất cả nhóm</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="input w-auto" value={selectedMang} onChange={e => { setSelectedMang(e.target.value); setSelectedUnit('') }}>
          <option value="">Tất cả mảng</option>
          {MANGS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="input w-auto" value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}>
          <option value="">Tất cả đơn vị</option>
          {filteredUnits.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã cây</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên tiếng Việt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tên khoa học</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Nhóm</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Đơn vị SHE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <Leaf size={24} className="mx-auto mb-2 animate-pulse text-forest-300" />Đang tải...
              </td></tr>
            ) : plants.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                Không tìm thấy cây nào. <Link href="/admin/plants/new" className="text-forest-600 hover:underline">Thêm cây đầu tiên →</Link>
              </td></tr>
            ) : plants.map((p) => {
              const unitNames = (p.she_unit_ids || []).map((id: string) => sheUnits.find(u => u.id === id)?.code).filter(Boolean)
              return (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.plant_code || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name_vi}</td>
                  <td className="px-4 py-3 italic text-gray-500 hidden md:table-cell text-xs">{p.scientific_name || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {p.g1 ? <span className="bg-forest-50 text-forest-700 text-xs px-2 py-0.5 rounded-full border border-forest-200">{p.g1.name}</span> : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {unitNames.slice(0, 3).map((code: string) => (
                        <span key={code} className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded font-mono">{code}</span>
                      ))}
                      {unitNames.length > 3 && <span className="text-xs text-gray-400">+{unitNames.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.status === 'ACTIVE' ? 'badge-active' : p.status === 'INACTIVE' ? 'badge-inactive' : 'badge-draft'}>
                      {p.status === 'ACTIVE' ? 'Hoạt động' : p.status === 'INACTIVE' ? 'Tạm ngừng' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/plants/${p.id}`} className="p-1.5 rounded-lg hover:bg-forest-50 text-gray-400 hover:text-forest-600 transition-colors inline-flex">
                      <Edit2 size={14} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
