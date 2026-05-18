'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, Building2, Check, ChevronDown, ChevronUp } from 'lucide-react'

const GROUPS = [
  { id: '6c0c1a87-fa98-42d9-af41-7b337fd16b86', name: 'Cây cảnh quan lớn', children: [
    { id: '45694ce4-48de-4060-9e50-80e2e9421208', name: 'Thường xanh' },
    { id: 'ecec0066-1a8b-4d1c-b579-5ba50ec76302', name: 'Lá đổi màu' },
    { id: 'a86f438b-aca1-40d1-86db-800b6caf2db6', name: 'Có hoa' },
    { id: 'ae1b9a11-e7b0-4cd8-a3ee-64b038e60eac', name: 'Ăn trái' },
    { id: 'ed4c1423-cef2-4e38-a11c-a66479966754', name: 'Họ cau dừa' },
  ]},
  { id: '3b76d630-f9ad-4ba5-b11d-f6a04b1fd7bb', name: 'Cây bụi', children: [
    { id: '24498d32-7597-49aa-b3e1-ac696f4ac8db', name: 'Thường xanh' },
    { id: 'f71615d0-baff-4335-ad67-6adc984aa7d3', name: 'Lá đổi màu' },
    { id: '1a75cc19-e787-4d41-8813-f5eb73d9de8d', name: 'Có hoa' },
    { id: 'c102d832-a0da-45ce-a67e-dd70fd4bef8e', name: 'Ăn trái' },
  ]},
  { id: '9f10c3a8-9b0a-4876-b198-b0c3688965ba', name: 'Hoa chậu', children: [
    { id: '720e424d-8c65-4f7a-85f2-8252ef287b6d', name: 'Hoa ôn đới' },
    { id: '1b081000-a00f-42f6-b2b1-55f5644a9a29', name: 'Hoa nhiệt đới' },
    { id: 'a0709252-11f4-4a6a-91a2-22de3f770d92', name: 'Hoa cận nhiệt đới' },
  ]},
  { id: '35fad975-6acd-40e0-aa29-bdab877f51f3', name: 'Cây tạo khối, dáng thế', children: [
    { id: 'f2852e0f-7bd1-48ed-8eb0-37481a8e595c', name: 'Tạo hình, khối' },
    { id: 'c1d49926-8a93-4b36-bc58-a2a7c32b8922', name: 'Tạo dáng, thế' },
  ]},
  { id: '12156eda-d8c0-4bb4-b259-57eb9a00c3c5', name: 'Cây đường viền, thảm, cỏ', children: [
    { id: 'b363a978-0025-4244-8cdb-202ba87ba698', name: 'Cây đường viền' },
    { id: 'd47147b1-c3a2-455f-b76c-d6a2e70e3675', name: 'Thảm, cỏ' },
  ]},
  { id: 'a6a9972f-a654-47e7-8c7a-5d1d04393658', name: 'Cây nội thất', children: [
    { id: 'e896aaa5-bdea-45cd-add8-6493b59ac17b', name: 'Cây trang trí' },
    { id: 'f279bdff-e31d-4509-a26f-2f18243e3450', name: 'Cây phong thủy' },
    { id: '72298519-7aab-4369-a697-0cfa15dfe47d', name: 'Cây lọc không khí' },
    { id: '07ec1742-d4d8-4d42-8c5b-6cf7e24577aa', name: 'Cây có hoa nội thất' },
  ]},
  { id: '0bc49747-d50f-40e5-b40b-93b83936952a', name: 'Khác', children: [
    { id: 'abe5ad47-6d26-4a21-9c3e-8240a7ed9e18', name: 'Dây leo, rủ, bám tường' },
    { id: 'd1f0970f-e918-49a3-8161-f33a38ae6d78', name: 'Gia vị / Dược liệu' },
    { id: '820a0592-5927-4258-a438-9d2c765d0227', name: 'Lan các loại' },
    { id: '37294097-0853-4860-b337-2b68e83ba767', name: 'Thủy sinh' },
  ]},
]

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [areaForm, setAreaForm] = useState<Record<string, { total: string; landscape: string }>>({})
  const [statsForm, setStatsForm] = useState<Record<string, Record<string, string>>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data: unitsData } = await supabase.from('she_units').select('*').order('sort_order')
      const { data: statsData } = await supabase.from('unit_plant_stats').select('*')
      setUnits(unitsData || [])

      // Init area form
      const af: Record<string, { total: string; landscape: string }> = {}
      ;(unitsData || []).forEach((u: any) => {
        af[u.id] = {
          total: u.total_area_ha ? String(u.total_area_ha) : '',
          landscape: u.landscape_area_ha ? String(u.landscape_area_ha) : '',
        }
      })
      setAreaForm(af)

      // Init stats form
      const sf: Record<string, Record<string, string>> = {}
      ;(unitsData || []).forEach((u: any) => { sf[u.id] = {} })
      ;(statsData || []).forEach((s: any) => {
        const key = s.group_lv2_id || s.group_lv1_id
        if (sf[s.unit_id]) sf[s.unit_id][key] = String(s.quantity || 0)
      })
      setStatsForm(sf)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(unit: any) {
    setSaving(unit.id)
    // Lưu diện tích
    await supabase.from('she_units').update({
      total_area_ha: parseFloat(areaForm[unit.id]?.total) || null,
      landscape_area_ha: parseFloat(areaForm[unit.id]?.landscape) || null,
      data_updated_at: new Date().toISOString(),
      updated_by: 'Admin',
    }).eq('id', unit.id)

    // Lưu số lượng cây theo nhóm
    const upserts: any[] = []
    for (const g1 of GROUPS) {
      // Lưu tổng cấp 1 (tính từ cấp 2)
      const totalLv1 = g1.children.reduce((sum, g2) => {
        return sum + (parseInt(statsForm[unit.id]?.[g2.id]) || 0)
      }, 0)
      if (totalLv1 > 0) {
        upserts.push({
          unit_id: unit.id,
          group_lv1_id: g1.id,
          group_lv2_id: null,
          quantity: totalLv1,
          updated_at: new Date().toISOString(),
          updated_by: 'Admin',
        })
      }
      // Lưu từng cấp 2
      for (const g2 of g1.children) {
        const qty = parseInt(statsForm[unit.id]?.[g2.id]) || 0
        if (qty > 0) {
          upserts.push({
            unit_id: unit.id,
            group_lv1_id: g1.id,
            group_lv2_id: g2.id,
            quantity: qty,
            updated_at: new Date().toISOString(),
            updated_by: 'Admin',
          })
        }
      }
    }
    if (upserts.length > 0) {
      await supabase.from('unit_plant_stats').upsert(upserts, { onConflict: 'unit_id,group_lv1_id,group_lv2_id' })
    }

    setSaving(null)
    setSaved(unit.id)
    setTimeout(() => setSaved(null), 2000)
  }

  const groupByMang = units.reduce((acc: any, u: any) => {
    if (!acc[u.mang]) acc[u.mang] = []
    acc[u.mang].push(u)
    return acc
  }, {})

  const ratio = (u: any) => {
    if (!u.total_area_ha || !u.landscape_area_ha) return null
    return Math.round((u.landscape_area_ha / u.total_area_ha) * 100)
  }

  const totalLv1 = (unitId: string, g1Id: string) => {
    const g1 = GROUPS.find(g => g.id === g1Id)
    if (!g1) return 0
    return g1.children.reduce((sum, g2) => sum + (parseInt(statsForm[unitId]?.[g2.id]) || 0), 0)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="animate-spin mr-2" size={20} />Đang tải...
    </div>
  )

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-gray-800">Quản lý đơn vị</h1>
        <p className="text-gray-500 text-sm mt-1">Cập nhật diện tích và số lượng cây theo nhóm cho từng đơn vị</p>
      </div>

      {Object.entries(groupByMang).map(([mang, mangUnits]: any) => (
        <div key={mang} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 size={14} className="text-forest-500" />{mang}
          </h2>
          <div className="space-y-3">
            {mangUnits.map((u: any) => (
              <div key={u.id} className="card overflow-hidden">
                {/* Header đơn vị */}
                <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(e => ({ ...e, [u.id]: !e[u.id] }))}>
                  <div className="flex items-center gap-3">
                    <span className="bg-forest-100 text-forest-700 text-xs font-mono font-semibold px-2 py-0.5 rounded">{u.code}</span>
                    <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                    {u.data_updated_at && (
                      <span className="text-xs text-gray-400">· Cập nhật {new Date(u.data_updated_at).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {ratio(u) !== null && (
                      <span className="text-sm font-semibold text-forest-600">{ratio(u)}% cảnh quan</span>
                    )}
                    {expanded[u.id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {expanded[u.id] && (
                  <div className="px-5 pb-5 border-t border-gray-100">

                    {/* Diện tích */}
                    <div className="mt-4 mb-5">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Diện tích</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Tổng diện tích công viên (ha)</label>
                          <input type="number" step="0.1" className="input text-sm" placeholder="VD: 142.5"
                            value={areaForm[u.id]?.total || ''}
                            onChange={e => setAreaForm(f => ({ ...f, [u.id]: { ...f[u.id], total: e.target.value } }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Diện tích cảnh quan xanh (ha)</label>
                          <input type="number" step="0.1" className="input text-sm" placeholder="VD: 85"
                            value={areaForm[u.id]?.landscape || ''}
                            onChange={e => setAreaForm(f => ({ ...f, [u.id]: { ...f[u.id], landscape: e.target.value } }))} />
                        </div>
                      </div>
                    </div>

                    {/* Số lượng cây theo nhóm */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Số lượng cây theo nhóm</div>
                      <div className="space-y-4">
                        {GROUPS.map(g1 => (
                          <div key={g1.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-gray-700">{g1.name}</span>
                              <span className="text-sm font-bold text-forest-600">{totalLv1(u.id, g1.id) || 0} cây</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {g1.children.map(g2 => (
                                <div key={g2.id}>
                                  <label className="block text-xs text-gray-500 mb-1">{g2.name}</label>
                                  <input type="number" min="0" className="input text-sm"
                                    placeholder="0"
                                    value={statsForm[u.id]?.[g2.id] || ''}
                                    onChange={e => setStatsForm(f => ({
                                      ...f,
                                      [u.id]: { ...f[u.id], [g2.id]: e.target.value }
                                    }))} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lưu */}
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <button onClick={() => handleSave(u)} disabled={saving === u.id}
                        className={`btn-primary ${saved === u.id ? '!bg-green-500' : ''}`}>
                        {saving === u.id ? <Loader2 size={15} className="animate-spin" /> :
                         saved === u.id ? <Check size={15} /> : <Save size={15} />}
                        {saving === u.id ? 'Đang lưu...' : saved === u.id ? 'Đã lưu!' : 'Lưu đơn vị'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
