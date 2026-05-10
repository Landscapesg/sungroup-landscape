'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'

interface PlantFormProps { plantId?: string }

export default function PlantForm({ plantId }: PlantFormProps) {
  const router = useRouter()
  const isNew = !plantId
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [groups, setGroups] = useState<any[]>([])
  const [climates, setClimates] = useState<any[]>([])
  const [functions, setFunctions] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])

  const [form, setForm] = useState({
    plant_code: '', name_vi: '', name_en: '', scientific_name: '',
    group_lv1_id: '', description_vi: '', care_instructions: '',
    is_native: false, is_endangered: false, status: 'ACTIVE',
    height_min_m: '', height_max_m: '',
    climate_ids: [] as string[], special_function_ids: [] as string[],
    flower_color_ids: [] as string[], blooming_period_ids: [] as string[],
  })

  useEffect(() => {
    async function loadMaster() {
      const [g, c, f, col, p] = await Promise.all([
        supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order'),
        supabase.from('climates').select('*').order('sort_order'),
        supabase.from('special_functions').select('*').order('sort_order'),
        supabase.from('flower_colors').select('*').order('sort_order'),
        supabase.from('blooming_periods').select('*').order('sort_order'),
      ])
      setGroups(g.data || []); setClimates(c.data || []); setFunctions(f.data || [])
      setColors(col.data || []); setPeriods(p.data || [])
    }
    loadMaster()

    if (!isNew && plantId) {
      supabase.from('plants').select('*').eq('id', plantId).single().then(({ data }) => {
        if (data) {
          setForm({
            plant_code: data.plant_code || '', name_vi: data.name_vi || '',
            name_en: data.name_en || '', scientific_name: data.scientific_name || '',
            group_lv1_id: data.group_lv1_id || '', description_vi: data.description_vi || '',
            care_instructions: data.care_instructions || '',
            is_native: data.is_native || false, is_endangered: data.is_endangered || false,
            status: data.status || 'ACTIVE',
            height_min_m: data.height_min_m || '', height_max_m: data.height_max_m || '',
            climate_ids: data.climate_ids || [], special_function_ids: data.special_function_ids || [],
            flower_color_ids: data.flower_color_ids || [], blooming_period_ids: data.blooming_period_ids || [],
          })
        }
        setLoading(false)
      })
    }
  }, [plantId, isNew])

  function toggleArr(key: keyof typeof form, val: string) {
    const arr = form[key] as string[]
    setForm(f => ({ ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }))
  }

  async function handleSave() {
    if (!form.name_vi) { alert('Vui lòng nhập tên cây (tiếng Việt)'); return }
    setSaving(true)
    const payload = {
      ...form,
      height_min_m: form.height_min_m ? parseFloat(form.height_min_m as string) : null,
      height_max_m: form.height_max_m ? parseFloat(form.height_max_m as string) : null,
      group_lv1_id: form.group_lv1_id || null,
    }
    const { error } = isNew
      ? await supabase.from('plants').insert(payload)
      : await supabase.from('plants').update(payload).eq('id', plantId!)
    setSaving(false)
    if (error) { alert('Lỗi: ' + error.message); return }
    router.push('/admin/plants')
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="animate-spin mr-2" size={20} /> Đang tải...</div>

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">
            {isNew ? 'Thêm cây mới' : 'Chỉnh sửa cây'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{isNew ? 'Nhập thông tin loài cây mới' : form.name_vi}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/plants" className="btn-secondary"><ArrowLeft size={15} /> Quay lại</Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Định danh */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Thông tin định danh</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mã cây</label>
              <input className="input" placeholder="CB-001" value={form.plant_code} onChange={e => setForm(f => ({ ...f, plant_code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nhóm Cấp 1</label>
              <select className="input" value={form.group_lv1_id} onChange={e => setForm(f => ({ ...f, group_lv1_id: e.target.value }))}>
                <option value="">-- Chọn nhóm --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tên tiếng Việt <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Đông hầu" value={form.name_vi} onChange={e => setForm(f => ({ ...f, name_vi: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tên tiếng Anh</label>
              <input className="input" placeholder="Yellow Alder" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Tên khoa học</label>
              <input className="input italic" placeholder="Turnera ulmifolia" value={form.scientific_name} onChange={e => setForm(f => ({ ...f, scientific_name: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Đặc tính */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Đặc tính sinh thái</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Khí hậu phù hợp</label>
            <div className="flex flex-wrap gap-2">
              {climates.map(c => (
                <button key={c.id} type="button" onClick={() => toggleArr('climate_ids', c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${(form.climate_ids as string[]).includes(c.id) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Công năng đặc thù</label>
            <div className="flex flex-wrap gap-2">
              {functions.map(f => (
                <button key={f.id} type="button" onClick={() => toggleArr('special_function_ids', f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${(form.special_function_ids as string[]).includes(f.id) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Màu hoa</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c.id} type="button" onClick={() => toggleArr('flower_color_ids', c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${(form.flower_color_ids as string[]).includes(c.id) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
                  {c.hex_color && <span className="w-3 h-3 rounded-full border border-white/50 flex-shrink-0" style={{ background: c.hex_color }} />}
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Mùa hoa nở</label>
            <div className="flex flex-wrap gap-2">
              {periods.map(p => (
                <button key={p.id} type="button" onClick={() => toggleArr('blooming_period_ids', p.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${(form.blooming_period_ids as string[]).includes(p.id) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Chiều cao tối thiểu (m)</label>
              <input className="input" type="number" step="0.1" placeholder="0.5" value={form.height_min_m} onChange={e => setForm(f => ({ ...f, height_min_m: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Chiều cao tối đa (m)</label>
              <input className="input" type="number" step="0.1" placeholder="3.0" value={form.height_max_m} onChange={e => setForm(f => ({ ...f, height_max_m: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Mô tả & Chăm sóc</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mô tả đặc điểm</label>
              <textarea className="input h-24 resize-none" placeholder="Đặc điểm hình thái, phân bố..." value={form.description_vi} onChange={e => setForm(f => ({ ...f, description_vi: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hướng dẫn chăm sóc</label>
              <textarea className="input h-24 resize-none" placeholder="Lịch tưới nước, phân bón, ánh sáng..." value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Flags & Status */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Phân loại & Trạng thái</h2>
          <div className="flex flex-wrap gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-forest-600" checked={form.is_native} onChange={e => setForm(f => ({ ...f, is_native: e.target.checked }))} />
              <span className="text-sm text-gray-700">Cây bản địa Việt Nam</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-forest-600" checked={form.is_endangered} onChange={e => setForm(f => ({ ...f, is_endangered: e.target.checked }))} />
              <span className="text-sm text-gray-700">Loài nguy cấp / quý hiếm</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
            <select className="input w-auto" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm ngừng</option>
              <option value="DRAFT">Nháp</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
