'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, Leaf, List, X, ChevronLeft, ChevronRight, ArrowRight, Home, SlidersHorizontal } from 'lucide-react'

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
  const [allPlants, setAllPlants] = useState<Plant[]>([])
  const [groups, setGroups]       = useState<Group[]>([])
  const [sheUnits, setSheUnits]   = useState<Unit[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [view, setView]           = useState<View>('toc')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [activeImg, setActiveImg]   = useState<'cover'|'flower'|'app'>('cover')
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all') // group_lv1_id hoặc 'all'
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('plant_groups').select('*').order('sort_order').then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => setSheUnits(data || []))
    supabase
      .from('plants')
      .select('*, g1:plant_groups!group_lv1_id(name), g2:plant_groups!group_lv2_id(name)')
      .eq('status', 'ACTIVE').order('name_vi')
      .then(({ data }) => { setAllPlants(data || []); setLoading(false) })
  }, [])

  const plants = useMemo(() => {
    let list = allPlants
    if (activeFilter !== 'all') list = list.filter(p => p.group_lv1_id === activeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name_vi?.toLowerCase().includes(q) ||
        p.scientific_name?.toLowerCase().includes(q) ||
        p.other_names?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allPlants, search, activeFilter])

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
      <div className="flex-shrink-0 bg-[#0d1109] border-b border-[#2a2e24] px-3 sm:px-4 py-2 flex items-center gap-2 z-30">
        <Link href="/" className="w-7 h-7 bg-[#1e2618] rounded flex items-center justify-center hover:bg-[#2a3420] transition-colors flex-shrink-0">
          <Home size={13} className="text-green-400" />
        </Link>
        <button
          onClick={() => view === 'catalog' ? setShowSidebar(!showSidebar) : null}
          className={`flex items-center gap-1.5 text-sm transition-colors flex-shrink-0 ${view === 'catalog' ? 'text-gray-400 hover:text-white' : 'text-white'}`}
        >
          <List size={15} /><span className="hidden xs:inline">Mục Lục</span>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-[#1e2618] rounded-lg px-3 py-1.5 border border-[#2a3420] min-w-0">
          <Search size={13} className="text-gray-500 flex-shrink-0" />
          <input
            ref={searchRef}
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full min-w-0"
            placeholder="Tìm cây..."
            value={search}
            onChange={e => { setSearch(e.target.value); setView('toc') }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="flex-shrink-0">
              <X size={12} className="text-gray-500 hover:text-white" />
            </button>
          )}
        </div>
        {view === 'catalog' ? (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 flex-shrink-0">
            <span className="text-white font-medium">{currentIdx + 1}</span>/<span>{total}</span>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">{plants.length} loài</div>
        )}
      </div>

      {/* TOC VIEW — danh sách dạng list, full width trên mobile */}
      {view === 'toc' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Filter chips ngang — cuộn ngang trên mobile */}
          <div className="flex-shrink-0 bg-[#0d1109] border-b border-[#2a2e24] px-3 sm:px-4 py-2.5">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${activeFilter === 'all' ? 'bg-green-700 text-white border-green-700' : 'bg-transparent text-gray-400 border-[#2a3420] hover:border-green-700'}`}>
                Tất cả
              </button>
              {lv1Groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveFilter(g.id)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${activeFilter === g.id ? 'bg-green-700 text-white border-green-700' : 'bg-transparent text-gray-400 border-[#2a3420] hover:border-green-700'}`}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-5">
            <div className="max-w-2xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Leaf size={24} className="text-green-600 animate-pulse" />
                </div>
              ) : plants.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Leaf size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Không tìm thấy cây nào phù hợp</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {plants.map((p, idx) => (
                    <button key={p.id} onClick={() => goToPlant(idx)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 text-left rounded-lg hover:bg-[#1e2618] transition-colors group">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1e2618] flex items-center justify-center">
                        {p.cover_image_url
                          ? <img src={p.cover_image_url} alt={p.name_vi} className="w-full h-full object-cover" />
                          : <Leaf size={16} className="text-green-700" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-100 font-medium truncate group-hover:text-green-400 transition-colors">{p.name_vi}</p>
                        <p className="text-xs text-gray-500 italic truncate">{p.scientific_name}</p>
                      </div>
                      <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:inline">{(p as any).g1?.name}</span>
                      <ChevronRight size={14} className="text-gray-700 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATALOG VIEW */}
      {view === 'catalog' && (
        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">

          {/* Sidebar mục lục — full screen overlay trên mobile, panel cố định trên desktop */}
          {showSidebar && (
            <div className="absolute inset-0 md:left-0 md:top-0 md:bottom-0 md:right-auto md:w-72 bg-white z-40 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <span className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>Mục Lục</span>
                <button onClick={() => setShowSidebar(false)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={13} className="text-gray-500" />
                </button>
              </div>
              <button onClick={() => { setView('toc'); setShowSidebar(false) }}
                className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 text-xs text-forest-600 hover:bg-forest-50 transition-colors flex-shrink-0">
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
                            className={`w-full flex items-center justify-between px-4 py-2 sm:py-1.5 text-left transition-colors hover:bg-forest-50 ${globalIdx === currentIdx ? 'bg-forest-50 text-forest-700' : ''}`}>
                            <span className="text-sm text-gray-600 truncate pr-2"><span className="text-gray-300 mr-2 text-xs">{pi + 1}.</span>{p.name_vi}</span>
                            <span className="text-xs text-gray-400 italic ml-2 truncate max-w-[90px] flex-shrink-0">{p.scientific_name}</span>
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
              {/* Ảnh — full width trên mobile (chiều cao cố định), 52% width trên desktop */}
              <div className="w-full h-[42vh] md:h-auto md:w-[48%] lg:w-[52%] flex-shrink-0 relative overflow-hidden">
                {currentImgUrl
                  ? <img src={currentImgUrl} alt={current.name_vi} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#1a2e10] flex items-center justify-center"><Leaf size={64} className="text-green-900 opacity-20" /></div>
                }
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(5,12,3,.85) 0%,transparent 55%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="text-xs font-medium tracking-widest text-green-400 uppercase mb-1 truncate">{(current as any).g1?.name}{(current as any).g2?.name ? ` · ${(current as any).g2.name}` : ''}</div>
                  <div className="text-xl sm:text-2xl font-semibold text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{current.name_vi}</div>
                  <div className="text-sm italic text-white/50 mt-1">{current.scientific_name}</div>
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
                  {(['cover','flower','app'] as const).map(key => {
                    const url = key === 'cover' ? current.cover_image_url : key === 'flower' ? current.flower_leaf_image_url : current.application_image_url
                    const label = key === 'cover' ? 'Tổng thể' : key === 'flower' ? 'Hoa / lá' : 'Ứng dụng'
                    return (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <button onClick={() => setActiveImg(key)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md overflow-hidden flex items-center justify-center transition-all ${activeImg === key ? 'ring-2 ring-white' : 'ring-1 ring-white/20 opacity-60 hover:opacity-90'} ${url ? '' : 'bg-[#2a3a1a]'}`}>
                          {url ? <img src={url} alt={label} className="w-full h-full object-cover" /> : <Leaf size={12} className="text-green-500" />}
                        </button>
                        <span className="text-white/40 text-[8px] sm:text-[9px] hidden sm:block">{label}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1">
                  {current.is_native && <span className="bg-green-700 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full">Bản địa</span>}
                  {current.is_endangered && <span className="bg-red-700 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full">Nguy cấp</span>}
                </div>
                <button onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))} disabled={currentIdx === 0}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/40 hover:bg-black/60 disabled:opacity-20 rounded-full flex items-center justify-center">
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <button onClick={() => setCurrentIdx(i => Math.min(i + 1, total - 1))} disabled={currentIdx === total - 1}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/40 hover:bg-black/60 disabled:opacity-20 rounded-full flex items-center justify-center">
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>

              {/* Nội dung chi tiết — cuộn riêng, full width trên mobile */}
              <div className="flex-1 bg-[#f8f6f0] overflow-y-auto min-h-0">
                <div className="p-4 sm:p-6 max-w-xl mx-auto md:max-w-none">
                  {current.plant_code && <span className="inline-block font-mono text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded mb-4">{current.plant_code}</span>}
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight mb-1" style={{ fontFamily: 'Georgia, serif' }}>{current.name_vi}</h1>
                  {current.scientific_name && <p className="italic text-forest-600 text-sm mb-1">{current.scientific_name}</p>}
                  {current.other_names && <p className="text-xs text-gray-400 mb-4">Còn gọi: {current.other_names}</p>}

                  {/* Grid 2 cột trên mobile thay vì table — dễ đọc hơn trên màn hình hẹp */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
                    {heightText && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{heightText}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Chiều cao</p>
                      </div>
                    )}
                    {current.flower_color_text && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{current.flower_color_text}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Màu hoa/lá</p>
                      </div>
                    )}
                    {current.blooming_period_text && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{current.blooming_period_text}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Thời gian nở</p>
                      </div>
                    )}
                    {current.temperature_range && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{current.temperature_range}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Khí hậu</p>
                      </div>
                    )}
                    {current.light_requirement && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{current.light_requirement}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Ánh sáng</p>
                      </div>
                    )}
                    {current.water_requirement && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{current.water_requirement}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Độ ẩm</p>
                      </div>
                    )}
                    {unitNames.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-100 col-span-2">
                        <p className="text-sm font-medium text-gray-800">{unitNames.join(', ')}</p>
                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mt-0.5">Đơn vị trồng</p>
                      </div>
                    )}
                  </div>

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
