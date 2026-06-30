'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Save, ArrowLeft, Loader2, Upload, X, ChevronDown, Building2, Check } from 'lucide-react'

interface PlantFormProps { plantId?: string }

export default function PlantForm({ plantId }: PlantFormProps) {
  const router = useRouter()
  const isNew = !plantId
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [activeSection, setActiveSection] = useState(0)
  const [sheOpen, setSheOpen] = useState(false)

  const [groups1, setGroups1] = useState<any[]>([])
  const [groups2, setGroups2] = useState<any[]>([])
  const [groups3, setGroups3] = useState<any[]>([])
  const [climates, setClimates] = useState<any[]>([])
  const [functions, setFunctions] = useState<any[]>([])
  const [sheUnits, setSheUnits] = useState<any[]>([])
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const [form, setForm] = useState({
    plant_code: '', name_vi: '', name_en: '', scientific_name: '', other_names: '',
    group_lv1_id: '', group_lv2_id: '', group_lv3_id: '', she_unit_ids: [] as string[],
    cover_image_url: '', flower_leaf_image_url: '', application_image_url: '',
    climate_ids: [] as string[], special_function_ids: [] as string[],
    flower_color_text: '', blooming_period_text: '',
    height_max_m: '', trunk_diameter_cm: '', canopy_diameter_max_m: '',
    origin_type: '',
    light_requirement: '', water_requirement: '', soil_requirement: '', temperature_range: '',
    planting_technique: '', watering_fertilizing: '', pruning_technique: '',
    pest_control: '', propagation: '', landscape_application: '',
    she_experience: '', she_risks: '', status: 'ACTIVE',
  })

  useEffect(() => {
    async function loadMaster() {
      const [g1, g3, c, fn, u] = await Promise.all([
        supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order'),
        supabase.from('plant_groups').select('*').eq('level', 3).order('sort_order'),
        supabase.from('climates').select('*').order('sort_order'),
        supabase.from('special_functions').select('*').order('sort_order'),
        supabase.from('she_units').select('*').order('sort_order'),
      ])
      setGroups1(g1.data || [])
      setGroups3(g3.data || [])
      setClimates(c.data || [])
      setFunctions(fn.data || [])
      setSheUnits(u.data || [])
    }
    loadMaster()
    if (!isNew && plantId) {
      supabase.from('plants').select('*').eq('id', plantId).single().then(async ({ data }) => {
        if (data) {
          // Load groups2 trước khi set form để dropdown không bị reset
          if (data.group_lv1_id) {
            const { data: g2data } = await supabase.from('plant_groups').select('*').eq('level', 2).eq('parent_id', data.group_lv1_id).order('sort_order')
            setGroups2(g2data || [])
          }
          setForm({
          plant_code: data.plant_code || '', name_vi: data.name_vi || '',
          name_en: data.name_en || '', scientific_name: data.scientific_name || '',
          other_names: (data.other_names || []).join(', '),
          group_lv1_id: data.group_lv1_id || '', group_lv2_id: data.group_lv2_id || '',
          group_lv3_id: data.group_lv3_id || '',
          she_unit_ids: data.she_unit_ids || [],
          cover_image_url: data.cover_image_url || '',
          flower_leaf_image_url: data.flower_leaf_image_url || '',
          application_image_url: data.application_image_url || '',
          climate_ids: data.climate_ids || [], special_function_ids: data.special_function_ids || [],
          flower_color_text: data.flower_color_text || '', blooming_period_text: data.blooming_period_text || '',
          height_max_m: data.height_max_m || '',
          trunk_diameter_cm: data.trunk_diameter_cm || '', canopy_diameter_max_m: data.canopy_diameter_max_m || '',
          origin_type: data.origin_type || '',
          light_requirement: data.light_requirement || '', water_requirement: data.water_requirement || '',
          soil_requirement: data.soil_requirement || '', temperature_range: data.temperature_range || '',
          planting_technique: data.planting_technique || '', watering_fertilizing: data.watering_fertilizing || '',
          pruning_technique: data.pruning_technique || '', pest_control: data.pest_control || '',
          propagation: data.propagation || '', landscape_application: data.landscape_application || '',
          she_experience: data.she_experience || '', she_risks: data.she_risks || '',
          status: data.status || 'ACTIVE',
          })
        }
        setLoading(false)
      })
    }
  }, [plantId, isNew])

  // Load groups2 khi user chọn nhóm cấp 1 mới — dùng 1 lần setForm để tránh race condition
  function handleLv1Change(id: string) {
    setForm(p => ({ ...p, group_lv1_id: id, group_lv2_id: '' }))
    if (id) {
      supabase.from('plant_groups').select('*').eq('level', 2).eq('parent_id', id).order('sort_order')
        .then(({ data }) => setGroups2(data || []))
    } else {
      setGroups2([])
    }
  }

  const upd = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }))
  const toggleArr = (key: 'climate_ids' | 'special_function_ids' | 'she_unit_ids', val: string) => {
    setForm(p => {
      const arr = (p[key] as string[]) || []
      return { ...p, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

  async function handleFileUpload(key: string, file: File) {
    setUploadingKey(key)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${key}-${Date.now()}.${ext}`
      const filePath = `${plantId || 'new'}/${fileName}`
      const { error: upErr } = await supabase.storage.from('plant-images').upload(filePath, file, { upsert: true })
      if (upErr) { alert('Lỗi tải ảnh lên: ' + upErr.message); setUploadingKey(null); return }
      const { data } = supabase.storage.from('plant-images').getPublicUrl(filePath)
      upd(key, data.publicUrl)
    } catch (err: any) {
      alert('Lỗi tải ảnh lên: ' + err.message)
    }
    setUploadingKey(null)
  }

  async function handleSave() {
    if (!form.name_vi.trim()) { alert('Vui lòng nhập Tên tiếng Việt'); return }
    if (!form.group_lv1_id) { alert('Vui lòng chọn Nhóm Cấp 1'); return }
    setSaving(true)
    const payload = {
      ...form,
      other_names: form.other_names ? form.other_names.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      height_max_m: form.height_max_m ? parseFloat(form.height_max_m as string) : null,
      trunk_diameter_cm: form.trunk_diameter_cm ? parseFloat(form.trunk_diameter_cm as string) : null,
      canopy_diameter_max_m: form.canopy_diameter_max_m ? parseFloat(form.canopy_diameter_max_m as string) : null,
      group_lv1_id: form.group_lv1_id || null,
      group_lv2_id: form.group_lv2_id || null,
      group_lv3_id: form.group_lv3_id || null,
      // she_unit_ids là uuid[] — đảm bảo không gửi string rỗng
      she_unit_ids: form.she_unit_ids.filter((id: string) => id && id.length > 0),
      climate_ids: form.climate_ids.filter((id: string) => id && id.length > 0),
      special_function_ids: form.special_function_ids.filter((id: string) => id && id.length > 0),
    }
    let error: any = null
    let result: any = null
    if (isNew) {
      const res = await supabase.from('plants').insert(payload)
      error = res.error
    } else {
      const res = await supabase.from('plants').update(payload).eq('id', plantId!).select()
      error = res.error
      result = res.data
    }
    setSaving(false)
    if (error) {
      console.error('Save error:', error)
      alert('Lỗi: ' + error.message + '\n\nCode: ' + error.code + '\nDetails: ' + error.details)
      return
    }
    console.log('Saved OK:', result)
    router.push('/admin/plants')
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="animate-spin mr-2" size={20} />Đang tải...</div>

  const sheByMang = sheUnits.reduce((acc: any, u: any) => { if (!acc[u.mang]) acc[u.mang] = []; acc[u.mang].push(u); return acc }, {})
  const tabs = [{ label: '1. Định danh', icon: '🏷️' }, { label: '2. Hình ảnh', icon: '🖼️' }, { label: '3. Đặc điểm sinh thái', icon: '🌿' }]

  const imgFields = [
    { key: 'cover_image_url', label: 'Hình ảnh chính', note: 'Ảnh tổng thể rõ cây — JPG/PNG', required: true },
    { key: 'flower_leaf_image_url', label: 'Hình ảnh bộ phận cây', note: 'Lá, hoa, thân, quả... ảnh chi tiết đặc trưng', required: false },
    { key: 'application_image_url', label: 'Hình ảnh ứng dụng', note: 'Cây được ứng dụng trong thực tế', required: false },
  ]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">{isNew ? 'Thêm cây mới' : `Chỉnh sửa — ${form.name_vi}`}</h1>
          <p className="text-gray-500 text-sm mt-1">Khối Giải trí & Nghỉ dưỡng Sun Group (SHE)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/plants" className="btn-secondary"><ArrowLeft size={15} />Quay lại</Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveSection(i)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === i ? 'bg-white text-forest-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span>{tab.icon}</span><span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSection === 0 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-forest-700">Thông tin định danh</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
                <select className="input" value={form.status} onChange={e => upd('status', e.target.value)}>
                  <option value="ACTIVE">Hoạt động</option><option value="INACTIVE">Tạm ngừng</option><option value="DRAFT">Nháp</option>
                </select></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-600 mb-1">Tên tiếng Việt <span className="text-red-500">*</span></label>
                <input className="input" placeholder="VD: Cây đỗ quyên" value={form.name_vi} onChange={e => upd('name_vi', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Tên tiếng Anh</label>
                <input className="input" placeholder="VD: Azalea" value={form.name_en} onChange={e => upd('name_en', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Tên khoa học</label>
                <input className="input italic" placeholder="VD: Rhododendron simsii" value={form.scientific_name} onChange={e => upd('scientific_name', e.target.value)} /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-600 mb-1">Tên gọi khác phổ biến</label>
                <input className="input" placeholder="Nhập các tên khác, cách nhau bằng dấu phẩy" value={form.other_names} onChange={e => upd('other_names', e.target.value)} /></div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-forest-700">Phân loại</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Nhóm Cấp 1 <span className="text-red-500">*</span></label>
                <select className="input" value={form.group_lv1_id} onChange={e => handleLv1Change(e.target.value)}>
                  <option value="">-- Chọn nhóm --</option>
                  {groups1.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Nhóm Cấp 2</label>
                <select className="input" value={form.group_lv2_id} onChange={e => upd('group_lv2_id', e.target.value)} disabled={groups2.length === 0}>
                  <option value="">-- Chọn nhóm cấp 2 --</option>
                  {groups2.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                {form.group_lv1_id && groups2.length === 0 && <p className="text-xs text-gray-400 mt-1">Chưa có nhóm Cấp 2</p>}
              </div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-600 mb-1">Nhóm Cấp 3</label>
                <select className="input" value={form.group_lv3_id} onChange={e => upd('group_lv3_id', e.target.value)}>
                  <option value="">-- Chọn tầm cao --</option>
                  {groups3.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide text-forest-700">Đơn vị Khối SHE đang trồng</h2>
            <div className="relative">
              <button type="button" onClick={() => setSheOpen(!sheOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white hover:border-forest-400 transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Building2 size={15} className="text-forest-600 flex-shrink-0" />
                  {form.she_unit_ids.length === 0 ? (
                    <span className="text-sm text-gray-400">-- Chọn đơn vị --</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {form.she_unit_ids.map((id: string) => {
                        const u = sheUnits.find((x: any) => x.id === id)
                        return u ? (
                          <span key={id} className="bg-forest-100 text-forest-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <span className="font-mono">{u.code}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleArr('she_unit_ids', id) }}
                              className="hover:text-red-500"><X size={10} /></button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${sheOpen ? 'rotate-180' : ''}`} />
              </button>
              {sheOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                  {Object.entries(sheByMang).map(([mang, units]) => (
                    <div key={mang}>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 sticky top-0">{mang}</div>
                      {(units as any[]).map((u: any) => (
                        <button key={u.id} type="button" onClick={() => toggleArr('she_unit_ids', u.id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-forest-50 transition-colors border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-400 w-16">{u.code}</span>
                            <span className="text-sm text-gray-700">{u.name}</span>
                          </div>
                          {form.she_unit_ids.includes(u.id) && <Check size={14} className="text-forest-600" />}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Đã chọn {form.she_unit_ids.length} đơn vị</span>
                    <button type="button" onClick={() => setSheOpen(false)} className="text-xs text-forest-600 font-semibold hover:underline">Xong ✓</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 1 && (
        <div className="space-y-4">
          {imgFields.map(({ key, label, note, required }) => (
            <div key={key} className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-gray-700 text-sm">{label}</h2>
                {required && <span className="text-red-500 text-xs">*</span>}
              </div>
              <p className="text-xs text-gray-400 mb-3">{note}</p>
              <input className="input mb-3" placeholder="Dán URL hình ảnh vào đây..." value={(form as any)[key]} onChange={e => upd(key, e.target.value)} />
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">hoặc</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 cursor-pointer hover:border-forest-400 hover:text-forest-700 transition-colors mb-3">
                {uploadingKey === key ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploadingKey === key ? 'Đang tải lên...' : 'Tải ảnh từ máy lên'}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingKey === key}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(key, f); e.target.value = '' }} />
              </label>
              {(form as any)[key] ? (
                <div className="relative inline-block">
                  <img src={(form as any)[key]} alt={label} className="w-48 h-36 object-cover rounded-lg border border-gray-200" />
                  <button onClick={() => upd(key, '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><X size={10} /></button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                  <Upload size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">Dán URL ảnh hoặc tải ảnh từ máy lên</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 2 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-forest-700">Khí hậu phù hợp</h2>
            <div className="flex flex-wrap gap-2">
              {climates.map(c => (
                <button key={c.id} type="button" onClick={() => toggleArr('climate_ids', c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.climate_ids.includes(c.id) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-forest-700">Công năng đặc thù</h2>
            <div className="flex flex-wrap gap-2">
              {functions.map(fn => (
                <button key={fn.id} type="button" onClick={() => toggleArr('special_function_ids', fn.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.special_function_ids.includes(fn.id) ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'}`}>{fn.name}</button>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-forest-700">Màu sắc & Thời gian</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Màu hoa/ lá</label>
                <input className="input" placeholder="VD: Đỏ, Hồng, Vàng..." value={form.flower_color_text} onChange={e => upd('flower_color_text', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Thời gian nở/ chuyển màu</label>
                <input className="input" placeholder="VD: Quanh năm, Xuân-Hè..." value={form.blooming_period_text} onChange={e => upd('blooming_period_text', e.target.value)} /></div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-forest-700">Kích thước & Phân loại đặc biệt</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Chiều cao tối đa (m)</label>
                <input className="input" type="number" step="0.1" placeholder="3.0" value={form.height_max_m} onChange={e => upd('height_max_m', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Đường kính thân (cm)</label>
                <input className="input" type="number" step="0.1" placeholder="VD: 15" value={form.trunk_diameter_cm} onChange={e => upd('trunk_diameter_cm', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Đường kính tán tối đa (m)</label>
                <input className="input" type="number" step="0.1" placeholder="VD: 2.5" value={form.canopy_diameter_max_m} onChange={e => upd('canopy_diameter_max_m', e.target.value)} /></div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Nguồn gốc cây</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'native', label: 'Cây bản địa' },
                  { value: 'naturalized', label: 'Cây du nhập đã thích nghi' },
                  { value: 'imported', label: 'Cây ngoại nhập' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="origin_type" className="w-4 h-4 accent-forest-600"
                      checked={form.origin_type === opt.value} onChange={() => upd('origin_type', opt.value)} />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <Link href="/admin/plants" className="btn-secondary"><ArrowLeft size={15} />Quay lại</Link>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Đang lưu...' : 'Lưu cây'}
        </button>
      </div>
    </div>
  )
}
