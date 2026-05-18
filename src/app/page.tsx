'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Leaf, ArrowRight, Database, Users, Target, ChevronLeft, ChevronRight, X, MapPin, TreePine } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SLIDES = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=90',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=90',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=90',
  'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1600&q=90',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=90',
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1600&q=90',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=90',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=90',
]

const PARK_IMGS: Record<string, string> = {
  BNC: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  FSS: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
  HLS: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
  HTI: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=80',
  SBD: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400&q=80',
  ICD: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
}

const GOALS = [
  { icon: Database, title: 'Số hóa tri thức', desc: 'Chuyển toàn bộ kiến thức cảnh quan từ sổ tay, Excel thành hệ thống số thống nhất, dễ tra cứu.' },
  { icon: Users, title: 'Chia sẻ nội bộ', desc: 'Đội cảnh quan 23 đơn vị cùng đóng góp, kế thừa kinh nghiệm lẫn nhau — không mất đi khi nhân sự thay đổi.' },
  { icon: Leaf, title: 'Chuẩn hóa chất lượng', desc: 'Thống nhất tiêu chuẩn chọn cây, trồng và chăm sóc trên toàn hệ thống Khối SHE.' },
  { icon: Target, title: 'Ra quyết định tốt hơn', desc: 'Dữ liệu thực tế từ thực địa giúp lãnh đạo lập kế hoạch cảnh quan chính xác, tiết kiệm chi phí.' },
]

