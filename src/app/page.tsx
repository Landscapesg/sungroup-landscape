'use client'
import Link from 'next/link'
import { Leaf, MapPin, Database, BarChart3, ArrowRight, TreePine } from 'lucide-react'

export default function HomePage() {
  const locations = [
    { name: 'Bà Nà Hills', province: 'Đà Nẵng', altitude: '1.487m', climate: 'Á nhiệt đới', color: 'bg-blue-50 border-blue-200' },
    { name: 'Sun World Hạ Long', province: 'Quảng Ninh', altitude: '10m', climate: 'Cận nhiệt đới', color: 'bg-teal-50 border-teal-200' },
    { name: 'Phú Quốc', province: 'Kiên Giang', altitude: '5m', climate: 'Nhiệt đới biển', color: 'bg-amber-50 border-amber-200' },
    { name: 'Sun World Sapa', province: 'Lào Cai', altitude: '1.500m', climate: 'Ôn đới núi cao', color: 'bg-purple-50 border-purple-200' },
    { name: 'Sun Group Đà Nẵng', province: 'Đà Nẵng', altitude: '5m', climate: 'Nhiệt đới', color: 'bg-green-50 border-green-200' },
  ]

  const stats = [
    { label: 'Địa điểm', value: '5', icon: MapPin },
    { label: 'Loài cây', value: '193+', icon: Leaf },
    { label: 'Nhóm phân loại', value: '9', icon: Database },
    { label: 'Vùng khí hậu', value: '4', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a280a 0%, #1e6e1e 50%, #2d5a1b 100%)' }}>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TreePine size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display text-white text-lg leading-none">Sun Group</div>
            <div className="text-green-200 text-xs">Kho dữ liệu cảnh quan xanh</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/plants" className="text-green-100 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
            Tra cứu cây
          </Link>
          <Link href="/admin" className="bg-white text-forest-800 hover:bg-green-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Quản trị
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 text-green-100 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/20">
          <Leaf size={14} />
          Nền tảng số hóa cảnh quan — Sun Group
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-white mb-6 leading-tight">
          Kho tri thức<br/>
          <span className="italic text-green-300">cảnh quan xanh</span>
        </h1>
        <p className="text-green-100 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
          Một nơi duy nhất lưu toàn bộ dữ liệu cây cảnh quan của hệ thống Sun Group —
          từ Bà Nà Hills đến Phú Quốc, từ Hạ Long đến Sapa.
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-4xl mx-auto mb-16">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-5 text-center backdrop-blur-sm">
            <s.icon size={22} className="text-green-300 mx-auto mb-2" />
            <div className="text-3xl font-display text-white mb-1">{s.value}</div>
            <div className="text-green-200 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Locations */}
      <div className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="font-display text-white text-2xl mb-6 text-center">Các địa điểm trong hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.name} className={`bg-white rounded-xl border p-5 ${loc.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{loc.name}</div>
                  <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {loc.province}
                  </div>
                </div>
                <div className="text-xs bg-white/60 rounded-lg px-2 py-1 text-gray-600 font-medium">{loc.altitude}</div>
              </div>
              <div className="text-xs text-gray-500 bg-white/50 rounded-lg px-3 py-1.5 inline-block">
                {loc.climate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
