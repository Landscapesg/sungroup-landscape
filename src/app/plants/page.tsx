'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, Leaf, TreePine, List, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

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
  climate_ids?: string[]; special_function_ids?: string[]
  description?: string
}

export default function PlantsPage() {
  const [plants, setPlants]     = useState<Plant[]>([])
  const [groups, setGroups]     = useState<Group[]>([])
  const [sheUnits, setSheUnits] = useState<Unit[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [activeImg, setActiveImg]   = useState<'cover'|'flower'|'app'>('cover')
  const [showToc, setShowToc]       = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // load
  useEffect(() => {
    supabase.from('plant_groups').select('*').order('sort_order').then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => setSheUnits(data || []))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase
        .from('plants')
        .select('*, g1:plant_groups!group_lv1_id(name), g2:plant_groups!group_lv2_id(name)')
        .eq('status', 'ACTIVE')
        .order('name_vi')
      if (search) q = q.ilike('name_vi', `%${search}%`)
      const { data } = await q
      setPlants(data || [])
      setCurrentIdx(0)
      setLoading(false)
    }
    load()
  }, [search])

  // keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target === searchRef.current) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [plants, currentIdx])

  const current = plants[currentIdx] || null
  const total   = plants.length

  const next = () => { setCurrentIdx(i => Math.min(i + 1, total - 1)); setActiveImg('cover') }
  const prev = () => { setCurrentIdx(i => Math.max(i - 1, 0)); setActiveImg('cover') }
  const goTo = (idx: number) => { setCurrentIdx(idx); setActiveImg('cover'); setShowToc(false) }

  const lv1Groups = groups.filter(g => g.level === 1)

  // group plants by lv1
  const plantsByGroup = (g1Id: string) => plants.filter(p => p.group_lv1_id === g1Id)

  const currentImgUrl = current
    ? (activeImg === 'cover'  ? current.cover_image_url
     : activeImg === 'flower' ? current.flower_leaf_image_url
     : current.application_image_url)
    : undefined

  const heightText = current
    ? (current.height_min_m && current.height_max_m
        ? `${current.height_min_m}–${current.height_max_m}m`
        : current.height_min_m ? `${current.height_min_m}m` : '')
    : ''

  const unitNames = (current?.she_unit_ids || [])
    .map(id => sheUnits.find(u => u.id === id)?.name).filter(Boolean)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#141a10]">

      {/* TOPBAR */}
      <div className="flex-shrink-0 bg-[#0d1109] border-b border-[#2a2e24] px-4 py-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-7 h-7 bg-[#1e2618] rounded flex items-center justify-center hover:bg-[#2a3420] transition-colors">
            <TreePine size={14} className="text-green-400" />
          </Link>
          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <List size={15} />
            <span>Mục Lục</span>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[#1e2618] rounded-lg px-3 py-1.5 border border-[#2a3420]">
          <Search size={13} className="text-gray-500" />
          <input
            ref={searchRef}
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-48"
            placeholder="Tìm cây..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="text-white font-medium">{currentIdx + 1}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* TOC SIDEBAR */}
        {showToc && (
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white z-40 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-serif text-lg font-semibold text-gray-800">Mục Lục</span>
              <button onClick={() => setShowToc(false)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={12} className="text-gray-500" />
              </button>
            </div>
            <div className="px-4 py-2 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-1.5 text-xs text-forest-600">
                <TreePine size={12} />Trang đầu / Mục lục
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {lv1Groups.map((g1, gi) => {
                const gPlants = plantsByGroup(g1.id)
                if (!gPlants.length) return null
                return (
                  <div key={g1.id} className="mb-4">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <span className="w-6 h-6 bg-forest-600 text-white text-xs font-medium rounded flex items-center justify-center flex-shrink-0">
                        {String(gi + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{g1.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{gPlants.length}</span>
                    </div>
                    {gPlants.map((p, pi) => {
                      const globalIdx = plants.findIndex(x => x.id === p.id)
                      return (
                        <button key={p.id} onClick={() => goTo(globalIdx)}
                          className={`w-full flex items-center justify-between px-4 py-1.5 text-left transition-colors hover:bg-forest-50 ${
                            globalIdx === currentIdx ? 'bg-forest-50 text-forest-700' : ''
                          }`}>
                          <span className="text-sm text-gray-600">
                            <span className="text-gray-300 mr-2 text-xs">{pi + 1}.</span>
                            {p.name_vi}
                          </span>
                          <span className="text-xs text-gray-400 italic ml-2 truncate max-w-[100px]">{p.scientific_name}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CATALOG VIEW */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Leaf size={32} className="text-green-800 animate-pulse" />
          </div>
        ) : !current ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <p>Không tìm thấy cây nào</p>
          </div>
        ) : (
          <div className="flex-1 flex">

            {/* LEFT: ảnh lớn */}
            <div className="w-[52%] flex-shrink-0 relative overflow-hidden">
              {currentImgUrl ? (
                <img src={currentImgUrl} alt={current.name_vi} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a2e10] flex items-center justify-center">
                  <Leaf size={80} className="text-green-900 opacity-20" />
                </div>
              )}
              {/* overlay gradient */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,12,3,0.85) 0%, transparent 55%)' }} />

              {/* tên cây đè lên ảnh — góc dưới */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-xs font-medium tracking-widest text-green-400 uppercase mb-1">
                  {current.g1?.name}{current.g2 ? ` · ${(current as any).g2?.name}` : ''}
                </div>
                <div className="text-2xl font-semibold text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {current.name_vi}
                </div>
                <div className="text-sm italic text-white/50 mt-1">{current.scientific_name}</div>
              </div>

              {/* 3 thumbnails dọc góc phải */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {[
                  { key: 'cover' as const, icon: Leaf, label: 'Tổng thể', url: current.cover_image_url },
                  { key: 'flower' as const, icon: Leaf, label: 'Hoa / lá', url: current.flower_leaf_image_url },
                  { key: 'app' as const, icon: TreePine, label: 'Ứng dụng', url: current.application_image_url },
                ].map(({ key, icon: Icon, label, url }) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setActiveImg(key)}
                      className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center transition-all ${
                        activeImg === key ? 'ring-2 ring-white' : 'ring-1 ring-white/20 opacity-60 hover:opacity-90'
                      } ${url ? '' : 'bg-[#2a3a1a]'}`}
                    >
                      {url
                        ? <img src={url} alt={label} className="w-full h-full object-cover" />
                        : <Icon size={14} className="text-green-500" />}
                    </button>
                    <span className="text-white/40 text-[9px]">{label}</span>
                  </div>
                ))}
              </div>

              {/* badge bản địa / nguy cấp */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {current.is_native && <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">Bản địa</span>}
                {current.is_endangered && <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">Nguy cấp</span>}
              </div>

              {/* nav arrows */}
              <button onClick={prev} disabled={currentIdx === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 disabled:opacity-20 rounded-full flex items-center justify-center transition-all">
                <ChevronLeft size={18} className="text-white" />
              </button>
              <button onClick={next} disabled={currentIdx === total - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 disabled:opacity-20 rounded-full flex items-center justify-center transition-all">
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>

            {/* RIGHT: thông tin */}
            <div className="flex-1 bg-[#f8f6f0] overflow-y-auto">
              <div className="p-6">
                {/* code */}
                {current.plant_code && (
                  <span className="inline-block font-mono text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded mb-4">{current.plant_code}</span>
                )}

                {/* tên */}
                <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  {current.name_vi}
                </h1>
                {current.scientific_name && <p className="italic text-forest-600 text-sm mb-1">{current.scientific_name}</p>}
                {current.other_names && <p className="text-xs text-gray-400 mb-4">Còn gọi: {current.other_names}</p>}

                {/* bảng thông số nhanh */}
                <table className="w-full mb-5" style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    {heightText && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium w-32">Chiều cao</td>
                        <td className="py-2 text-sm font-medium text-gray-800">{heightText}</td>
                      </tr>
                    )}
                    {current.flower_color_text && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Màu hoa</td>
                        <td className="py-2 text-sm font-medium text-gray-800">{current.flower_color_text}</td>
                      </tr>
                    )}
                    {current.blooming_period_text && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Nở rộ</td>
                        <td className="py-2 text-sm font-medium text-gray-800">{current.blooming_period_text}</td>
                      </tr>
                    )}
                    {current.temperature_range && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Khí hậu</td>
                        <td className="py-2 text-sm font-medium text-gray-800">{current.temperature_range}</td>
                      </tr>
                    )}
                    {current.light_requirement && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Ánh sáng</td>
                        <td className="py-2 text-sm font-medium text-gray-800">{current.light_requirement}</td>
                      </tr>
                    )}
                    {unitNames.length > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-xs uppercase tracking-wider text-green-700 font-medium">Đơn vị trồng</td>
                        <td className="py-2 text-sm font-medium text-gray-800">{unitNames.join(', ')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* mô tả */}
                {(current.description || current.landscape_application) && (
                  <div className="mb-5">
                    <div className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">Mô tả</div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {current.description || current.landscape_application}
                    </p>
                  </div>
                )}

                {/* link chi tiết */}
                <Link href={`/plants/${current.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 tracking-wider hover:text-forest-900 transition-colors uppercase">
                  Xem chi tiết đầy đủ <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e2618]">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: total ? `${((currentIdx + 1) / total) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