export default function HomePage() {
  const [current, setCurrent] = useState(0)
  const [stats, setStats] = useState({ plants: 0, units: 0, groups: 0 })
  const [units, setUnits] = useState<any[]>([])
  const [groups1, setGroups1] = useState<any[]>([])
  const [groups2, setGroups2] = useState<any[]>([])
  const [allPlants, setAllPlants] = useState<any[]>([])
  const [unitStats, setUnitStats] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [parkScroll, setParkScroll] = useState(0)
  const parkRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      const [{ count: plants }, { count: unitsCount }, { count: groups }, { data: unitsData }, { data: g1 }, { data: g2 }, { data: plantsData }, { data: statsData }] = await Promise.all([
        supabase.from('plants').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('she_units').select('*', { count: 'exact', head: true }),
        supabase.from('plant_groups').select('*', { count: 'exact', head: true }).eq('level', 1),
        supabase.from('she_units').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('plant_groups').select('*').eq('level', 1).order('sort_order'),
        supabase.from('plant_groups').select('*').eq('level', 2).order('sort_order'),
        supabase.from('plants').select('id, group_lv1_id, group_lv2_id, she_unit_ids').eq('status', 'ACTIVE'),
        supabase.from('unit_plant_stats').select('*'),
      ])
      setStats({ plants: plants || 0, units: unitsCount || 0, groups: groups || 0 })
      setUnits(unitsData || [])
      setGroups1(g1 || [])
      setGroups2(g2 || [])
      setAllPlants(plantsData || [])
      setUnitStats(statsData || [])
    }
    loadData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(c => (c + 1) % SLIDES.length)

  const scrollParks = (dir: number) => {
    const el = parkRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
    setParkScroll(el.scrollLeft + dir * 280)
  }

  // Dùng unit_plant_stats nếu có, fallback sang đếm she_unit_ids
  const countByUnit = (unitId: string) => {
    const stats = unitStats.filter(s => s.unit_id === unitId && !s.group_lv2_id)
    if (stats.length > 0) return stats.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
    return allPlants.filter(p => (p.she_unit_ids || []).includes(unitId)).length
  }
  const countByGroup1 = (gId: string, unitId: string) => {
    const stat = unitStats.find(s => s.unit_id === unitId && s.group_lv1_id === gId && !s.group_lv2_id)
    if (stat) return stat.quantity || 0
    return allPlants.filter(p => p.group_lv1_id === gId && (p.she_unit_ids || []).includes(unitId)).length
  }
  const countByGroup2 = (gId: string, unitId: string) => {
    const stat = unitStats.find(s => s.unit_id === unitId && s.group_lv2_id === gId)
    if (stat) return stat.quantity || 0
    return allPlants.filter(p => p.group_lv2_id === gId && (p.she_unit_ids || []).includes(unitId)).length
  }
  const totalByGroup1 = (gId: string, unitId: string) => countByGroup1(gId, unitId)

  const landscapeRatio = (u: any) => {
    if (!u.total_area_ha || !u.landscape_area_ha) return 0
    return Math.round((u.landscape_area_ha / u.total_area_ha) * 100)
  }

  // SVG donut chart
  const DonutChart = ({ total, landscape }: { total: number, landscape: number }) => {
    if (!total || !landscape) return (
      <div style={{width:100,height:100,borderRadius:'50%',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:11,color:'#9ca3af',textAlign:'center'}}>Chưa có số liệu</span>
      </div>
    )
    const r = 40, cx = 50, cy = 50
    const pct = landscape / total
    const circ = 2 * Math.PI * r
    const dash = pct * circ
    return (
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="14"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16a34a" strokeWidth="14"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="13" fontWeight="600" fill="#16a34a">{Math.round(pct*100)}%</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize="9" fill="#6b7280">cảnh quan</text>
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        {SLIDES.map((src, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === current ? 1 : 0 }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0" style={{background:'linear-gradient(to bottom,rgba(0,0,0,0.25) 0%,rgba(0,20,0,0.5) 50%,rgba(0,15,0,0.82) 100%)'}}/>

        <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6 flex items-center justify-between">
          <div>
            <div style={{color:'#fff',fontSize:'18px',fontWeight:'600',letterSpacing:'0.12em',lineHeight:1}}>SUNGROUP</div>
            <div style={{color:'rgba(200,255,200,0.85)',fontSize:'12px',marginTop:'3px',letterSpacing:'0.04em'}}>SHE — Khối Giải trí & Nghỉ dưỡng</div>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/plants" className="text-white/85 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Tra cứu cây</Link>
            <Link href="/admin" className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/30 text-sm font-medium px-5 py-2 rounded-lg transition-colors">Quản trị</Link>
          </div>
        </header>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <div className="mb-5" style={{color:'rgba(200,255,200,0.85)',fontSize:'15px',letterSpacing:'0.25em',textTransform:'uppercase',fontWeight:'500'}}>
            LANDSCAPE KHỐI SHE
          </div>
          <h1 style={{fontSize:'62px',fontWeight:'300',color:'#fff',lineHeight:1.1,marginBottom:'8px',letterSpacing:'-0.01em'}}>Làm đẹp</h1>
          <h2 style={{fontSize:'48px',fontWeight:'400',color:'#86efac',fontStyle:'italic',marginBottom:'24px'}}>những vùng đất</h2>
          <p style={{color:'rgba(255,255,255,0.72)',fontSize:'16px',maxWidth:'540px',lineHeight:'1.75',marginBottom:'36px'}}>
            Nền tảng số hóa tri thức cảnh quan của <strong style={{color:'#fff'}}>{stats.units || 23} đơn vị</strong> thuộc Khối Giải trí & Nghỉ dưỡng Sun Group — từ núi rừng Bà Nà đến bãi biển Phú Quốc.
          </p>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}>
            <Link href="/plants" style={{background:'#fff',color:'#14532d',fontWeight:'500',fontSize:'14px',padding:'12px 28px',borderRadius:'10px',display:'flex',alignItems:'center',gap:'8px',textDecoration:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
              Khám phá thư viện cây <ArrowRight size={16}/>
            </Link>
            <Link href="/admin/plants" style={{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',fontWeight:'400',fontSize:'14px',padding:'12px 28px',borderRadius:'10px',textDecoration:'none'}}>
              Vào trang quản trị
            </Link>
          </div>
        </div>

        <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all"><ChevronLeft size={20}/></button>
        <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all"><ChevronRight size={20}/></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{width:i===current?'24px':'8px',height:'8px',borderRadius:'4px',background:i===current?'#fff':'rgba(255,255,255,0.4)',border:'none',cursor:'pointer',transition:'all 0.3s'}}/>
          ))}
        </div>
        <div className="absolute bottom-8 right-8 z-20 text-white/50 text-sm">{String(current+1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}</div>
      </section>

      {/* STATS */}
      <section style={{background:'#14532d',padding:'40px 24px'}}>
        <div style={{maxWidth:'960px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',textAlign:'center'}}>
          {[
            {value:stats.units||'—',label:'Đơn vị thành viên',sub:'Giải trí & Nghỉ dưỡng'},
            {value:stats.plants?`${stats.plants}+`:'—',label:'Loài cây',sub:'Đang cập nhật'},
            {value:stats.groups||'—',label:'Nhóm phân loại',sub:'Cấp 1'},
            {value:'4',label:'Vùng khí hậu',sub:'Từ núi cao đến biển'},
          ].map((s,i)=>(
            <div key={i}>
              <div style={{fontSize:'42px',fontWeight:'300',color:'#fff',lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:'13px',color:'#86efac',marginTop:'6px',fontWeight:'500'}}>{s.label}</div>
              <div style={{fontSize:'11px',color:'rgba(200,255,200,0.45)',marginTop:'2px'}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PARKS — lướt ngang + click popup */}
      <section style={{padding:'64px 24px',background:'#f9fafb'}}>
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'11px',fontWeight:'500',color:'#16a34a',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'10px'}}>Hệ thống đơn vị</div>
            <h2 style={{fontSize:'36px',fontWeight:'300',color:'#111827',marginBottom:'12px'}}>Từ núi cao đến biển đảo</h2>
            <p style={{color:'#6b7280',maxWidth:'520px',margin:'0 auto',lineHeight:'1.7',fontSize:'15px'}}>Mỗi đơn vị mang một hệ sinh thái và điều kiện khí hậu khác nhau — tạo nên sự đa dạng cảnh quan đặc sắc của Khối SHE.</p>
          </div>

          {/* Scroll controls */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <span style={{fontSize:'13px',color:'#6b7280'}}>{units.length} đơn vị — click để xem chi tiết</span>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => scrollParks(-1)} style={{width:'34px',height:'34px',borderRadius:'50%',border:'1px solid #d1d5db',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <ChevronLeft size={16} style={{color:'#6b7280'}}/>
              </button>
              <button onClick={() => scrollParks(1)} style={{width:'34px',height:'34px',borderRadius:'50%',border:'1px solid #d1d5db',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <ChevronRight size={16} style={{color:'#6b7280'}}/>
              </button>
            </div>
          </div>

          {/* Scrollable parks */}
          <div ref={parkRef} style={{display:'flex',gap:'12px',overflowX:'auto',paddingBottom:'8px',scrollbarWidth:'none',msOverflowStyle:'none'}}>
            {units.map(u => (
              <div key={u.id} onClick={() => setSelectedUnit(u)}
                style={{flexShrink:0,width:'200px',borderRadius:'12px',overflow:'hidden',cursor:'pointer',border:'1.5px solid transparent',transition:'all 0.2s'}}
                onMouseOver={e=>{(e.currentTarget as HTMLElement).style.borderColor='#16a34a'}}
                onMouseOut={e=>{(e.currentTarget as HTMLElement).style.borderColor='transparent'}}>
                <div style={{position:'relative',height:'120px',background:PARK_IMGS[u.code]?'transparent':'linear-gradient(135deg,#14532d,#166534)'}}>
                  {PARK_IMGS[u.code]
                    ? <img src={PARK_IMGS[u.code]} alt={u.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}><TreePine size={32} style={{color:'rgba(255,255,255,0.4)'}}/></div>
                  }
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%)'}}/>
                  <div style={{position:'absolute',top:'8px',left:'8px',background:'rgba(0,0,0,0.4)',borderRadius:'6px',padding:'2px 7px',fontSize:'10px',fontWeight:'600',color:'#fff',letterSpacing:'0.05em'}}>{u.code}</div>
                  <div style={{position:'absolute',bottom:'8px',left:'8px',right:'8px'}}>
                    <div style={{fontSize:'11px',fontWeight:'500',color:'#fff',lineHeight:1.3}}>{u.name}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.6)',marginTop:'2px'}}>{u.mang}</div>
                  </div>
                </div>
                <div style={{background:'#fff',padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'11px',color:'#16a34a',fontWeight:'500'}}>{countByUnit(u.id)} loài cây</span>
                  <span style={{fontSize:'10px',color:'#9ca3af'}}>Xem chi tiết →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPUP CHI TIẾT ĐƠN VỊ */}
      {selectedUnit && (
        <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}
          onClick={e => { if (e.target === e.currentTarget) setSelectedUnit(null) }}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'24px',width:'100%',maxWidth:'560px',maxHeight:'85vh',overflowY:'auto',position:'relative'}}>
            {/* Close */}
            <button onClick={() => setSelectedUnit(null)} style={{position:'absolute',top:'16px',right:'16px',background:'#f3f4f6',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <X size={16} style={{color:'#6b7280'}}/>
            </button>

            {/* Header */}
            <div style={{marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px'}}>
                <span style={{background:'#dcfce7',color:'#166534',fontSize:'11px',fontWeight:'600',padding:'3px 10px',borderRadius:'20px'}}>{selectedUnit.code}</span>
                <span style={{fontSize:'10px',color:'#9ca3af'}}>{selectedUnit.mang}</span>
              </div>
              <h3 style={{fontSize:'18px',fontWeight:'500',color:'#111827',margin:'0 0 4px'}}>{selectedUnit.name}</h3>
              {selectedUnit.data_updated_at && (
                <div style={{fontSize:'11px',color:'#9ca3af'}}>Cập nhật: {new Date(selectedUnit.data_updated_at).toLocaleDateString('vi-VN')}</div>
              )}
            </div>

            {/* Diện tích + biểu đồ tròn */}
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'16px',marginBottom:'20px',padding:'16px',background:'#f9fafb',borderRadius:'12px'}}>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div>
                  <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'2px'}}>Tổng diện tích công viên</div>
                  <div style={{fontSize:'20px',fontWeight:'500',color:'#111827'}}>{selectedUnit.total_area_ha ? `${selectedUnit.total_area_ha} ha` : <span style={{fontSize:'13px',color:'#9ca3af'}}>Chưa cập nhật</span>}</div>
                </div>
                <div>
                  <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'2px'}}>Diện tích cảnh quan xanh</div>
                  <div style={{fontSize:'20px',fontWeight:'500',color:'#16a34a'}}>{selectedUnit.landscape_area_ha ? `${selectedUnit.landscape_area_ha} ha` : <span style={{fontSize:'13px',color:'#9ca3af'}}>Chưa cập nhật</span>}</div>
                </div>
                {selectedUnit.total_area_ha && selectedUnit.landscape_area_ha && (
                  <div style={{fontSize:'11px',color:'#6b7280'}}>Tỷ lệ cảnh quan: <strong style={{color:'#16a34a'}}>{landscapeRatio(selectedUnit)}%</strong></div>
                )}
              </div>
              <DonutChart total={selectedUnit.total_area_ha} landscape={selectedUnit.landscape_area_ha}/>
            </div>

            {/* Cây theo nhóm */}
            <div>
              <div style={{fontSize:'12px',fontWeight:'600',color:'#374151',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'12px'}}>Cây theo nhóm phân loại</div>
              {groups1.map(g1 => {
                const cnt1 = countByGroup1(g1.id, selectedUnit.id)
                if (cnt1 === 0) return null
                const children = groups2.filter(g => g.parent_id === g1.id)
                const maxCnt = Math.max(...groups1.map(g => countByGroup1(g.id, selectedUnit.id)), 1)
                return (
                  <div key={g1.id} style={{marginBottom:'12px'}}>
                    {/* Cấp 1 */}
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                      <div style={{fontSize:'12px',fontWeight:'500',color:'#111827',width:'140px',flexShrink:0}}>{g1.name}</div>
                      <div style={{flex:1,height:'10px',background:'#f3f4f6',borderRadius:'5px',overflow:'hidden'}}>
                        <div style={{height:'100%',background:'#16a34a',borderRadius:'5px',width:`${(cnt1/maxCnt)*100}%`,transition:'width 0.5s'}}/>
                      </div>
                      <div style={{fontSize:'12px',fontWeight:'600',color:'#111827',minWidth:'30px',textAlign:'right'}}>{cnt1}</div>
                    </div>
                    {/* Cấp 2 */}
                    {children.map(g2 => {
                      const cnt2 = countByGroup2(g2.id, selectedUnit.id)
                      if (cnt2 === 0) return null
                      return (
                        <div key={g2.id} style={{display:'flex',alignItems:'center',gap:'8px',paddingLeft:'12px',borderLeft:'2px solid #dcfce7',marginLeft:'4px',marginBottom:'3px'}}>
                          <div style={{fontSize:'11px',color:'#6b7280',width:'128px',flexShrink:0}}>{g2.name}</div>
                          <div style={{flex:1,height:'6px',background:'#f3f4f6',borderRadius:'3px',overflow:'hidden'}}>
                            <div style={{height:'100%',background:'#86efac',borderRadius:'3px',width:`${(cnt2/cnt1)*100}%`}}/>
                          </div>
                          <div style={{fontSize:'11px',color:'#6b7280',minWidth:'30px',textAlign:'right'}}>{cnt2}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              {countByUnit(selectedUnit.id) === 0 && (
                <div style={{textAlign:'center',padding:'20px',color:'#9ca3af',fontSize:'13px'}}>Chưa có dữ liệu cây cho đơn vị này</div>
              )}
            </div>

            {/* Tổng */}
            <div style={{marginTop:'16px',paddingTop:'16px',borderTop:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:'13px',color:'#6b7280'}}>Tổng số loài cây: <strong style={{color:'#16a34a'}}>{countByUnit(selectedUnit.id)}</strong></span>
              <Link href={`/plants?unit=${selectedUnit.id}`} style={{fontSize:'12px',color:'#16a34a',border:'1px solid #16a34a',padding:'6px 14px',borderRadius:'20px',textDecoration:'none'}}>
                Xem tất cả →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* GOALS */}
      <section style={{padding:'64px 24px',background:'#fff'}}>
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'11px',fontWeight:'500',color:'#16a34a',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'10px'}}>Mục tiêu</div>
            <h2 style={{fontSize:'36px',fontWeight:'300',color:'#111827',marginBottom:'12px'}}>Tại sao cần số hóa?</h2>
            <p style={{color:'#6b7280',maxWidth:'520px',margin:'0 auto',lineHeight:'1.7',fontSize:'15px'}}>Giải quyết những thách thức thực tế trong quản lý cảnh quan quy mô lớn.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            {GOALS.map((g,i)=>(
              <div key={i} style={{display:'flex',gap:'16px',padding:'24px',borderRadius:'12px',border:'0.5px solid #e5e7eb',background:'#fff',transition:'all 0.2s'}}
                onMouseOver={e=>{(e.currentTarget as HTMLElement).style.borderColor='#86efac';(e.currentTarget as HTMLElement).style.background='#f0fdf4'}}
                onMouseOut={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e5e7eb';(e.currentTarget as HTMLElement).style.background='#fff'}}>
                <div style={{width:'44px',height:'44px',background:'#dcfce7',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <g.icon size={22} style={{color:'#16a34a'}}/>
                </div>
                <div>
                  <h3 style={{fontWeight:'500',color:'#111827',marginBottom:'6px',fontSize:'15px'}}>{g.title}</h3>
                  <p style={{color:'#6b7280',fontSize:'13px',lineHeight:'1.65'}}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{position:'relative',height:'280px',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80" alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'rgba(5,46,22,0.80)'}}/>
        <div style={{position:'relative',zIndex:2,textAlign:'center',padding:'0 24px'}}>
          <h2 style={{fontSize:'36px',fontWeight:'300',color:'#fff',marginBottom:'10px'}}>Bắt đầu khám phá</h2>
          <p style={{color:'rgba(200,255,200,0.75)',fontSize:'15px',marginBottom:'28px'}}>Tra cứu hàng trăm loài cây cảnh quan hoặc đăng nhập quản trị hệ thống.</p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
            <Link href="/plants" style={{background:'#fff',color:'#14532d',fontWeight:'500',fontSize:'14px',padding:'12px 28px',borderRadius:'10px',display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
              Thư viện cây <ArrowRight size={16}/>
            </Link>
            <Link href="/admin" style={{border:'1.5px solid rgba(255,255,255,0.4)',color:'#fff',fontSize:'14px',padding:'12px 28px',borderRadius:'10px',textDecoration:'none'}}>
              Quản trị hệ thống
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#0f172a',padding:'28px 24px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'6px'}}>
          <Leaf size={15} style={{color:'#86efac'}}/>
          <span style={{color:'#d1fae5',fontSize:'14px',fontWeight:'500',letterSpacing:'0.05em'}}>SUNGROUP</span>
          <span style={{color:'rgba(200,255,200,0.4)',fontSize:'14px'}}>·</span>
          <span style={{color:'rgba(200,255,200,0.7)',fontSize:'13px'}}>Landscape Khối SHE</span>
        </div>
        <p style={{color:'#4b5563',fontSize:'12px'}}>Khối Giải trí & Nghỉ dưỡng · {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
