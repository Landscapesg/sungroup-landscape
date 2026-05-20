'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, Leaf, TreePine, List, X, ChevronLeft, ChevronRight, ArrowRight, Home } from 'lucide-react'

interface Group { id: string; name: string; level: number; parent_id: string | null; sort_order: number }
interface Unit  { id: string; code: string; name: string; sort_order: number }
interface Plant {
  id: string; name_vi: string; scientific_name?: string; name_en?: string
  other_names?: string; plant_code?: string; group_lv1_id?: string; group_lv2_id?: string
  she_unit_ids?: string[]; cover_image_url?: string; flower_leaf_image_url?: string
  application_image_url?: string; is_native?: boolean; is_endangered?: boolean
  height_min_m?: number; height_max_m?: number; flower_color_text?: string
  blooming_period_text?: string; light_requirement?: string; water_requirement?: string
  soil_requirement?: string; temperature_range?: string; planting_technique?: string
  propagation?: string; landscape_application?: string; she_experience?: string
  she_risks?: string; status?: string; g1?: { name: string }; g2?: { name: string }
  description?: string
}

type View = 'toc' | 'catalog'

export default function PlantsPage() {
  const [allPlants, setAllPlants] = useState<Plant[]>([])  // toàn bộ, không filter
  const [groups, setGroups]       = useState<Group[]>([])
  const [sheUnits, setSheUnits]   = useState<Unit[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [view, setView]           = useState<View>('toc')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [activeImg, setActiveImg]   = useState<'cover'|'flower'|'app'>('cover')
  const [showSidebar, setShowSidebar] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // load 1 lần duy nhất
  useEffect(() => {
    supabase.from('plant_groups').select('*').order('sort_order').then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => setSheUnits(data || []))
    supabase
      .from('plants')
      .select('*, g1:plant_groups!group_lv1_id(name), g2:plant_groups!group_lv2_id(name)')
      .eq('status', 'ACTIVE').order('name_vi')
      .then(({ data }) => { setAllPlants(data || []); setLoading(false) })
  }, [])

  // filter client-side — instant, không gọi API
  const plants = useMemo(() => {
    if (!search.trim()) return allPlants
    const q = search.toLowerCase()
    return allPlants.filter(p =>
      p.name_vi?.toLowerCase().includes(q) ||
      p.scientific_name?.toLowerCase().includes(q) ||
      p.other_names?.toLowerCase().includes(q)
    )
  }, [allPlants, search])

  useEffect(() => {
    if (view !== 'catalog') return
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === searchRef.current) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCurrentIdx(i => Math.min(i + 1, plants.length - 1))
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   setCurrentIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view, plants.length])

  const current    = plants[currentIdx] || null
  const total      = plants.length
  const lv1Groups  = groups.filter(g => g.level === 1)
  const goToPlant  = (idx: number) => { setCurrentIdx(idx); setActiveImg('cover'); setView('catalog'); setShowSidebar(false) }

  const currentImgUrl = current
    ? (activeImg === 'cover' ? current.cover_image_url : activeImg === 'flower' ? current.flower_leaf_image_url : current.application_image_url)
    : undefined

  const heightText = current
    ? (current.height_min_m && current.height_max_m ? `${current.height_min_m}–${current.height_max_m}m` : current.height_min_m ? `${current.height_min_m}m` : '')
    : ''

  const unitNames = (current?.she_unit_ids || []).map(id => sheUnits.find(u => u.id === id)?.name).filter(Boolean)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#141a10]">

      {/* TOPBAR */}
      <div className="flex-shrink-0 bg-[#0d1109] border-b border-[#2a2e24] px-4 py-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-7 h-7 bg-[#1e2618] rounded flex items-center justify-center hover:bg-[#2a3420] transition-colors">
            <Home size={13} className="text-green-400" />
          </Link>
          <button
            onClick={() => view === 'catalog' ? setShowSidebar(!showSidebar) : null}
            className={`flex items-center gap-1.5 text-sm transition-colors ${view === 'catalog' ? 'text-gray-400 hover:text-white' : 'text-white'}`}
          >
            <List size={15} /><span>Mục Lục</span>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[#1e2618] rounded-lg px-3 py-1.5 border border-[#2a3420]">
          <Search size={13} className="text-gray-500" />
          <input
            ref={searchRef}
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-44"
            placeholder="Tìm cây..."
            value={search}
            onChange={e => { setSearch(e.target.value); setView('toc') }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={12} className="text-gray-500 hover:text-white" />
            </button>
          )}
        </div>
        {view === 'catalog' ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-white font-medium">{currentIdx + 1}</span>/<span>{total}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">{plants.length} loài</div>
        )}
      </div>

      {/* TOC VIEW */}
      {view === 'toc' && (
        <div className="flex-1 overflow-auto flex items-start justify-center py-8 px-4">
          <div className="w-full max-w-3xl bg-[#f8f6ee] rounded-2xl p-8 border border-[#e0dba8]">
            <div className="mb-6 pb-4 border-b border-[#d4cf9a]">
              <div className="text-xs font-medium tracking-[0.2em] text-[#6b8e5a] uppercase mb-2">Khối SHE · Sun Group</div>
              <h1 className="text-4xl font-semibold text-[#1c2018]" style={{ fontFamily: 'Georgia, serif' }}>Mục Lục</h1>
              <p className="text-sm text-[#8a8a72] mt-1">Thư Viện Thực Vật — Botanical Catalog</p>
              <div className="mt-4 h-px bg-[#c8c390]" />
            </div>

            {search && (
              <div className="flex items-center justify-between mb-5 px-3 py-2 bg-[#eef5e0] rounded-lg border border-[#c0dd97]">
                <span className="text-sm text-[#3b6d11]">
                  Tìm thấy <strong>{plants.length}</strong> kết quả cho "<em>{search}</em>"
                </span>
                <button onClick={() => setSearch('')} className="text-xs text-[#6b8e5a] hover:text-[#2d6a30] flex items-center gap-1">
                  <X size={11} />Xoá
                </button>
              </div>
            )}

            <div className="space-y-8 overflow-y-auto" style={{ maxHeight: '62vh' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Leaf size={24} className="text-[#6b8e5a] animate-pulse" />
                </div>
              ) : plants.length === 0 ? (
                <div className="text-center py-12 text-[#9a9a82]">
                  <Leaf size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Không tìm thấy cây nào phù hợp</p>
                </div>
              ) : lv1Groups.map((g1, gi) => {
                const gPlants = plants.filter(p => p.group_lv1_id === g1.id)
                if (!gPlants.length) return null
                const shown = search ? gPlants : gPlants.slice(0, 6)
                const rest  = search ? 0 : gPlants.length - 6
                return (
                  <div key={g1.id}>
                    <div className="flex items-baseline gap-4 mb-3">
                      <span className="text-xs font-bold text-[#2d6a30] bg-[#d4ebbb] px-2 py-0.5 rounded">{String(gi + 1).padStart(2, '0')}</span>
                      <h2 className="text-lg font-semibold text-[#1c2018]" style={{ fontFamily: 'Georgia, serif' }}>{g1.name}</h2>
                      <span className="text-sm text-[#8a8a72] ml-2">{gPlants.length} loài</span>
                      <div className="flex-1 border-b border-dotted border-[#c8c390] mb-1" />
                    </div>
                    <div className="pl-8 space-y-1">
                      {shown.map((p, pi) => {
                        const globalIdx = plants.findIndex(x => x.id === p.id)
                        return (
                          <button key={p.id} onClick={() => goToPlant(globalIdx)}
                            className="w-full flex items-center justify-between py-1.5 text-left group hover:bg-[#eef5e0] rounded px-2 -mx-2 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-[#b4b2a0] text-xs w-5 text-right flex-shrink-0">{pi + 1}.</span>
                              <span className="text-sm text-[#2c3428] group-hover:text-[#2d6a30] transition-colors">{p.name_vi}</span>
                            </div>
                            <span className="text-xs italic text-[#9a9a82] ml-4 truncate max-w-[220px] flex-shrink-0">{p.scientific_name}</span>
                          </button>
                        )
                      })}
                      {rest > 0 && (
                        <button onClick={() => goToPlant(plants.findIndex(p => p.group_lv1_id === g1.id))}
                          className="text-xs text-[#2d6a30] pl-8 mt-1 hover:underline">
                          + {rest} loài khác...
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-center text-[#9a9a82] mt-6">← → để lật trang · Click Mục Lục để nhảy chương</p>
          </div>
        </div>
      )}

      {/* CATALOG VIEW */}
      {view === 'catalog' && (
        <div className="flex-1 flex relative overflow-hidden">
          {showSidebar && (
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white z-40 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>Mục Lục</span>
                <button onClick={() => setShowSidebar(false)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={12} className="text-gray-500" />
                </button>
              </div>
              <button onClick={() => { setView('toc'); setShowSidebar(false) }}
                className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-xs text-forest-600 hover:bg-forest-50 transition-colors">
                <Home size={12} />Trang đầu / Mục lục
              </button>
              <div className="flex-1 overflow-y-auto py-2">
                {lv1Groups.map((g1, gi) => {
                  const gPlants = allPlants.filter(p => p.group_lv1_id === g1.id)
                  if (!gPlants.length) return null
                  return (
                    <div key={g1.id} className="mb-4">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <span className="w-6 h-6 bg-forest-600 text-white text-xs font-medium rounded flex items-center justify-center flex-shrink-0">{String(gi + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-medium text-gray-800">{g1.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{gPlants.length}</span>
                      </div>
                      {gPlants.map((p, pi) => {
                        const globalIdx = allPlants.findIndex(x => x.id === p.id)
                        return (
                          <button key={p.id} onClick={() => goToPlant(globalIdx)}
                            className={`w-full flex items-center justify-between px-4 py-1.5 text-left transition-colors hover:bg-forest-50 ${globalIdx === currentIdx ? 'bg-forest-50 text-forest-700' : ''}`}>
                            <span className="text-sm text-gray-600"><span className="text-gray-300 mr-2 text-xs">{pi + 1}.</span>{p.name_vi}</span>
                            <span className="text-xs text-gray-400 italic ml-2 truncate max-w-[90px]">{p.scientific_name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!current ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p className="text-sm">Không tìm thấy cây nào</p>
            </div>
          ) : (
            <>
              <div className="w-[52%] flex-shrink-0 relative overflow-hidden">
                {currentImgUrl
                  ? <img src={currentImgUrl} alt={current.name_vi} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#1a2e10] flex items-center justify-center"><Leaf size={80} className="text-green-900 opacity-20" /></div>
                }
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(5,12,3,.85) 0%,transparent 55%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs font-medium tracking-widest text-green-400 uppercase mb-1">{current.g1?.name}{(current as any).g2?.name ? ` · ${(current as any).g2.name}` : ''}</div>
                  <div className="text-2xl font-semibold text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{current.name_vi}</div>
                  <div className="text-sm italic text-white/50 mt-1">{current.scientific_name}</div>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {(['cover','flower','app'] as const).map(key => {
                    const url = key === 'cover' ? current.cover_image_url : key === 'flower' ? current.flower_leaf_image_url : current.application_image_url
                    const label = key === 'cover' ? 'Tổng thể' : key === 'flower' ? 'Hoa / lá' : 'Ứng dụng'
                    return (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <button onClick={() => setActiveImg(key)}
                          className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center transition-all ${activeImg === key ? 'ring-2 ring-white' : 'ring-1 ring-white/20 opacity-60 hover:opacity-90'} ${url ? '' : 'bg-[#2a3a1a]'}`}>
                          {url ? <img src={url} alt={label} className="w-full h-full object-cover" /> : <Leaf size={14} className="text-green-500" />}
                        </button>
                        <span className="text-white/40 text-[9px]">{label}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  {current.is_native && <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">Bản địa</span>}
                  {current.is_endangered && <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded-full">Nguy cấp</span>}
                </div>
                <button onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))} disabled={currentIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 disabled:opacity-20 rounded-full flex items-center justify-center">
                  <ChevronLeft size={18} className="text-white" />
                </button>
                <button onClick={() => setCurrentIdx(i => Math.min(i + 1, total - 1))} disabled={currentIdx === total - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 disabled:opacity-20 rounded-full flex items-center justify-center">
                  <ChevronRight size={18} className="text-white" />
                </button>
              </div>

              <div className="flex-1 bg-[#f8f6f0] overflow-y-auto">
                <div className="p-6">
                  {current.plant_code && <span className="inline-block font-mono text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded mb-4">{current.plant_code}</span>}
                  <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-1" style={{ fontFamily: 'Georgia, serif' }}>{current.name_vi}</h1>
                  {current.scientific_name && <p className="italic text-forest-600 text-sm mb-1">{current.scientific_name}</p>}
                  {current.other_names && <p className="text-xs text-gray-400 mb-4">Còn gọi: {current.other_names}</p>}
                  <table className="w-full mb-5" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      {heightText && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium w-32">Chiều cao</td><td className="py-2 text-sm font-medium text-gray-800">{heightText}</td></tr>}
                      {current.flower_color_text && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Màu hoa</td><td className="py-2 text-sm font-medium text-gray-800">{current.flower_color_text}</td></tr>}
                      {current.blooming_period_text && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Nở rộ</td><td className="py-2 text-sm font-medium text-gray-800">{current.blooming_period_text}</td></tr>}
                      {current.temperature_range && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Khí hậu</td><td className="py-2 text-sm font-medium text-gray-800">{current.temperature_range}</td></tr>}
                      {current.light_requirement && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Ánh sáng</td><td className="py-2 text-sm font-medium text-gray-800">{current.light_requirement}</td></tr>}
                      {current.water_requirement && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Độ ẩm</td><td className="py-2 text-sm font-medium text-gray-800">{current.water_requirement}</td></tr>}
                      {unitNames.length > 0 && <tr className="border-b border-gray-200"><td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Đơn vị trồng</td><td className="py-2 text-sm font-medium text-gray-800">{unitNames.join(', ')}</td></tr>}
                    </tbody>
                  </table>
                  {(current.description || current.landscape_application) && (
                    <div className="mb-5">
                      <div className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">Mô tả</div>
                      <p className="text-sm text-gray-600 leading-relaxed">{current.description || current.landscape_application}</p>
                    </div>
                  )}
                  <Link href={`/plants/${current.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 tracking-wider hover:text-forest-900 transition-colors uppercase">
                    Xem chi tiết đầy đủ <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e2618]">
            <div className="h-full bg-green-600 transition-all duration-300" style={{ width: total ? `${((currentIdx + 1) / total) * 100}%` : '0%' }} />
          </div>
        </div>
      )}
    </div>
  )
}
