'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Search, Leaf, TreePine, ArrowLeft, ChevronRight,
  Sun, Droplets, Thermometer, Sprout, Scissors, MapPin,
  AlertTriangle, BookOpen, ChevronDown, X, ExternalLink
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Group {
  id: string
  name: string
  level: number
  parent_id: string | null
  sort_order: number
}
interface Unit {
  id: string
  code: string
  name: string
  sort_order: number
}
interface Plant {
  id: string
  name_vi: string
  scientific_name?: string
  name_en?: string
  other_names?: string
  plant_code?: string
  group_lv1_id?: string
  group_lv2_id?: string
  she_unit_ids?: string[]
  cover_image_url?: string
  flower_leaf_image_url?: string
  application_image_url?: string
  is_native?: boolean
  is_endangered?: boolean
  height_min_m?: number
  height_max_m?: number
  flower_color_text?: string
  blooming_period_text?: string
  light_requirement?: string
  water_requirement?: string
  soil_requirement?: string
  temperature_range?: string
  planting_technique?: string
  propagation?: string
  landscape_application?: string
  she_experience?: string
  she_risks?: string
  status?: string
  g1?: { name: string }
  g2?: { name: string }
  climate_ids?: string[]
  special_function_ids?: string[]
}

// ─── InfoRow (dùng trong detail) ──────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-forest-50 flex items-center justify-center mt-0.5">
        <Icon size={13} className="text-forest-600" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{value}</div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlantsPage() {
  const [allPlants, setAllPlants]   = useState<Plant[]>([])
  const [plants, setPlants]         = useState<Plant[]>([])
  const [groups, setGroups]         = useState<Group[]>([])
  const [sheUnits, setSheUnits]     = useState<Unit[]>([])
  const [loading, setLoading]       = useState(true)

  // sidebar state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [selectedLv1, setSelectedLv1] = useState<string>('') // '' = tất cả
  const [selectedLv2, setSelectedLv2] = useState<string>('')

  // filter / search
  const [search, setSearch]         = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [filterSpecial, setFilterSpecial] = useState<'ban-dia' | 'nguy-cap' | ''>('')

  // detail
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [climates, setClimates]     = useState<any[]>([])
  const [functions, setFunctions]   = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    grow: true, tech: false, she: false
  })

  // ── Load groups & units once ───────────────────────────────────────────────
  useEffect(() => {
    supabase.from('plant_groups').select('*').order('sort_order')
      .then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order')
      .then(({ data }) => setSheUnits(data || []))
  }, [])

  // ── Load plants ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: all } = await supabase
        .from('plants')
        .select('id, name_vi, group_lv1_id, group_lv2_id, she_unit_ids, is_native, is_endangered')
        .eq('status', 'ACTIVE')
      setAllPlants((all || []) as any[])

      let q = supabase
        .from('plants')
        .select('*, g1:plant_groups!group_lv1_id(name), g2:plant_groups!group_lv2_id(name)')
        .eq('status', 'ACTIVE')
        .order('name_vi')

      if (search) q = q.ilike('name_vi', `%${search}%`)
      if (selectedLv1) q = q.eq('group_lv1_id', selectedLv1)
      if (selectedLv2) q = q.eq('group_lv2_id', selectedLv2)

      const { data } = await q
      let result: Plant[] = data || []

      if (selectedUnit)
        result = result.filter(p => (p.she_unit_ids || []).includes(selectedUnit))
      if (filterSpecial === 'ban-dia')
        result = result.filter(p => p.is_native)
      if (filterSpecial === 'nguy-cap')
        result = result.filter(p => p.is_endangered)

      setPlants(result)
      setLoading(false)
    }
    load()
  }, [search, selectedLv1, selectedLv2, selectedUnit, filterSpecial])

  // ── Load full detail khi chọn cây ─────────────────────────────────────────
  const loadDetail = useCallback(async (p: Plant) => {
    setSelectedPlant(p)
    setDetailLoading(true)
    setExpandedSections({ grow: true, tech: false, she: false })

    const { data: full } = await supabase
      .from('plants')
      .select('*')
      .eq('id', p.id)
      .single()

    if (full) {
      const [clim, fn] = await Promise.all([
        full.climate_ids?.length
          ? supabase.from('climates').select('*').in('id', full.climate_ids)
          : Promise.resolve({ data: [] }),
        full.special_function_ids?.length
          ? supabase.from('special_functions').select('*').in('id', full.special_function_ids)
          : Promise.resolve({ data: [] }),
      ])
      setClimates(clim.data || [])
      setFunctions(fn.data || [])
      setSelectedPlant({ ...p, ...full })
    }
    setDetailLoading(false)
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const lv1Groups  = groups.filter(g => g.level === 1)
  const lv2OfGroup = (lv1Id: string) => groups.filter(g => g.level === 2 && g.parent_id === lv1Id)

  const countLv1 = (id: string) => allPlants.filter(p => p.group_lv1_id === id).length
  const countLv2 = (id: string) => allPlants.filter(p => p.group_lv2_id === id).length

  const toggleSidebarGroup = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))

  const selectLv1 = (id: string) => {
    setSelectedLv1(id)
    setSelectedLv2('')
    setSelectedPlant(null)
  }
  const selectLv2 = (lv1Id: string, lv2Id: string) => {
    setSelectedLv1(lv1Id)
    setSelectedLv2(lv2Id)
    setSelectedPlant(null)
    // mở accordion của nhóm cha
    setOpenGroups(prev => ({ ...prev, [lv1Id]: true }))
  }

  const toggleSection = (key: string) =>
    setExpandedSections(e => ({ ...e, [key]: !e[key] }))

  const unitObjects = (selectedPlant?.she_unit_ids || [])
    .map(id => sheUnits.find(u => u.id === id))
    .filter(Boolean) as Unit[]

  const activeGroupName = selectedLv2
    ? groups.find(g => g.id === selectedLv2)?.name
    : selectedLv1
    ? groups.find(g => g.id === selectedLv1)?.name
    : 'Tất cả cây'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f3ee' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0a280a 0%, #1e6e1e 100%)' }} className="px-6 py-5">
        <div className="max-w-screen-xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-green-300 hover:text-white text-xs mb-4 transition-colors">
            <ArrowLeft size={13} />Trang chủ
          </Link>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1">
                <TreePine size={22} className="text-green-300" />
                <h1 className="font-display text-2xl text-white font-semibold">Thư viện Cây cảnh quan</h1>
              </div>
              <p className="text-green-300 text-xs">{allPlants.length} loài cây · Khối Giải trí & Nghỉ dưỡng Sun Group (SHE)</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/95 w-56"
                  placeholder="Tìm tên cây..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Unit filter */}
              <select
                className="bg-white/95 rounded-lg px-3 py-2 text-sm focus:outline-none border-0 text-gray-700"
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
              >
                <option value="">Tất cả đơn vị</option>
                {sheUnits.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN BODY ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex max-w-screen-xl mx-auto w-full" style={{ height: 'calc(100vh - 108px)' }}>

        {/* ── COL 1: SIDEBAR ───────────────────────────────────────────────── */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="py-2">
            {/* Tất cả */}
            <button
              onClick={() => selectLv1('')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-l-2 ${
                !selectedLv1
                  ? 'bg-forest-50 text-forest-700 border-forest-600 font-medium'
                  : 'text-gray-600 border-transparent hover:bg-gray-50'
              }`}
            >
              <span>Tất cả</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedLv1 ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {allPlants.length}
              </span>
            </button>

            <div className="border-t border-gray-100 mt-1 pt-1">
              {lv1Groups.map(g1 => {
                const children = lv2OfGroup(g1.id)
                const isOpen   = openGroups[g1.id]
                const isActive = selectedLv1 === g1.id && !selectedLv2

                return (
                  <div key={g1.id}>
                    {/* Lv1 row */}
                    <div className="flex items-center">
                      <button
                        onClick={() => selectLv1(g1.id)}
                        className={`flex-1 flex items-center justify-between pl-4 pr-2 py-2.5 text-sm transition-colors border-l-2 ${
                          isActive
                            ? 'bg-forest-50 text-forest-700 border-forest-600 font-medium'
                            : 'text-gray-700 border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate text-left">{g1.name}</span>
                        <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{countLv1(g1.id)}</span>
                      </button>
                      {children.length > 0 && (
                        <button
                          onClick={() => toggleSidebarGroup(g1.id)}
                          className="px-2 py-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <ChevronDown size={13} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Lv2 children */}
                    {isOpen && children.map(g2 => (
                      <button
                        key={g2.id}
                        onClick={() => selectLv2(g1.id, g2.id)}
                        className={`w-full flex items-center justify-between pl-8 pr-4 py-2 text-xs transition-colors border-l-2 ${
                          selectedLv2 === g2.id
                            ? 'bg-forest-50 text-forest-700 border-forest-500 font-medium'
                            : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <span className="truncate text-left">{g2.name}</span>
                        <span className="text-gray-400 flex-shrink-0">{countLv2(g2.id)}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ── COL 2: PLANT LIST ────────────────────────────────────────────── */}
        <div className={`flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col ${selectedPlant ? 'w-72' : 'flex-1'}`}>
          {/* List header */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800 truncate">{activeGroupName}</span>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{plants.length} loài</span>
            </div>
            {/* Special filter pills */}
            <div className="flex gap-1.5">
              {(['', 'ban-dia', 'nguy-cap'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterSpecial(f)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filterSpecial === f
                      ? 'bg-forest-600 text-white border-forest-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-forest-300'
                  }`}
                >
                  {f === '' ? 'Tất cả' : f === 'ban-dia' ? 'Bản địa' : 'Nguy cấp'}
                </button>
              ))}
            </div>
          </div>

          {/* Plant rows */}
          <div className="flex-1">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : plants.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Leaf size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Không tìm thấy cây nào</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {plants.map(p => {
                  const isActive = selectedPlant?.id === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => loadDetail(p)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                        isActive
                          ? 'bg-white border-forest-200 shadow-sm'
                          : 'bg-white/60 border-transparent hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      {/* Thumb */}
                      <div className="w-10 h-10 rounded-lg bg-forest-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {p.cover_image_url
                          ? <img src={p.cover_image_url} alt={p.name_vi} className="w-full h-full object-cover" />
                          : <Leaf size={18} className="text-forest-300" />
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isActive ? 'text-forest-700' : 'text-gray-800'}`}>
                          {p.name_vi}
                        </div>
                        {p.scientific_name && (
                          <div className="text-xs italic text-gray-400 truncate">{p.scientific_name}</div>
                        )}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {p.g1 && (
                            <span className="text-xs bg-forest-50 text-forest-600 px-1.5 py-0.5 rounded-full border border-forest-100">
                              {p.g1.name}
                            </span>
                          )}
                          {p.is_native && (
                            <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full border border-green-100">
                              Bản địa
                            </span>
                          )}
                          {p.is_endangered && (
                            <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full border border-red-100">
                              Nguy cấp
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} className={`flex-shrink-0 transition-colors ${isActive ? 'text-forest-500' : 'text-gray-300'}`} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── COL 3: DETAIL PANEL ──────────────────────────────────────────── */}
        {selectedPlant ? (
          <div className="flex-1 bg-white overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                <Leaf size={18} className="animate-pulse text-forest-400" />
                <span className="text-sm">Đang tải...</span>
              </div>
            ) : (
              <>
                {/* Hero image */}
                <div className="relative">
                  {selectedPlant.cover_image_url ? (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={selectedPlant.cover_image_url}
                        alt={selectedPlant.name_vi}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="h-36 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #0a280a 0%, #1e6e1e 100%)' }}>
                      <Leaf size={48} className="text-green-700 opacity-30" />
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full p-1.5 transition-colors"
                  >
                    <X size={14} />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {selectedPlant.is_native && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">🌿 Bản địa</span>
                    )}
                    {selectedPlant.is_endangered && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">⚠️ Nguy cấp</span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {/* Tên cây */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h2 className="font-display text-xl font-bold text-gray-900 leading-tight">
                        {selectedPlant.name_vi}
                      </h2>
                      {selectedPlant.name_en && (
                        <p className="text-gray-400 text-sm mt-0.5">{selectedPlant.name_en}</p>
                      )}
                      {selectedPlant.scientific_name && (
                        <p className="italic text-forest-600 text-sm mt-1">{selectedPlant.scientific_name}</p>
                      )}
                      {selectedPlant.other_names && (
                        <p className="text-gray-400 text-xs mt-1">Còn gọi: {selectedPlant.other_names}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {selectedPlant.plant_code && (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded font-mono">
                          {selectedPlant.plant_code}
                        </span>
                      )}
                      <Link
                        href={`/plants/${selectedPlant.id}`}
                        className="flex items-center gap-1 text-xs text-forest-600 hover:text-forest-800 transition-colors"
                      >
                        <ExternalLink size={12} />Trang đầy đủ
                      </Link>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5 pb-5 border-b border-gray-100">
                    {selectedPlant.g1 && (
                      <span className="bg-forest-50 text-forest-700 text-xs px-2.5 py-1 rounded-full border border-forest-100 font-medium">
                        {selectedPlant.g1.name}
                      </span>
                    )}
                    {selectedPlant.g2 && (
                      <span className="bg-forest-50 text-forest-600 text-xs px-2.5 py-1 rounded-full border border-forest-100">
                        {(selectedPlant as any).g2?.name}
                      </span>
                    )}
                    {climates.map((c: any) => (
                      <span key={c.id} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                        {c.name}
                      </span>
                    ))}
                    {functions.map((f: any) => (
                      <span key={f.id} className="bg-amber-50 text-amber-600 text-xs px-2.5 py-1 rounded-full border border-amber-100">
                        {f.name}
                      </span>
                    ))}
                  </div>

                  {/* Số liệu nhanh */}
                  {(selectedPlant.height_min_m || selectedPlant.height_max_m || selectedPlant.flower_color_text || selectedPlant.blooming_period_text) && (
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {(selectedPlant.height_min_m || selectedPlant.height_max_m) && (
                        <div className="text-center bg-gray-50 rounded-xl p-3">
                          <div className="text-base font-bold text-gray-800">
                            {selectedPlant.height_min_m && selectedPlant.height_max_m
                              ? `${selectedPlant.height_min_m}–${selectedPlant.height_max_m}m`
                              : `${selectedPlant.height_min_m || selectedPlant.height_max_m}m`}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Chiều cao</div>
                        </div>
                      )}
                      {selectedPlant.flower_color_text && (
                        <div className="text-center bg-gray-50 rounded-xl p-3">
                          <div className="text-sm font-semibold text-gray-800 leading-tight">{selectedPlant.flower_color_text}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Màu hoa</div>
                        </div>
                      )}
                      {selectedPlant.blooming_period_text && (
                        <div className="text-center bg-gray-50 rounded-xl p-3 col-span-2">
                          <div className="text-sm font-semibold text-gray-800">{selectedPlant.blooming_period_text}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Mùa hoa</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Đơn vị SHE */}
                  {unitObjects.length > 0 && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-2.5">
                        <MapPin size={13} className="text-forest-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Đơn vị đang trồng</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {unitObjects.map(u => (
                          <div key={u.id} className="flex items-center gap-1.5 bg-forest-50 border border-forest-100 rounded-lg px-2.5 py-1.5">
                            <span className="font-mono text-xs text-forest-600 font-bold">{u.code}</span>
                            <span className="text-xs text-gray-600">{u.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ảnh bổ sung */}
                  {(selectedPlant.flower_leaf_image_url || selectedPlant.application_image_url) && (
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {selectedPlant.flower_leaf_image_url && (
                        <div className="rounded-xl overflow-hidden border border-gray-100">
                          <img src={selectedPlant.flower_leaf_image_url} alt="Bộ phận cây" className="w-full h-24 object-cover" />
                          <div className="text-xs text-gray-400 text-center py-1.5 bg-gray-50">Bộ phận cây</div>
                        </div>
                      )}
                      {selectedPlant.application_image_url && (
                        <div className="rounded-xl overflow-hidden border border-gray-100">
                          <img src={selectedPlant.application_image_url} alt="Ứng dụng" className="w-full h-24 object-cover" />
                          <div className="text-xs text-gray-400 text-center py-1.5 bg-gray-50">Ứng dụng</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Điều kiện sinh trưởng */}
                  {(selectedPlant.light_requirement || selectedPlant.water_requirement || selectedPlant.soil_requirement || selectedPlant.temperature_range) && (
                    <div className="mb-3 border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('grow')}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-forest-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Sun size={14} className="text-forest-600" />
                          <span className="text-sm font-semibold text-gray-700">Điều kiện sinh trưởng</span>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSections.grow ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSections.grow && (
                        <div className="px-4 pb-3">
                          <InfoRow icon={Sun} label="Ánh sáng" value={selectedPlant.light_requirement} />
                          <InfoRow icon={Droplets} label="Nước & Độ ẩm" value={selectedPlant.water_requirement} />
                          <InfoRow icon={Sprout} label="Đất & Dinh dưỡng" value={selectedPlant.soil_requirement} />
                          <InfoRow icon={Thermometer} label="Nhiệt độ" value={selectedPlant.temperature_range} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kỹ thuật */}
                  {(selectedPlant.planting_technique || selectedPlant.propagation || selectedPlant.landscape_application) && (
                    <div className="mb-3 border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('tech')}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-forest-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Scissors size={14} className="text-forest-600" />
                          <span className="text-sm font-semibold text-gray-700">Kỹ thuật & Ứng dụng cảnh quan</span>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSections.tech ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSections.tech && (
                        <div className="px-4 pb-3">
                          <InfoRow icon={Scissors} label="Kỹ thuật trồng & chăm sóc" value={selectedPlant.planting_technique} />
                          <InfoRow icon={Sprout} label="Nhân giống" value={selectedPlant.propagation} />
                          <InfoRow icon={TreePine} label="Ứng dụng cảnh quan" value={selectedPlant.landscape_application} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kinh nghiệm SHE */}
                  {(selectedPlant.she_experience || selectedPlant.she_risks) && (
                    <div className="mb-3 border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('she')}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-forest-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-forest-600" />
                          <span className="text-sm font-semibold text-gray-700">Kinh nghiệm thực tế Khối SHE</span>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSections.she ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSections.she && (
                        <div className="px-4 pb-3">
                          <InfoRow icon={BookOpen} label="Kinh nghiệm thực địa" value={selectedPlant.she_experience} />
                          <InfoRow icon={AlertTriangle} label="Rủi ro cần lưu ý" value={selectedPlant.she_risks} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Empty state khi chưa chọn cây */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 bg-white">
            <Leaf size={40} className="text-gray-200" />
            <p className="text-sm">Chọn một loài cây để xem chi tiết</p>
          </div>
        )}

      </div>
    </div>
  )
}
