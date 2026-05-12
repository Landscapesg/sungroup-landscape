'use client'
import Link from 'next/link'
import { Leaf, MapPin, Database, BarChart3, ArrowRight, TreePine, Building2 } from 'lucide-react'

const MANGS = [
  { label: 'Mảng Giải trí', count: 10, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', units: 'FSS, HLS, SWS, SWN, SCB, BNC, SBD, HTI, DNDT, SVT' },
  { label: 'Nghỉ dưỡng tự vận hành', count: 3, color: 'bg-blue-50 border-blue-200 text-blue-700', units: 'SRH, YOQ, EGP' },
  { label: 'Nghỉ dưỡng thuê quản lý', count: 9, color: 'bg-purple-50 border-purple-200 text-purple-700', units: 'OWH, ICD, PVD, JWP, PRP, PVP, NWP, LFP, Rixos' },
  { label: 'Sân golf', count: 1, color: 'bg-amber-50 border-amber-200 text-amber-700', units: 'BNA-Golf' },
]

export default function HomePage() {
  const stats = [
    { label: 'Đơn vị thành viên', value: '23', icon: Building2 },
    { label: 'Loài cây', value: '193+', icon: Leaf },
    { label: 'Nhóm phân loại', value: '9', icon: Database },
    { label: 'Vùng khí hậu', value: '4', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a280a 0%, #1e6e1e 50%, #2d5a1b 100%)' }}>
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TreePine size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display text-white text-lg leading-none">Khối SHE</div>
            <div className="text-green-200 text-xs">Kho dữ liệu cảnh quan xanh</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/plants" className="text-green-100 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Tra cứu cây</Link>
          <Link href="/admin" className="bg-white text-forest-800 hover:bg-green-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Quản trị</Link>
        </div>
      </header>

      <div className="px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 text-green-100 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/20">
          <Leaf size={14} />Khối Giải trí & Nghỉ dưỡng Sun Group — SHE
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-white mb-6 leading-tight">
          Kho tri thức<br/><span className="italic text-green-300">cảnh quan xanh</span>
        </h1>
        <p className="text-green-100 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
          Một nơi duy nhất lưu toàn bộ dữ liệu cây cảnh quan của 23 đơn vị thành viên Khối SHE — từ Sun World Ba Na Hills đến JW Marriott Phu Quoc.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/plants" className="bg-white text-forest-800 hover:bg-green-50 font-medium px-6 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-lg">
            Khám phá thư viện cây <ArrowRight size={16} />
          </Link>
          <Link href="/admin/plants" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-6 py-3 rounded-xl transition-colors text-sm">
            Vào trang quản trị
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-4xl mx-auto mb-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-5 text-center backdrop-blur-sm">
            <s.icon size={22} className="text-green-300 mx-auto mb-2" />
            <div className="text-3xl font-display text-white mb-1">{s.value}</div>
            <div className="text-green-200 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-16 max-w-4xl mx-auto">
        <h2 className="font-display text-white text-2xl mb-6 text-center">Các mảng hoạt động</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MANGS.map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-800 text-sm">{m.label}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${m.color}`}>{m.count} đơn vị</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">{m.units}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
