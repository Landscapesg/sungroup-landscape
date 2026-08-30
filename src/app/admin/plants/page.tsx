'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import BulkImageImport from '@/components/BulkImageImport'
import { Plus, Search, Edit2, Leaf, BarChart2, Download, Trash2, FileText, FileSpreadsheet, X, AlertTriangle, FileArchive } from 'lucide-react'

export default function AdminPlantsPage() {
  const [plants, setPlants]       = useState<any[]>([])
  const [groups, setGroups]       = useState<any[]>([])
  const [sheUnits, setSheUnits]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedUnit, setSelectedUnit]   = useState('')
  const [selectedMang, setSelectedMang]   = useState('')
  const [filterNoLv2, setFilterNoLv2]     = useState(false)

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting]         = useState(false)

  // export dropdown
  const [showExport, setShowExport] = useState(false)
  const [exporting, setExporting]   = useState<'excel'|'csv'|null>(null)
  const [showBulkImageImport, setShowBulkImageImport] = useState(false)

  const MANGS = ['Giải trí', 'Nghỉ dưỡng - Tự vận hành', 'Nghỉ dưỡng - Thuê quản lý', 'Sân golf']

  useEffect(() => {
    supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order').then(({ data }) => setGroups(data || []))
    supabase.from('she_units').select('*').order('sort_order').then(({ data }) => setSheUnits(data || []))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('plants').select(`*, g1:plant_groups!group_lv1_id(name), g1b:plant_groups!group_lv1_id_2(name), g2:plant_groups!group_lv2_id(name), g3:plant_groups!group_lv3_id(name)`).order('name_vi')
      if (search)        q = q.ilike('name_vi', `%${search}%`)
      if (selectedGroup) q = q.or(`group_lv1_id.eq.${selectedGroup},group_lv1_id_2.eq.${selectedGroup}`)
      const { data } = await q
      let result = data || []
      if (selectedUnit) result = result.filter((p: any) => (p.she_unit_ids || []).includes(selectedUnit))
      if (selectedMang) {
        const unitIds = sheUnits.filter(u => u.mang === selectedMang).map(u => u.id)
        result = result.filter((p: any) => (p.she_unit_ids || []).some((id: string) => unitIds.includes(id)))
      }
      if (filterNoLv2) result = result.filter((p: any) => !p.group_lv2_id)
      setPlants(result)
      setLoading(false)
    }
    load()
  }, [search, selectedGroup, selectedUnit, selectedMang, sheUnits, filterNoLv2])

  const filteredUnits = selectedMang ? sheUnits.filter(u => u.mang === selectedMang) : sheUnits

  // ── XOÁ CÂY ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('plants').delete().eq('id', deleteTarget.id)
    if (!error) {
      setPlants(prev => prev.filter(p => p.id !== deleteTarget.id))
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  // ── XUẤT FILE ──────────────────────────────────────────────────────────────
  function buildRows(list: any[]) {
    return list.map(p => {
      const unitNames = (p.she_unit_ids || []).map((id: string) => sheUnits.find(u => u.id === id)?.name).filter(Boolean).join(', ')
      const otherNames = Array.isArray(p.other_names) ? p.other_names.join(', ') : (p.other_names || '')
      const originLabel = p.origin_type === 'native' ? 'Cây bản địa' : p.origin_type === 'naturalized' ? 'Cây du nhập đã thích nghi' : p.origin_type === 'imported' ? 'Cây ngoại nhập' : ''
      return {
        'Tên tiếng Việt':           p.name_vi              || '',
        'Tên khoa học':             p.scientific_name      || '',
        'Tên tiếng Anh':            p.name_en              || '',
        'Tên gọi khác phổ biến':    otherNames,
        'Nhóm Cấp 1':               p.g1?.name             || '',
        'Nhóm Cấp 2':               p.g2?.name             || '',
        'Nhóm Cấp 3':               p.g3?.name             || '',
        'Đơn vị Khối SHE':          unitNames,
        'Trạng thái':               p.status === 'ACTIVE' ? 'Hoạt động' : p.status === 'INACTIVE' ? 'Tạm ngừng' : 'Nháp',
        'Nguồn gốc cây':            originLabel,
        'Màu hoa/lá':               p.flower_color_text    || '',
        'Thời gian nở/chuyển màu':  p.blooming_period_text || '',
        'Chiều cao tối đa (m)':     p.height_max_m         || '',
        'Đường kính thân (cm)':     p.trunk_diameter_cm    || '',
        'Đường kính tán tối đa (m)': p.canopy_diameter_max_m || '',
        'Ánh sáng':                 p.light_requirement    || '',
        'Độ ẩm':                    p.water_requirement    || '',
        'Đất trồng':                p.soil_requirement     || '',
        'Nhiệt độ':                 p.temperature_range    || '',
      }
    })
  }

  async function exportCSV(all: boolean) {
    setExporting('csv'); setShowExport(false)
    let list = plants
    if (all) {
      const { data } = await supabase.from('plants').select(`*, g1:plant_groups!group_lv1_id(name), g2:plant_groups!group_lv2_id(name), g3:plant_groups!group_lv3_id(name)`).order('name_vi')
      list = data || []
    }
    const rows = buildRows(list)
    if (!rows.length) { setExporting(null); return }
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = all ? 'danh-sach-cay-tat-ca.csv' : 'danh-sach-cay-loc.csv'
    a.click(); URL.revokeObjectURL(url)
    setExporting(null)
  }

  async function exportExcel(all: boolean) {
    setExporting('excel'); setShowExport(false)
    let list = plants
    if (all) {
      const { data } = await supabase.from('plants').select(`*, g1:plant_groups!group_lv1_id(name), g2:plant_groups!group_lv2_id(name), g3:plant_groups!group_lv3_id(name)`).order('name_vi')
      list = data || []
    }
    const rows = buildRows(list)
    if (!rows.length) { setExporting(null); return }

    // dùng SheetJS qua CDN (đã có trong dependencies Next.js)
    const XLSX = await import('xlsx')
    const ws   = XLSX.utils.json_to_sheet(rows)
    const wb   = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách cây')
    // tự động điều chỉnh độ rộng cột
    const colWidths = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length, 14) }))
    ws['!cols'] = colWidths
    XLSX.writeFile(wb, all ? 'danh-sach-cay-tat-ca.xlsx' : 'danh-sach-cay-loc.xlsx')
    setExporting(null)
  }

  return (
    <div>
      {showBulkImageImport && (
        <BulkImageImport
          plants={plants}
          onClose={() => setShowBulkImageImport(false)}
          // Giữ modal mở để người dùng đọc báo cáo thành công/lỗi.
          // Danh sách phía sau sẽ được làm mới khi người dùng chủ động đóng/tải lại trang.
          onComplete={() => {}}
        />
      )}

      {/* ── CONFIRM XOÁ ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-base">Xác nhận xoá cây</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bạn có chắc muốn xoá <span className="font-medium text-gray-800">"{deleteTarget.name_vi}"</span>?
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="btn-secondary">Huỷ</button>
              <button onClick={confirmDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50">
                {deleting ? 'Đang xoá...' : <><Trash2 size={14} />Xoá cây</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Quản lý Cây</h1>
          <p className="text-gray-500 text-sm mt-1">{plants.length} loài cây · Khối SHE</p>
        </div>
        <div className="flex gap-2 items-center relative">
          <Link href="/admin/plants/statistics" className="btn-secondary"><BarChart2 size={15} />Thống kê</Link>

          <button onClick={() => setShowBulkImageImport(true)} className="btn-secondary">
            <FileArchive size={15} />Nhập ảnh ZIP
          </button>

          {/* Nút xuất file */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="btn-secondary flex items-center gap-1.5"
              disabled={!!exporting}
            >
              <Download size={15} />
              {exporting ? 'Đang xuất...' : 'Xuất file'}
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Xuất theo bộ lọc hiện tại ({plants.length} cây)</p>
                </div>
                <button onClick={() => exportExcel(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FileSpreadsheet size={15} className="text-green-600" />Excel (.xlsx)
                </button>
                <button onClick={() => exportCSV(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FileText size={15} className="text-blue-600" />CSV (.csv)
                </button>
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Xuất toàn bộ (340 cây)</p>
                </div>
                <button onClick={() => exportExcel(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FileSpreadsheet size={15} className="text-green-600" />Excel — tất cả
                </button>
                <button onClick={() => exportCSV(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FileText size={15} className="text-blue-600" />CSV — tất cả
                </button>
              </div>
            )}
          </div>

          <Link href="/admin/plants/new" className="btn-primary"><Plus size={16} />Thêm cây mới</Link>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="card p-4 mb-5 flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Tìm tên cây..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">Tất cả nhóm</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="input w-auto" value={selectedMang} onChange={e => { setSelectedMang(e.target.value); setSelectedUnit('') }}>
          <option value="">Tất cả mảng</option>
          {MANGS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="input w-auto" value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}>
          <option value="">Tất cả đơn vị</option>
          {filteredUnits.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
        </select>
        <button
          onClick={() => setFilterNoLv2(!filterNoLv2)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors flex-shrink-0 ${
            filterNoLv2
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-gray-500 border-gray-200 hover:border-amber-400 hover:text-amber-600'
          }`}
        >
          <AlertTriangle size={14} />
          Chưa có lv2 {filterNoLv2 && `(${plants.length})`}
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên cây</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tên khoa học</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phân loại</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                <Leaf size={24} className="mx-auto mb-2 animate-pulse text-forest-300" />Đang tải...
              </td></tr>
            ) : plants.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                Không tìm thấy cây nào. <Link href="/admin/plants/new" className="text-forest-600 hover:underline">Thêm cây đầu tiên →</Link>
              </td></tr>
            ) : plants.map((p) => {
              return (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-forest-50 flex items-center justify-center border border-gray-100">
                        {p.cover_image_url
                          ? <img src={p.cover_image_url} alt={p.name_vi} className="w-full h-full object-cover" />
                          : <Leaf size={14} className="text-forest-300" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.name_vi}</p>
                        {p.other_names && Array.isArray(p.other_names) && p.other_names.length > 0 && (
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{p.other_names.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 italic text-gray-500 hidden md:table-cell text-xs">{p.scientific_name || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      {p.g1 && <span className="bg-forest-50 text-forest-700 text-xs px-2 py-0.5 rounded-full border border-forest-200 w-fit">{p.g1.name}</span>}
                      {p.g1b && <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200 w-fit">{p.g1b.name}</span>}
                      {p.g2 && <span className="text-xs text-gray-400">{p.g2.name}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.status === 'ACTIVE' ? 'badge-active' : p.status === 'INACTIVE' ? 'badge-inactive' : 'badge-draft'}>
                      {p.status === 'ACTIVE' ? 'Hoạt động' : p.status === 'INACTIVE' ? 'Tạm ngừng' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <Link href={`/admin/plants/${p.id}`}
                        className="p-1.5 rounded-lg hover:bg-forest-50 text-gray-400 hover:text-forest-600 transition-colors inline-flex"
                        title="Chỉnh sửa">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors inline-flex"
                        title="Xoá cây">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* đóng dropdown xuất file khi click ngoài */}
      {showExport && <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />}
    </div>
  )
}
