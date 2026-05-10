'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Edit2, Leaf } from 'lucide-react'

export default function AdminPlantsPage() {
  const [plants, setPlants] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order')
      .then(({ data }) => setGroups(data || []))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('plants').select(`*, g1:plant_groups!group_lv1_id(name)`).order('plant_code')
      if (search) q = q.ilike('name_vi', `%${search}%`)
      if (selectedGroup) q = q.eq('group_lv1_id', selectedGroup)
      const { data } = await q
      setPlants(data || [])
      setLoading(false)
    }
    load()
  }, [search, selectedGroup])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Quản lý Cây</h1>
          <p className="text-gray-500 text-sm mt-1">{plants.length} loài cây</p>
        </div>
        <Link href="/admin/plants/new" className="btn-primary">
          <Plus size={16} /> Thêm cây mới
        </Link>
      </div>

      {/* Filter bar */}
      <div className="card p-4 mb-5 flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Tìm tên cây..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select className="input w-auto" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
            <option value="">Tất cả nhóm</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                <Leaf size={24} className="mx-auto mb-2 animate-pulse text-forest-300" />
                Đang tải...
              </td></tr>
            ) : plants.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                Chưa có cây nào. <Link href="/admin/plants/new" className="text-forest-600 hover:underline">Thêm cây đầu tiên →</Link>
              </td></tr>
            ) : plants.map((p) => (
              <tr key={p.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.plant_code || '—'}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.name_vi}</td>
                <td className="px-4 py-3 italic text-gray-500 hidden md:table-cell text-xs">{p.scientific_name || '—'}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {p.g1 ? <span className="bg-forest-50 text-forest-700 text-xs px-2 py-0.5 rounded-full border border-forest-200">{p.g1.name}</span> : '—'}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
