'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Leaf, MapPin, Database, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ plants: 0, locations: 0, groups: 0, active: 0 })
  const [locations, setLocations] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [p, l, g] = await Promise.all([
        supabase.from('plants').select('id, status', { count: 'exact' }),
        supabase.from('locations').select('*').eq('is_active', true),
        supabase.from('plant_groups').select('id', { count: 'exact' }).eq('level', 1),
      ])
      const active = p.data?.filter(x => x.status === 'ACTIVE').length || 0
      setStats({ plants: p.count || 0, locations: l.count || 0, groups: g.count || 0, active })
      setLocations(l.data || [])
    }
    load()
  }, [])

  const cards = [
    { label: 'Tổng số loài cây', value: stats.plants, icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Địa điểm hoạt động', value: stats.locations, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Nhóm phân loại', value: stats.groups, icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Cây đang hoạt động', value: stats.active, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">Kho dữ liệu cảnh quan xanh — Sun Group</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon size={20} className={c.color} />
            </div>
            <div className="text-3xl font-display font-semibold text-gray-800">{c.value}</div>
            <div className="text-gray-500 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Locations */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-forest-600" /> Các địa điểm trong hệ thống
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map((loc) => (
            <div key={loc.id} className="border border-forest-100 rounded-xl p-4 bg-forest-50/30 hover:bg-forest-50 transition-colors">
              <div className="font-medium text-gray-800 text-sm">{loc.name}</div>
              <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                <MapPin size={10} /> {loc.province}
              </div>
              {loc.climate_zone && (
                <div className="text-xs text-forest-600 mt-2 bg-white rounded-lg px-2 py-1 inline-block border border-forest-100">
                  {loc.climate_zone}
                </div>
              )}
              {loc.altitude_m && (
                <div className="text-xs text-gray-400 mt-1">Độ cao: {loc.altitude_m}m</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
