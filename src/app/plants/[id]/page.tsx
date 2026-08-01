'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Leaf, TreePine, Pencil } from 'lucide-react'

interface Unit { id: string; code: string; name: string }

export default function PlantDetailPage({ params }: { params: { id: string } }) {
  const [plant, setPlant]         = useState<any>(null)
  const [group1, setGroup1]       = useState<any>(null)
  const [group1b, setGroup1b]     = useState<any>(null)
  const [group2, setGroup2]       = useState<any>(null)
  const [sheUnits, setSheUnits]   = useState<Unit[]>([])
  const [climates, setClimates]   = useState<any[]>([])
  const [functions, setFunctions] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeImg, setActiveImg] = useState<'cover'|'flower'|'app'>('cover')

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('plants').select('*').eq('id', params.id).single()
      if (!p) { setLoading(false); return }
      setPlant(p)
      const [g1, g1b, g2, units, clim, fn] = await Promise.all([
        p.group_lv1_id ? supabase.from('plant_groups').select('*').eq('id', p.group_lv1_id).single() : Promise.resolve({ data: null }),
        p.group_lv1_id_2 ? supabase.from('plant_groups').select('*').eq('id', p.group_lv1_id_2).single() : Promise.resolve({ data: null }),
        p.group_lv2_id ? supabase.from('plant_groups').select('*').eq('id', p.group_lv2_id).single() : Promise.resolve({ data: null }),
        supabase.from('she_units').select('*').order('sort_order'),
        p.climate_ids?.length ? supabase.from('climates').select('*').in('id', p.climate_ids) : Promise.resolve({ data: [] }),
        p.special_function_ids?.length ? supabase.from('special_functions').select('*').in('id', p.special_function_ids) : Promise.resolve({ data: [] }),
      ])
      setGroup1(g1.data); setGroup1b(g1b.data); setGroup2(g2.data)
      setSheUnits(units.data || [])
      setClimates(clim.data || [])
      setFunctions(fn.data || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Leaf size={28} className="text-forest-400 animate-pulse" />
    </div>
  )
  if (!plant) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Leaf size={40} className="mx-auto mb-3 text-gray-200" />
        <p className="text-gray-400 text-sm">Không tìm thấy cây này</p>
        <Link href="/plants" className="mt-4 inline-flex items-center gap-1.5 text-forest-600 text-sm">
          <ArrowLeft size={13} />Quay lại thư viện
        </Link>
      </div>
    </div>
  )

  const unitObjects = (plant.she_unit_ids || [])
    .map((id: string) => sheUnits.find(u => u.id === id)).filter(Boolean)

  const heightText = plant.height_max_m ? `${plant.height_max_m}m` : ''

  const originLabels: Record<string, string> = {
    native: 'Cây bản địa',
    naturalized: 'Cây du nhập đã thích nghi',
    imported: 'Cây ngoại nhập',
  }
  const originText = plant.origin_type ? originLabels[plant.origin_type] || plant.origin_type : ''

  const currentImgUrl =
    activeImg === 'cover'  ? plant.cover_image_url
    : activeImg === 'flower' ? plant.flower_leaf_image_url
    : plant.application_image_url

  const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null
    return (
      <tr className="border-b border-gray-100 last:border-0">
        <td className="py-2 pr-4 text-xs uppercase tracking-wider text-gray-400 font-medium align-top" style={{ width: '120px' }}>{label}</td>
        <td className="py-2 text-sm text-gray-800">{value}</td>
      </tr>
    )
  }

  const Section = ({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) => (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <span className="text-xs font-medium tracking-widest uppercase text-green-700">{letter} — {title}</span>
      </div>
      <div className="px-4 pb-1">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )

  return (
    // Desktop: h-screen flex-col, cột phải cuộn độc lập
    // Mobile: min-h-screen, cuộn toàn trang
    <div className="bg-white flex flex-col" style={{ minHeight: '100vh' }}>

      {/* ── TOPBAR STICKY ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <Link href="/plants"
          className="flex items-center gap-2 text-xs font-medium tracking-wider text-forest-600 uppercase hover:text-forest-800 transition-colors">
          <ArrowLeft size={13} />Thư viện thực vật
        </Link>
        <div className="flex items-center gap-3">
          {plant.plant_code && (
            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded hidden sm:inline">
              {plant.plant_code}
            </span>
          )}
          <Link href={`/admin/plants/${plant.id}`}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <Pencil size={12} />Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="px-4 md:px-6 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {group1 && (
              <span className="bg-forest-600 text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                {group1.name}
              </span>
            )}
            {group1b && (
              <span className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                {group1b.name}
              </span>
            )}
            {plant.plant_code && (
              <span className="border border-gray-200 text-gray-400 text-xs px-2.5 py-1 rounded-full font-mono sm:hidden">
                {plant.plant_code}
              </span>
            )}
            {plant.is_native    && <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full">Bản địa</span>}
            {plant.is_endangered && <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full">Nguy cấp</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2"
            style={{ fontFamily: 'Georgia, serif' }}>
            {plant.name_vi}
          </h1>
          <div className="flex items-center gap-3 flex-wrap text-sm">
            {plant.scientific_name && <span className="italic text-forest-600">{plant.scientific_name}</span>}
            {plant.other_names    && <span className="text-gray-400">Còn gọi: {plant.other_names}</span>}
            {plant.name_en        && <span className="text-xs uppercase tracking-wider text-gray-400">ENG: {plant.name_en}</span>}
          </div>
        </div>
      </div>

      {/* ── BODY ──
          Desktop: flex-row, cột trái cố định + cột phải cuộn riêng
          Mobile:  flex-col, cuộn toàn trang
      ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-5xl mx-auto w-full px-0 md:px-6">

        {/* ─── CỘT TRÁI: ảnh cố định (desktop), full width (mobile) ─── */}
        <div className="md:w-64 md:flex-shrink-0 md:overflow-y-auto md:border-r md:border-gray-100 px-4 md:px-0 md:pr-6 py-5 md:py-6">

          {/* main image */}
          <div className="rounded-xl overflow-hidden mb-3 bg-forest-50 flex items-center justify-center"
            style={{ height: '220px' }}>
            {currentImgUrl
              ? <img src={currentImgUrl} alt={plant.name_vi} className="w-full h-full object-cover" />
              : <Leaf size={56} className="text-forest-200" />
            }
          </div>

          {/* 3 thumbnails */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { key: 'cover'  as const, url: plant.cover_image_url,      label: 'Tổng thể', Icon: Leaf },
              { key: 'flower' as const, url: plant.flower_leaf_image_url, label: 'Hoa / lá', Icon: Leaf },
              { key: 'app'    as const, url: plant.application_image_url, label: 'Ứng dụng', Icon: TreePine },
            ].map(({ key, url, label, Icon }) => (
              <button key={key} onClick={() => setActiveImg(key)} className="flex flex-col items-center gap-1">
                <div className={`w-full rounded-lg overflow-hidden flex items-center justify-center transition-all h-14 ${
                  activeImg === key ? 'ring-2 ring-forest-600' : 'ring-1 ring-gray-200 hover:ring-forest-300'
                } ${url ? '' : 'bg-forest-50'}`}>
                  {url
                    ? <img src={url} alt={label} className="w-full h-full object-cover" />
                    : <Icon size={20} className="text-forest-300" />
                  }
                </div>
                <span className="text-xs text-gray-400">{label}</span>
              </button>
            ))}
          </div>

          {/* mô tả — luôn hiện dưới thumbnail ở cả 2 màn hình */}
          {(plant.description || plant.landscape_application) && (
            <div>
              <div className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-2">
                Mô tả đặc tính loài
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {plant.description || plant.landscape_application}
              </p>
            </div>
          )}
        </div>

        {/* ─── CỘT PHẢI: sections cuộn độc lập (desktop) ─── */}
        <div className="flex-1 min-w-0 md:overflow-y-auto px-4 md:px-0 md:pl-6 py-5 md:py-6">

          <Section letter="A" title="Phân loại">
            <InfoRow label="Nhóm cây"        value={group1?.name} />
            <InfoRow label="Nhóm cây phụ"    value={group1b?.name} />
            <InfoRow label="Phân loại cấp 2" value={group2?.name} />
            {climates.map((c: any)  => <InfoRow key={c.id} label="Khí hậu"   value={c.name} />)}
            {functions.map((f: any) => <InfoRow key={f.id} label="Chức năng" value={f.name} />)}
          </Section>

          <Section letter="B" title="Đặc điểm sinh học">
            <InfoRow label="Chiều cao tối đa"        value={heightText} />
            <InfoRow label="Đường kính thân"         value={plant.trunk_diameter_cm ? `${plant.trunk_diameter_cm} cm` : ''} />
            <InfoRow label="Đường kính tán tối đa"   value={plant.canopy_diameter_max_m ? `${plant.canopy_diameter_max_m} m` : ''} />
            <InfoRow label="Nguồn gốc cây"           value={originText} />
            <InfoRow label="Màu sắc hoa"             value={plant.flower_color_text} />
            <InfoRow label="Thời điểm nở rộ"         value={plant.blooming_period_text} />
            <InfoRow label="Ánh sáng"                value={plant.light_requirement} />
            <InfoRow label="Nước & độ ẩm"            value={plant.water_requirement} />
            <InfoRow label="Đất trồng"               value={plant.soil_requirement} />
            <InfoRow label="Nhiệt độ"                value={plant.temperature_range} />
          </Section>

          {(plant.planting_technique || plant.propagation || plant.landscape_application) && (
            <Section letter="C" title="Kỹ thuật & ứng dụng">
              <InfoRow label="Kỹ thuật trồng"    value={plant.planting_technique} />
              <InfoRow label="Nhân giống"         value={plant.propagation} />
              <InfoRow label="Ứng dụng cảnh quan" value={plant.landscape_application} />
            </Section>
          )}

          {(plant.she_experience || plant.she_risks) && (
            <Section letter="D" title="Kinh nghiệm Khối SHE">
              <InfoRow label="Thực địa" value={plant.she_experience} />
              <InfoRow label="Rủi ro"   value={plant.she_risks} />
            </Section>
          )}

          {unitObjects.length > 0 && (
            <Section letter="E" title="Đơn vị đang trồng">
              {unitObjects.map((u: any) => (
                <InfoRow key={u.id} label={u.code} value={u.name} />
              ))}
            </Section>
          )}

        </div>
      </div>
    </div>
  )
}
