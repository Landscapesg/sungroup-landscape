'use client'

import { useMemo, useState } from 'react'
import JSZip from 'jszip'
import { AlertTriangle, CheckCircle2, FileArchive, Loader2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Plant = {
  id: string
  name_vi: string
  scientific_name?: string | null
  other_names?: string[] | null
  cover_image_url?: string | null
  flower_leaf_image_url?: string | null
  application_image_url?: string | null
}

type ZipImage = {
  id: string
  fileName: string
  folderName: string
  sourceName: string
  priority: number
  blob: Blob
  previewUrl: string
}

type ImportRow = {
  folderName: string
  plantId: string
  images: ZipImage[]
  coverId: string
  detailId: string
  applicationId: string
  status: 'ready' | 'uploading' | 'done' | 'error'
  message?: string
}

const IMAGE_FIELDS = ['cover_image_url', 'flower_leaf_image_url', 'application_image_url'] as const
const MAX_ARCHIVE_BYTES = 800 * 1024 * 1024

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^\s*\d+\s*[.\-_)]*\s*/, '')
    .replace(/\b(cay|hoa|anh|hinh|chup|mang|bo sung|ba na|bana|bn)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function tokens(value: string) {
  return normalize(value).split(' ').filter(x => x.length > 1)
}

function matchPlant(folderName: string, plants: Plant[]) {
  const target = normalize(folderName)
  if (!target) return ''
  let best = { id: '', score: 0 }
  for (const plant of plants) {
    const names = [plant.name_vi, plant.scientific_name || '', ...(plant.other_names || [])]
    for (const name of names) {
      const candidate = normalize(name)
      if (!candidate) continue
      let score = candidate === target ? 100 : 0
      if (!score && (candidate.includes(target) || target.includes(candidate))) score = 80
      if (!score) {
        const a = new Set(tokens(target))
        const b = new Set(tokens(candidate))
        const overlap = [...a].filter(x => b.has(x)).length
        score = Math.round((overlap / Math.max(a.size, b.size, 1)) * 70)
      }
      if (score > best.score) best = { id: plant.id, score }
    }
  }
  return best.score >= 45 ? best.id : ''
}

function roleScore(image: ZipImage, role: 'cover' | 'detail' | 'application') {
  const n = normalize(image.fileName)
  const keywords = {
    cover: ['chinh', 'main', 'cover', 'tong the', 'toan cay'],
    detail: ['la', 'hoa', 'than', 'qua', 'chi tiet', 'detail'],
    application: ['ung dung', 'canh quan', 'cong trinh', 'hang cay', 'duong pho', 'landscape'],
  }[role]
  const keywordScore = keywords.some(k => n.includes(k)) ? 100 : 0
  return image.priority * 1000 + keywordScore
}

function chooseImages(images: ZipImage[]) {
  const preferred = [...images].sort((a, b) => b.priority - a.priority || a.fileName.localeCompare(b.fileName, 'vi'))
  const used = new Set<string>()
  const choose = (role: 'cover' | 'detail' | 'application') => {
    const ranked = preferred.filter(x => !used.has(x.id)).sort((a, b) => roleScore(b, role) - roleScore(a, role))
    const selected = ranked[0]
    if (selected) used.add(selected.id)
    return selected?.id || ''
  }
  return { coverId: choose('cover'), detailId: choose('detail'), applicationId: choose('application') }
}

function safeFileName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || 'jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

export default function BulkImageImport({ plants, onClose, onComplete }: {
  plants: Plant[]
  onClose: () => void
  onComplete: () => void
}) {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [reading, setReading] = useState(false)
  const [running, setRunning] = useState(false)
  const [preserveExisting, setPreserveExisting] = useState(true)
  const [summary, setSummary] = useState('')

  const plantById = useMemo(() => new Map(plants.map(p => [p.id, p])), [plants])

  async function readArchives(files: FileList | null) {
    if (!files?.length) return
    setReading(true)
    setSummary('')
    const grouped = new Map<string, ZipImage[]>()
    try {
      for (const archive of Array.from(files)) {
        if (!archive.name.toLowerCase().endsWith('.zip')) throw new Error(`${archive.name}: chỉ hỗ trợ tệp ZIP`)
        if (archive.size > MAX_ARCHIVE_BYTES) throw new Error(`${archive.name}: vượt giới hạn 800 MB`)
        const zip = await JSZip.loadAsync(archive)
        const priority = /ba\s*na|bana|chup\s*bn|(^|[^a-z])bn([^a-z]|$)/i.test(archive.name) ? 2 : 1
        for (const entry of Object.values(zip.files)) {
          if (entry.dir || entry.name.includes('__MACOSX/')) continue
          if (!/\.(jpe?g|png|webp|gif)$/i.test(entry.name)) continue
          const parts = entry.name.split('/').filter(Boolean)
          if (parts.length < 2) continue
          const folderName = parts[parts.length - 2]
          const blob = await entry.async('blob')
          const image: ZipImage = {
            id: `${archive.name}:${entry.name}`,
            fileName: parts[parts.length - 1],
            folderName,
            sourceName: archive.name,
            priority,
            blob,
            previewUrl: URL.createObjectURL(blob),
          }
          const key = normalize(folderName)
          grouped.set(key, [...(grouped.get(key) || []), image])
        }
      }
      const nextRows = [...grouped.values()].map(images => {
        const selected = chooseImages(images)
        return {
          folderName: images[0].folderName,
          plantId: matchPlant(images[0].folderName, plants),
          images: images.sort((a, b) => b.priority - a.priority || a.fileName.localeCompare(b.fileName, 'vi')),
          ...selected,
          status: 'ready' as const,
        }
      }).sort((a, b) => a.folderName.localeCompare(b.folderName, 'vi', { numeric: true }))
      setRows(nextRows)
      setSummary(`Đã đọc ${nextRows.length} thư mục cây. Hãy kiểm tra các dòng màu vàng trước khi cập nhật.`)
    } catch (error: any) {
      alert(error.message || 'Không đọc được tệp ZIP')
    } finally {
      setReading(false)
    }
  }

  function updateRow(index: number, patch: Partial<ImportRow>) {
    setRows(current => current.map((row, i) => i === index ? { ...row, ...patch } : row))
  }

  async function uploadImage(plantId: string, field: typeof IMAGE_FIELDS[number], image: ZipImage) {
    const path = `${plantId}/bulk-${field}-${safeFileName(image.fileName)}`
    const { error } = await supabase.storage.from('plant-images').upload(path, image.blob, {
      contentType: image.blob.type || undefined,
      upsert: false,
    })
    if (error) throw error
    return supabase.storage.from('plant-images').getPublicUrl(path).data.publicUrl
  }

  async function runImport() {
    const invalid = rows.filter(r => !r.plantId || !r.coverId || !r.detailId || !r.applicationId)
    if (invalid.length) {
      alert(`Còn ${invalid.length} thư mục chưa ghép đủ cây và 3 ảnh.`)
      return
    }
    setRunning(true)
    let done = 0
    let errors = 0
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      updateRow(i, { status: 'uploading', message: 'Đang tải...' })
      try {
        const plant = plantById.get(row.plantId)!
        const ids = [row.coverId, row.detailId, row.applicationId]
        const currentValues = [plant.cover_image_url, plant.flower_leaf_image_url, plant.application_image_url]
        const payload: Record<string, string> = {}
        for (let k = 0; k < 3; k++) {
          if (preserveExisting && currentValues[k]) continue
          const image = row.images.find(x => x.id === ids[k])!
          payload[IMAGE_FIELDS[k]] = await uploadImage(row.plantId, IMAGE_FIELDS[k], image)
        }
        if (Object.keys(payload).length) {
          const { error } = await supabase.from('plants').update(payload).eq('id', row.plantId)
          if (error) throw error
        }
        done++
        updateRow(i, { status: 'done', message: Object.keys(payload).length ? 'Đã cập nhật' : 'Đã giữ ảnh hiện có' })
      } catch (error: any) {
        errors++
        updateRow(i, { status: 'error', message: error.message || 'Lỗi tải ảnh' })
      }
    }
    setSummary(`Hoàn tất: ${done} cây thành công, ${errors} cây lỗi.`)
    setRunning(false)
    onComplete()
  }

  const unresolved = rows.filter(r => !r.plantId || !r.coverId || !r.detailId || !r.applicationId).length

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl mx-auto my-4">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><FileArchive size={20} className="text-forest-600" />Nhập ảnh cây hàng loạt từ ZIP</h2>
            <p className="text-xs text-gray-500 mt-1">Ưu tiên ảnh từ ZIP có tên Bà Nà/BN; luôn xem trước trước khi cập nhật.</p>
          </div>
          <button onClick={onClose} disabled={running} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="border-2 border-dashed border-forest-200 bg-forest-50/40 rounded-xl p-6 text-center">
            <label className="btn-primary inline-flex cursor-pointer">
              {reading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {reading ? 'Đang đọc ZIP...' : 'Chọn một hoặc nhiều tệp ZIP'}
              <input type="file" accept=".zip,application/zip" multiple className="hidden" disabled={reading || running} onChange={e => readArchives(e.target.files)} />
            </label>
            <p className="text-xs text-gray-500 mt-3">Mỗi cây là một thư mục; hỗ trợ JPG, JPEG, PNG, WEBP, GIF. Giới hạn 800 MB/ZIP.</p>
          </div>

          {summary && <div className="rounded-lg bg-blue-50 text-blue-700 px-4 py-3 text-sm">{summary}</div>}

          {rows.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  {unresolved ? <AlertTriangle size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-green-600" />}
                  <span>{rows.length} thư mục · {unresolved} dòng cần kiểm tra</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={preserveExisting} onChange={e => setPreserveExisting(e.target.checked)} disabled={running} className="accent-forest-600" />
                  Giữ nguyên ảnh cây đã có
                </label>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr><th className="text-left p-3">Thư mục</th><th className="text-left p-3 w-64">Ghép với cây</th><th className="text-left p-3">Ảnh chính</th><th className="text-left p-3">Bộ phận</th><th className="text-left p-3">Ứng dụng</th><th className="text-left p-3">Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={`${row.folderName}-${i}`} className={`border-t border-gray-100 ${!row.plantId ? 'bg-amber-50' : ''}`}>
                        <td className="p-3 align-top"><p className="font-medium text-gray-800">{row.folderName}</p><p className="text-xs text-gray-400">{row.images.length} ảnh</p></td>
                        <td className="p-3 align-top"><select className="input text-xs" value={row.plantId} disabled={running} onChange={e => updateRow(i, { plantId: e.target.value })}><option value="">-- Chọn cây --</option>{plants.map(p => <option key={p.id} value={p.id}>{p.name_vi}</option>)}</select></td>
                        {(['coverId', 'detailId', 'applicationId'] as const).map(key => {
                          const image = row.images.find(x => x.id === row[key])
                          return <td key={key} className="p-3 align-top w-48">{image && <img src={image.previewUrl} alt="" className="w-32 h-24 object-cover rounded-lg border mb-2" />}<select className="input text-xs" value={row[key]} disabled={running} onChange={e => updateRow(i, { [key]: e.target.value })}><option value="">-- Chọn ảnh --</option>{row.images.map(img => <option key={img.id} value={img.id}>{img.priority === 2 ? '★ BN · ' : ''}{img.fileName}</option>)}</select></td>
                        })}
                        <td className="p-3 align-top text-xs"><span className={row.status === 'done' ? 'text-green-600' : row.status === 'error' ? 'text-red-600' : row.status === 'uploading' ? 'text-blue-600' : 'text-gray-400'}>{row.message || 'Sẵn sàng'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 sticky bottom-0 bg-white py-3 border-t border-gray-100">
                <button className="btn-secondary" onClick={onClose} disabled={running}>Đóng</button>
                <button className="btn-primary" onClick={runImport} disabled={running || unresolved > 0}>{running ? <><Loader2 size={16} className="animate-spin" />Đang cập nhật...</> : <>Cập nhật {rows.length} cây</>}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
