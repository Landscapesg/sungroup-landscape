'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, Building2, Check } from 'lucide-react'

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, { total: string; landscape: string }>>({})

  useEffect(() => {
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => {
      setUnits(data || [])
      const f: Record<string, { total: string; landscape: string }> = {}
      ;(data || []).forEach((u: any) => {
        f[u.id] = {
          total: u.total_area_ha ? String(u.total_area_ha) : '',
          landscape: u.landscape_area_ha ? String(u.landscape_area_ha) : '',
        }
      })
      setForm(f)
      setLoading(false)
    })
  }, [])

  async function handleSave(unit: any) {
    setSaving(unit.id)
    const total = parseFloat(form[unit.id]?.total) || null
    const landscape = parseFloat(form[unit.id]?.landscape) || null
    const { error } = await supabase.from('she_units').update({
      total_area_ha: total,
      landscape_area_ha: landscape,
      data_updated_at: new Date().toISOString(),
      updated_by: 'Admin',
    }).eq('id', unit.id)
    setSaving(null)
    if (!error) {
      setSaved(unit.id)
      setTimeout(() => setSaved(null), 2000)
      setUnits(u => u.map(x => x.id === unit.id ? { ...x, total_area_ha: total, landscape_area_ha: landscape, data_updated_at: new Date().toISOString() } : x))
    }
  }

  const ratio = (u: any) => {
    if (!u.total_area_ha || !u.landscape_area_ha) return null
    return Math.round((u.landscape_area_ha / u.total_area_ha) * 100)
  }

  const groupByMang = units.reduce((acc: any, u: any) => {
    if (!acc[u.mang]) acc[u.mang] = []
    acc[u.mang].push(u)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="animate-spin mr-2" size={20} />Đang tải...
    </div>
  )

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-gray-800">Quản lý đơn vị</h1>
        <p className="text-gray-500 text-sm mt-1">Cập nhật diện tích công viên và diện tích cảnh quan cho từng đơn vị</p>
      </div>

      {Object.entries(groupByMang).map(([mang, mangUnits]: any) => (
        <div key={mang} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 size={14} className="text-forest-500" />{mang}
          </h2>
          <div className="space-y-3">
            {mangUnits.map((u: any) => (
              <div key={u.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-forest-100 text-forest-700 text-xs font-mono font-semibold px-2 py-0.5 rounded">{u.code}</span>
                      <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tổng diện tích công viên (ha)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input text-sm"
                          placeholder="VD: 142.5"
                          value={form[u.id]?.total || ''}
                          onChange={e => setForm(f => ({ ...f, [u.id]: { ...f[u.id], total: e.target.value } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Diện tích cảnh quan xanh (ha)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input text-sm"
                          placeholder="VD: 85"
                          value={form[u.id]?.landscape || ''}
                          onChange={e => setForm(f => ({ ...f, [u.id]: { ...f[u.id], landscape: e.target.value } }))}
                        />
                      </div>
                    </div>
                    {u.data_updated_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Cập nhật lần cuối: {new Date(u.data_updated_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        {u.updated_by && ` bởi ${u.updated_by}`}
                      </p>
                    )}
                  </div>

                  {/* Preview tỷ lệ */}
                  <div className="flex-shrink-0 text-center w-20">
                    {ratio(u) !== null ? (
                      <>
                        <div className="text-2xl font-semibold text-forest-600">{ratio(u)}%</div>
                        <div className="text-xs text-gray-400">cảnh quan</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-300 text-center">Chưa có<br/>số liệu</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleSave(u)} disabled={saving === u.id}
                    className={`btn-primary text-sm py-1.5 ${saved === u.id ? 'bg-green-500' : ''}`}>
                    {saving === u.id ? <Loader2 size={14} className="animate-spin" /> :
                     saved === u.id ? <Check size={14} /> : <Save size={14} />}
                    {saving === u.id ? 'Đang lưu...' : saved === u.id ? 'Đã lưu!' : 'Lưu'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
