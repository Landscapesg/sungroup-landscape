'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Leaf, Sun, Droplets, Thermometer, Sprout,
  Scissors, TreePine, MapPin, AlertTriangle, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react'

export default function PlantDetailPage({ params }: { params: { id: string } }) {
  const [plant, setPlant] = useState<any>(null)
  const [group1, setGroup1] = useState<any>(null)
  const [group2, setGroup2] = useState<any>(null)
  const [sheUnits, setSheUnits] = useState<any[]>([])
  const [climates, setClimates] = useState<any[]>([])
  const [functions, setFunctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    grow: true, tech: false, she: false
  })

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('plants').select('*').eq('id', params.id).single()
      if (!p) { setLoading(false); return }
      setPlant(p)

      const [g1, g2, units, clim, fn] = await Promise.all([
        p.group_lv1_id ? supabase.from('plant_groups').select('*').eq('id', p.group_lv1_id).single() : Promise.resolve({ data: null }),
        p.group_lv2_id ? supabase.from('plant_groups').select('*').eq('id', p.group_lv2_id).single() : Promise.resolve({ data: null }),
        supabase.from('she_units').select('*').order('sort_order'),
        p.climate_ids?.length ? supabase.from('climates').select('*').in('id', p.climate_ids) : Promise.resolve({ data: [] }),
        p.special_function_ids?.length ? supabase.from('special_functions').select('*').in('id', p.special_function_ids) : Promise.resolve({ data: [] }),
      ])
      setGroup1(g1.data)
      setGroup2(g2.data)
      setSheUnits(units.data || [])
      setClimates(clim.data || [])
      setFunctions(fn.data || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  const toggle = (key: string) => setExpanded(e => ({ ...e, [key]: !e[key] }))

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <Leaf size={20} className="animate-pulse text-forest-400" />
        <span>Đang tải...</span>
      </div>
    </div>
  )

  if (!plant) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Leaf size={40} className="mx-auto mb-3 text-gray-200" />
        <p className="text-gray-400">Không tìm thấy cây này</p>
        <Link href="/plants" className="mt-4 inline-flex items-center gap-2 text-forest-600 text-sm hover:underline">
          <ArrowLeft size={14} />Quay lại thư viện
        </Link>
      </div>
    </div>
  )

  const unitObjects = (plant.she_unit_ids || [])
    .map((id: string) => sheUnits.find(u => u.id === id))
    .filter(Boolean)

  const InfoRow = ({ icon: Icon, label, value }: any) => {
    if (!value) return null
    return (
      <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center mt-0.5">
          <Icon size={15} className="text-forest-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-0.5">{label}</div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{value}</div>
        </div>
      </div>
    )
  }

  const Section = ({ id, title, icon: Icon, children }: any) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-forest-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-forest-600" />
          <span className="font-semibold text-gray-700 text-sm">{title}</span>
        </div>
        {expanded[id]
          ? <ChevronUp size={16} className="text-gray-400" />
          : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {expanded[id] && <div className="px-5 pb-4">{children}</div>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ảnh */}
      <div className="relative">
        {plant.cover_image_url ? (
          <div className="h-72 md:h-96 relative overflow-hidden">
            <img src={plant.cover_image_url} alt={plant.name_vi}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-52 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0a280a 0%, #1e6e1e 100%)' }}>
            <Leaf size={64} className="text-green-700 opacity-40" />
          </div>
        )}

        {/* Back button */}
        <Link href="/plants"
          className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full transition-colors">
          <ArrowLeft size={14} />Thư viện
        </Link>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {plant.is_native && (
            <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">🌿 Bản địa</span>
          )}
          {plant.is_endangered && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">⚠️ Nguy cấp</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10 pb-12">

        {/* Card tên cây */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-gray-900 leading-tight">{plant.name_vi}</h1>
              {plant.name_en && <p className="text-gray-400 text-sm mt-0.5">{plant.name_en}</p>}
              {plant.scientific_name && (
                <p className="italic text-forest-600 text-sm mt-1">{plant.scientific_name}</p>
              )}
              {plant.other_names && (
                <p className="text-gray-400 text-xs mt-1">Còn gọi: {plant.other_names}</p>
              )}
            </div>
            {plant.plant_code && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-lg font-mono flex-shrink-0">{plant.plant_code}</span>
            )}
          </div>

          {/* Tags nhóm */}
          <div className="flex flex-wrap gap-2 mt-4">
            {group1 && (
              <span className="bg-forest-50 text-forest-700 text-xs px-3 py-1 rounded-full border border-forest-100 font-medium">
                {group1.name}
              </span>
            )}
            {group2 && (
              <span className="bg-forest-50 text-forest-600 text-xs px-3 py-1 rounded-full border border-forest-100">
                {group2.name}
              </span>
            )}
            {climates.map((c: any) => (
              <span key={c.id} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full border border-blue-100">
                {c.name}
              </span>
            ))}
            {functions.map((f: any) => (
              <span key={f.id} className="bg-amber-50 text-amber-600 text-xs px-3 py-1 rounded-full border border-amber-100">
                {f.name}
              </span>
            ))}
          </div>

          {/* Thống số nhanh */}
          {(plant.height_min_m || plant.height_max_m || plant.flower_color_text || plant.blooming_period_text) && (
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              {(plant.height_min_m || plant.height_max_m) && (
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-800">
                    {plant.height_min_m && plant.height_max_m
                      ? `${plant.height_min_m}–${plant.height_max_m}m`
                      : `${plant.height_min_m || plant.height_max_m}m`}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Chiều cao</div>
                </div>
              )}
              {plant.flower_color_text && (
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <div className="text-sm font-semibold text-gray-800 leading-tight">{plant.flower_color_text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Màu hoa</div>
                </div>
              )}
              {plant.blooming_period_text && (
                <div className="text-center bg-gray-50 rounded-xl p-3 col-span-2">
                  <div className="text-sm font-semibold text-gray-800">{plant.blooming_period_text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Mùa hoa</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Đơn vị SHE */}
        {unitObjects.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-forest-600" />
              <span className="font-semibold text-gray-700 text-sm">Đơn vị Khối SHE đang trồng</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unitObjects.map((u: any) => (
                <div key={u.id} className="flex items-center gap-2 bg-forest-50 border border-forest-100 rounded-xl px-3 py-2">
                  <span className="font-mono text-xs text-forest-500 font-bold">{u.code}</span>
                  <span className="text-xs text-gray-600">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hình ảnh bổ sung */}
        {(plant.flower_leaf_image_url || plant.application_image_url) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {plant.flower_leaf_image_url && (
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <img src={plant.flower_leaf_image_url} alt="Bộ phận cây" className="w-full h-32 object-cover" />
                <div className="text-xs text-gray-400 text-center py-1.5 bg-white">Bộ phận cây</div>
              </div>
            )}
            {plant.application_image_url && (
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <img src={plant.application_image_url} alt="Ứng dụng" className="w-full h-32 object-cover" />
                <div className="text-xs text-gray-400 text-center py-1.5 bg-white">Ứng dụng</div>
              </div>
            )}
          </div>
        )}

        {/* Điều kiện sinh trưởng */}
        {(plant.light_requirement || plant.water_requirement || plant.soil_requirement || plant.temperature_range) && (
          <Section id="grow" title="Điều kiện sinh trưởng" icon={Sun}>
            <InfoRow icon={Sun} label="Ánh sáng" value={plant.light_requirement} />
            <InfoRow icon={Droplets} label="Nước & Độ ẩm" value={plant.water_requirement} />
            <InfoRow icon={Sprout} label="Đất & Dinh dưỡng" value={plant.soil_requirement} />
            <InfoRow icon={Thermometer} label="Nhiệt độ & Khí hậu" value={plant.temperature_range} />
          </Section>
        )}

        {/* Kỹ thuật */}
        {(plant.planting_technique || plant.propagation || plant.landscape_application) && (
          <Section id="tech" title="Kỹ thuật & Ứng dụng cảnh quan" icon={Scissors}>
            <InfoRow icon={Scissors} label="Kỹ thuật trồng & chăm sóc" value={plant.planting_technique} />
            <InfoRow icon={Sprout} label="Nhân giống" value={plant.propagation} />
            <InfoRow icon={TreePine} label="Ứng dụng cảnh quan" value={plant.landscape_application} />
          </Section>
        )}

        {/* Kinh nghiệm SHE */}
        {(plant.she_experience || plant.she_risks) && (
          <Section id="she" title="Kinh nghiệm thực tế Khối SHE" icon={BookOpen}>
            <InfoRow icon={BookOpen} label="Kinh nghiệm thực địa" value={plant.she_experience} />
            <InfoRow icon={AlertTriangle} label="Rủi ro cần lưu ý" value={plant.she_risks} />
          </Section>
        )}

      </div>
    </div>
  )
}
