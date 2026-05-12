'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, Leaf, TreePine, ArrowLeft } from 'lucide-react'

export default function PlantsPage() {
  const [plants, setPlants] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [sheUnits, setSheUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')

  useEffect(() => {
    supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order').then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => setSheUnits(data || []))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('plants').select(`*, g1:plant_groups!group_lv1_id(name)`).eq('status', 'ACTIVE').order('name_vi')
      if (search) q = q.ilike('name_vi', `%${search}%`)
      if (selectedGroup) q = q.eq('group_lv1_id', selectedGroup)
      const { data } = await q
      let result = data || []
      if (selectedUnit) result = result.filter((p: any) => (p.she_unit_ids || []).includes(selectedUnit))
      setPlants(result)
      setLoading(false)
    }
    load()
  }, [search, selectedGroup, selectedUnit])

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #0a280a 0%, #1e6e1e 100%)' }} className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-green-200 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} />Trang chủ
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <TreePine size={28} className="text-green-300" />
            <h1 className="font-display text-3xl text-white">Thư viện Cây cảnh quan</h1>
          </div>
          <p className="text-green-200 text-sm mb-6">{plants.length} loài cây · Khối Giải trí & Nghỉ dưỡng Sun Group (SHE)</p>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-11 pr-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg"
                placeholder="Tìm tên cây..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-white rounded-xl px-4 py-3 text-sm focus:outline-none shadow-lg border-0"
              value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}>
              <option value="">Tất cả đơn vị</option>
              {sheUnits.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedGroup('')}
            className={`text-sm px-4 py-2 rounded-full border transition-colors font-medium ${!selectedGroup ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
            Tất cả ({plants.length})
          </button>
          {groups.map(g => (
            <button key={g.id} onClick={() => setSelectedGroup(selectedGroup === g.id ? '' : g.id)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors font-medium ${selectedGroup === g.id ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
              {g.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="bg-white rounded-xl h-44 animate-pulse border border-gray-100" />)}
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Leaf size={40} className="mx-auto mb-3 text-gray-200" />
            <p>Không tìm thấy cây nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {plants.map((p) => {
              const unitCodes = (p.she_unit_ids || []).map((id: string) => sheUnits.find(u => u.id === id)?.code).filter(Boolean)
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-forest-200 transition-all group">
                  <div className="h-36 bg-forest-50 flex items-center justify-center group-hover:bg-forest-100 transition-colors relative">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt={p.name_vi} className="w-full h-full object-cover" />
                    ) : <Leaf size={32} className="text-forest-300" />}
                    {p.is_native && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">Bản địa</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-gray-800 text-sm leading-tight">{p.name_vi}</div>
                    {p.scientific_name && <div className="italic text-gray-400 text-xs mt-0.5 truncate">{p.scientific_name}</div>}
                    {p.g1 && <div className="mt-1.5"><span className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full border border-forest-100">{p.g1.name}</span></div>}
                    {unitCodes.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1.5">
                        {unitCodes.slice(0, 3).map((code: string) => (
                          <span key={code} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">{code}</span>
                        ))}
                        {unitCodes.length > 3 && <span className="text-xs text-gray-400">+{unitCodes.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
