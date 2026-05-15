'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Leaf, ArrowRight, Database, Users, Target, ChevronLeft, ChevronRight } from 'lucide-react'

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

const PARKS = [
  { name: 'Ba Na Hills', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', loc: 'Đà Nẵng' },
  { name: 'Fansipan Legend', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', loc: 'Lào Cai' },
  { name: 'Ha Long', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80', loc: 'Quảng Ninh' },
  { name: 'Hon Thom', img: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=80', loc: 'Phú Quốc' },
  { name: 'Ba Den Mountain', img: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400&q=80', loc: 'Tây Ninh' },
  { name: 'InterContinental', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', loc: 'Đà Nẵng' },
]

const GOALS = [
  { icon: Database, title: 'Số hóa tri thức', desc: 'Chuyển toàn bộ kiến thức cảnh quan từ sổ tay, Excel thành hệ thống số thống nhất, dễ tra cứu.' },
  { icon: Users, title: 'Chia sẻ nội bộ', desc: 'Đội cảnh quan 23 đơn vị cùng đóng góp, kế thừa kinh nghiệm lẫn nhau — không mất đi khi nhân sự thay đổi.' },
  { icon: Leaf, title: 'Chuẩn hóa chất lượng', desc: 'Thống nhất tiêu chuẩn chọn cây, trồng và chăm sóc trên toàn hệ thống Khối SHE.' },
  { icon: Target, title: 'Ra quyết định tốt hơn', desc: 'Dữ liệu thực tế từ thực địa giúp lãnh đạo lập kế hoạch cảnh quan chính xác, tiết kiệm chi phí.' },
]

export default function HomePage() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(c => (c + 1) % SLIDES.length)

  return (
    <div className="min-h-screen bg-white">

      {/* HERO SLIDESHOW */}
      <section className="relative h-screen overflow-hidden">
        {/* Slides */}
        {SLIDES.map((src, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === current ? 1 : 0 }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,20,0,0.5) 50%, rgba(0,15,0,0.82) 100%)'}} />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6 flex items-center justify-between">
          {/* Logo */}
          <div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600', letterSpacing: '0.12em', lineHeight: 1 }}>SUNGROUP</div>
            <div style={{ color: 'rgba(200,255,200,0.85)', fontSize: '12px', marginTop: '3px', letterSpacing: '0.04em' }}>SHE — Khối Giải trí & Nghỉ dưỡng</div>
          </div>
          {/* Nav */}
          <div className="flex gap-3 items-center">
            <Link href="/plants" className="text-white/85 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Tra cứu cây
            </Link>
            <Link href="/admin" className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/30 text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              Quản trị
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <div className="mb-4" style={{color: 'rgba(200,255,200,0.7)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase'}}>
            Landscape Khối SHE
          </div>
          <h1 style={{fontSize: '62px', fontWeight: '300', color: '#fff', lineHeight: 1.1, marginBottom: '8px', letterSpacing: '-0.01em'}}>
            Làm đẹp
          </h1>
          <h2 style={{fontSize: '48px', fontWeight: '400', color: '#86efac', fontStyle: 'italic', marginBottom: '24px'}}>
            những vùng đất
          </h2>
          <p style={{color: 'rgba(255,255,255,0.72)', fontSize: '16px', maxWidth: '540px', lineHeight: '1.75', marginBottom: '36px'}}>
            Nền tảng số hóa tri thức cảnh quan của <strong style={{color:'#fff'}}>23 đơn vị</strong> thuộc Khối Giải trí & Nghỉ dưỡng Sun Group — từ núi rừng Bà Nà đến bãi biển Phú Quốc.
          </p>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center'}}>
            <Link href="/plants" style={{background:'#fff', color:'#14532d', fontWeight:'500', fontSize:'14px', padding:'12px 28px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'8px', textDecoration:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
              Khám phá thư viện cây <ArrowRight size={16} />
            </Link>
            <Link href="/admin/plants" style={{background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontWeight:'400', fontSize:'14px', padding:'12px 28px', borderRadius:'10px', textDecoration:'none'}}>
              Vào trang quản trị
            </Link>
          </div>
        </div>

        {/* Slide controls */}
        <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all">
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{width: i === current ? '24px' : '8px', height:'8px', borderRadius:'4px', background: i === current ? '#fff' : 'rgba(255,255,255,0.4)', border:'none', cursor:'pointer', transition:'all 0.3s'}} />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-8 right-8 z-20 text-white/50 text-sm">
          {String(current + 1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
        </div>
      </section>

      {/* STATS */}
      <section style={{background:'#14532d', padding:'40px 24px'}}>
        <div style={{maxWidth:'960px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', textAlign:'center'}}>
          {[
            { value: '23', label: 'Đơn vị thành viên', sub: 'Giải trí & Nghỉ dưỡng' },
            { value: '193+', label: 'Loài cây', sub: 'Đang cập nhật' },
            { value: '6', label: 'Nhóm phân loại', sub: 'Cấp 1' },
            { value: '4', label: 'Vùng khí hậu', sub: 'Từ núi cao đến biển' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{fontSize:'42px', fontWeight:'300', color:'#fff', lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:'13px', color:'#86efac', marginTop:'6px', fontWeight:'500'}}>{s.label}</div>
              <div style={{fontSize:'11px', color:'rgba(200,255,200,0.45)', marginTop:'2px'}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PARKS */}
      <section style={{padding:'64px 24px', background:'#f9fafb'}}>
        <div style={{maxWidth:'960px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'40px'}}>
            <div style={{fontSize:'11px', fontWeight:'500', color:'#16a34a', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'10px'}}>Hệ thống đơn vị</div>
            <h2 style={{fontSize:'36px', fontWeight:'300', color:'#111827', marginBottom:'12px'}}>Từ núi cao đến biển đảo</h2>
            <p style={{color:'#6b7280', maxWidth:'520px', margin:'0 auto', lineHeight:'1.7', fontSize:'15px'}}>Mỗi đơn vị mang một hệ sinh thái và điều kiện khí hậu khác nhau — tạo nên sự đa dạng cảnh quan đặc sắc của Khối SHE.</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px'}}>
            {PARKS.map(p => (
              <div key={p.name} style={{position:'relative', borderRadius:'12px', overflow:'hidden', height:'200px', cursor:'pointer'}}>
                <img src={p.img} alt={p.name} style={{width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s'}}
                  onMouseOver={e => (e.currentTarget.style.transform='scale(1.05)')}
                  onMouseOut={e => (e.currentTarget.style.transform='scale(1)')} />
                <div style={{position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)'}} />
                <div style={{position:'absolute', bottom:'12px', left:'14px'}}>
                  <div style={{color:'#fff', fontWeight:'500', fontSize:'14px'}}>{p.name}</div>
                  <div style={{color:'rgba(255,255,255,0.6)', fontSize:'12px'}}>{p.loc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{textAlign:'center', color:'#9ca3af', fontSize:'13px', marginTop:'16px'}}>và 17 đơn vị khác trong hệ thống...</p>
        </div>
      </section>

      {/* GOALS */}
      <section style={{padding:'64px 24px', background:'#fff'}}>
        <div style={{maxWidth:'960px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'40px'}}>
            <div style={{fontSize:'11px', fontWeight:'500', color:'#16a34a', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'10px'}}>Mục tiêu</div>
            <h2 style={{fontSize:'36px', fontWeight:'300', color:'#111827', marginBottom:'12px'}}>Tại sao cần số hóa?</h2>
            <p style={{color:'#6b7280', maxWidth:'520px', margin:'0 auto', lineHeight:'1.7', fontSize:'15px'}}>Giải quyết những thách thức thực tế trong quản lý cảnh quan quy mô lớn.</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            {GOALS.map((g, i) => (
              <div key={i} style={{display:'flex', gap:'16px', padding:'24px', borderRadius:'12px', border:'0.5px solid #e5e7eb', background:'#fff', transition:'all 0.2s'}}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor='#86efac'; (e.currentTarget as HTMLElement).style.background='#f0fdf4' }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor='#e5e7eb'; (e.currentTarget as HTMLElement).style.background='#fff' }}>
                <div style={{width:'44px', height:'44px', background:'#dcfce7', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <g.icon size={22} style={{color:'#16a34a'}} />
                </div>
                <div>
                  <h3 style={{fontWeight:'500', color:'#111827', marginBottom:'6px', fontSize:'15px'}}>{g.title}</h3>
                  <p style={{color:'#6b7280', fontSize:'13px', lineHeight:'1.65'}}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{position:'relative', height:'280px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80" alt="" style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}} />
        <div style={{position:'absolute', inset:0, background:'rgba(5,46,22,0.80)'}} />
        <div style={{position:'relative', zIndex:2, textAlign:'center', padding:'0 24px'}}>
          <h2 style={{fontSize:'36px', fontWeight:'300', color:'#fff', marginBottom:'10px'}}>Bắt đầu khám phá</h2>
          <p style={{color:'rgba(200,255,200,0.75)', fontSize:'15px', marginBottom:'28px'}}>Tra cứu hàng trăm loài cây cảnh quan hoặc đăng nhập quản trị hệ thống.</p>
          <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
            <Link href="/plants" style={{background:'#fff', color:'#14532d', fontWeight:'500', fontSize:'14px', padding:'12px 28px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
              Thư viện cây <ArrowRight size={16} />
            </Link>
            <Link href="/admin" style={{border:'1.5px solid rgba(255,255,255,0.4)', color:'#fff', fontSize:'14px', padding:'12px 28px', borderRadius:'10px', textDecoration:'none'}}>
              Quản trị hệ thống
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#0f172a', padding:'28px 24px', textAlign:'center'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'6px'}}>
          <Leaf size={15} style={{color:'#86efac'}} />
          <span style={{color:'#d1fae5', fontSize:'14px', fontWeight:'500', letterSpacing:'0.05em'}}>SUNGROUP</span>
          <span style={{color:'rgba(200,255,200,0.4)', fontSize:'14px'}}>·</span>
          <span style={{color:'rgba(200,255,200,0.7)', fontSize:'13px'}}>Landscape Khối SHE</span>
        </div>
        <p style={{color:'#4b5563', fontSize:'12px'}}>Khối Giải trí & Nghỉ dưỡng · {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
