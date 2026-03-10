"use client";

import { useEffect, useRef, useState } from "react";
import TestimonialsSection from "@/components/TestimonialsSection";

/* ── Floating orbs ── */
function HeroOrbs() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }} aria-hidden>
      <div style={{ position:"absolute", top:"8%", left:"4%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,191,36,0.16) 0%, transparent 70%)", filter:"blur(40px)", animation:"drift1 18s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", bottom:"12%", right:"5%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)", filter:"blur(50px)", animation:"drift2 22s ease-in-out infinite" }}/>
    </div>
  );
}

/* ── Pipe/grid dot pattern ── */
function PipePattern() {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pipes" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 20h40v40H0V20zm40 0h40v40H40V20z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
          <circle cx="60" cy="20" r="4" fill="currentColor" />
          <circle cx="20" cy="60" r="4" fill="currentColor" />
          <circle cx="60" cy="60" r="4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pipes)" />
    </svg>
  );
}

/* ── Tilt card ── */
function TiltCard({ children, style = {} }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -8;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition:"transform 0.2s ease", willChange:"transform", ...style }}>
      {children}
    </div>
  );
}

/* ── Count-up ── */
function CountUp({ end, isNum = true, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!isNum) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(p * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, isNum, duration]);
  return <span ref={ref}>{isNum ? val : end}</span>;
}

/* ── Decorative spinning rings ── */
function Rings({ size = 120 }) {
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      {[1, 0.72, 0.46].map((scale, i) => (
        <div key={i} style={{
          position:"absolute",
          top: `${(1 - scale) * 50}%`, left: `${(1 - scale) * 50}%`,
          width:`${scale * 100}%`, height:`${scale * 100}%`,
          borderRadius:"50%", border:"1px solid rgba(251,191,36,0.4)",
          animation:`spinSlow ${[30,20,12][i]}s linear infinite`,
          animationDirection: i === 1 ? "reverse" : "normal"
        }}>
          <div style={{ position:"absolute", top:-3, left:"50%", transform:"translateX(-50%)", width:6, height:6, borderRadius:"50%", background:"#fbbf24" }}/>
        </div>
      ))}
    </div>
  );
}

const offerItems = [
  {
    title: "PVC Pipes & Fittings",
    desc: "Complete range for plumbing, drainage, and irrigation projects",
    num: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h16M4 16h16M8 4v16M16 4v16" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" /><circle cx="16" cy="8" r="1.5" fill="currentColor" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" /><circle cx="16" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Power Tools",
    desc: "Drills, saws, grinders, and more from trusted brands",
    num: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "Plumbing Supplies",
    desc: "Faucets, valves, connectors, and accessories",
    num: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    title: "Expert Advice",
    desc: "Our team helps you choose the right products for your project",
    num: "04",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const values = [
  { title: "Quality First", desc: "We stock only premium-grade products from reputable manufacturers to ensure durability and performance.", symbol: "◆" },
  { title: "Customer Focus", desc: "Your satisfaction is our priority. We work hard to provide excellent service and competitive prices.", symbol: "◇" },
  { title: "Trust & Reliability", desc: "From small repairs to large projects, you can count on us for consistent quality and honest advice.", symbol: "▣" },
  { title: "Local Expertise", desc: "We understand Colombo's building needs and climate—so our recommendations are always practical.", symbol: "◈" },
];

const stats = [
  { value: 2025, suffix: "", label: "Established", isNum: true },
  { value: 500,  suffix: "+", label: "Products",    isNum: true },
  { value: "Colombo", suffix: "", label: "Your Neighbourhood", isNum: false },
];

function useInView(threshold = 0.08) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function AboutPage() {
  const heroRef   = useInView(0.2);
  const storyRef  = useInView(0.08);
  const offerRef  = useInView(0.08);
  const valuesRef = useInView(0.08);

  return (
    <main style={{ fontFamily:"'Outfit', sans-serif", background:"#ffffff", color:"#1e293b", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(28px,-18px)} 66%{transform:translate(-14px,22px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-22px,14px)} 66%{transform:translate(18px,-26px)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes revealBar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes spinSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .anim-up   { animation: slideUp  0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-left { animation: slideLeft 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-fade { animation: fadeIn 1s ease both; }
        .d1{animation-delay:0.05s}.d2{animation-delay:0.15s}.d3{animation-delay:0.25s}
        .d4{animation-delay:0.35s}.d5{animation-delay:0.45s}.d6{animation-delay:0.55s}

        .gold-bar {
          display:block; height:2px; width:80px;
          background:linear-gradient(90deg,#fbbf24,transparent);
          transform-origin:left;
          animation: revealBar 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }
        .live-dot {
          display:inline-block; width:6px; height:6px; background:#fbbf24;
          border-radius:50%; margin-right:8px; animation:pulse 2s infinite;
        }
        .section-tag {
          display:inline-flex; align-items:center; gap:10px; margin-bottom:28px;
        }
        .section-tag-line { width:28px; height:2px; background:#fbbf24; border-radius:2px; }
        .section-tag-text { font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:#f59e0b; }

        .offer-card {
          display:flex; gap:20px; align-items:flex-start;
          padding:24px; border-radius:18px;
          border:1px solid #e2e8f0; background:#ffffff;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
        }
        .offer-card:hover {
          border-color:#fbbf24;
          box-shadow:0 6px 24px rgba(251,191,36,0.12);
          background:#fffbeb;
        }

        .value-card {
          padding:28px; border-radius:18px;
          border:1px solid #e2e8f0; background:#f8fafc;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
          cursor:default;
        }
        .value-card:hover {
          border-color:#fbbf24;
          box-shadow:0 6px 24px rgba(251,191,36,0.10);
          background:#ffffff;
          transform:translateY(-2px);
        }

        .stat-card {
          text-align:center; padding:28px 16px;
          border-right:1px solid #f1f5f9;
        }
        .stat-card:last-child { border-right:none; }

        /* Ticker tape */
        .ticker-wrap {
          overflow:hidden; background:#0f172a; padding:12px 0;
          border-top:1px solid rgba(251,191,36,0.2);
          border-bottom:1px solid rgba(251,191,36,0.2);
        }
        .ticker-inner {
          display:flex; white-space:nowrap;
          animation: ticker 22s linear infinite;
        }
        .ticker-item {
          display:inline-flex; align-items:center; gap:12px;
          padding:0 32px; font-size:12px; font-weight:600;
          letter-spacing:0.12em; text-transform:uppercase;
          color:rgba(251,191,36,0.7);
        }
        .ticker-dot { width:4px; height:4px; border-radius:50%; background:#fbbf24; flex-shrink:0; }

        @media(max-width:768px){
          .hero-bg-text { display:none !important; }
          .story-grid { flex-direction:column !important; }
          .stats-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section ref={heroRef.ref} style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #451a03 100%)",
        padding:"80px 40px 64px", color:"#f8fafc",
        transition:"opacity 0.7s", opacity: heroRef.inView ? 1 : 0
      }}>
        <PipePattern />
        <HeroOrbs />

        {/* Ghost text */}
        <div className="hero-bg-text" style={{
          position:"absolute", right:"-1%", top:"50%", transform:"translateY(-50%)",
          fontSize:"clamp(90px,13vw,190px)", fontWeight:800, lineHeight:1,
          color:"rgba(251,191,36,0.04)", userSelect:"none", letterSpacing:"-0.03em"
        }}>PVC</div>

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="anim-fade d1" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <span className="live-dot"/>
            <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.8)" }}>
              Your trusted partner
            </span>
          </div>

          <h1 className="anim-up d2" style={{ fontSize:"clamp(44px,7vw,92px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.02em", margin:"0 0 4px" }}>
            About Colombo
          </h1>
          <h1 className="anim-up d3" style={{ fontSize:"clamp(44px,7vw,92px)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.02em", margin:0, color:"#fbbf24" }}>
            PVC Center<span style={{ color:"#f8fafc" }}>.</span>
          </h1>

          <span className="gold-bar d4" style={{ marginTop:24, marginBottom:24 }}/>

          <p className="anim-up d4" style={{ fontSize:15, color:"rgba(248,250,252,0.6)", maxWidth:440, lineHeight:1.8, fontWeight:400 }}>
            Quality PVC products, plumbing supplies, and professional tools—<br/>right here in Colombo.
          </p>
        </div>
      </section>

      {/* ── TICKER TAPE ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_, gi) => (
            ["PVC Pipes & Fittings", "Power Tools", "Plumbing Supplies", "Expert Advice", "Quality First", "Colombo Sri Lanka", "Est. 2025"].map((t, i) => (
              <span key={`${gi}-${i}`} className="ticker-item">
                <span className="ticker-dot"/>{t}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <section style={{ padding:"0 40px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          background:"#ffffff", borderRadius:20,
          boxShadow:"0 8px 32px rgba(15,23,42,0.08)",
          border:"1px solid #e2e8f0",
          marginTop:-2, overflow:"hidden"
        }} className="stats-grid">
          {stats.map(({ value, suffix, label, isNum }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize:"clamp(28px,4vw,42px)", fontWeight:800, color:"#0f172a", lineHeight:1 }}>
                <CountUp end={value} isNum={isNum} />{suffix}
              </div>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"#94a3b8", marginTop:6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section ref={storyRef.ref} style={{
        padding:"80px 40px", maxWidth:1100, margin:"0 auto",
        transition:"opacity 0.7s", opacity: storyRef.inView ? 1 : 0
      }}>
        <div className="section-tag anim-left d1">
          <span className="section-tag-line"/><span className="section-tag-text">Our Story</span>
        </div>

        <div className="story-grid anim-up d2" style={{ display:"flex", gap:64, alignItems:"flex-start" }}>
          {/* Text */}
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, lineHeight:1.15, marginBottom:24, color:"#0f172a" }}>
              Built on quality,<br/><span style={{ fontWeight:300, color:"#64748b" }}>driven by trust.</span>
            </h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16, color:"#64748b", lineHeight:1.8, fontSize:15 }}>
              <p>Colombo PVC Center was established in 2025 with a simple mission: to provide high-quality PVC products, plumbing supplies, and professional tools to both homeowners and tradespeople across Colombo and Sri Lanka.</p>
              <p>What started as a small local shop has grown into a trusted destination for all your building and renovation needs. We believe every project—from a quick fix to a full renovation—deserves the right materials and honest advice.</p>
            </div>
          </div>

          {/* Quote + rings */}
          <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:32 }}>
            <div style={{
              borderRadius:20, background:"#0f172a", color:"#f8fafc",
              padding:"28px 28px 24px", maxWidth:260,
              borderTop:"3px solid #fbbf24"
            }}>
              <svg width="24" height="24" fill="#fbbf24" viewBox="0 0 24 24" style={{ marginBottom:12 }}>
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p style={{ fontSize:15, fontStyle:"italic", lineHeight:1.7, color:"#cbd5e1", margin:0 }}>
                "The right pipe, the right tool, the right advice—all in one place."
              </p>
            </div>
            <Rings size={130} />
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ── */}
      <section ref={offerRef.ref} style={{
        padding:"80px 40px",
        background:"linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        transition:"opacity 0.7s", opacity: offerRef.inView ? 1 : 0
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="section-tag anim-left d1">
            <span className="section-tag-line"/><span className="section-tag-text">What We Offer</span>
          </div>

          <h2 className="anim-up d2" style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, lineHeight:1.15, marginBottom:40, color:"#0f172a" }}>
            Everything your<br/><span style={{ fontWeight:300, color:"#64748b" }}>project needs.</span>
          </h2>

          <div className="anim-up d3" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:16 }}>
            {offerItems.map((item) => (
              <TiltCard key={item.title}>
                <div className="offer-card">
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{
                      width:52, height:52, borderRadius:14,
                      background:"#fef3c7", color:"#d97706",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}>{item.icon}</div>
                    <div style={{
                      position:"absolute", top:-8, right:-8,
                      width:20, height:20, borderRadius:"50%",
                      background:"#0f172a", color:"#fbbf24",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, fontWeight:700
                    }}>{item.num}</div>
                  </div>
                  <div>
                    <h3 style={{ fontWeight:700, fontSize:16, color:"#0f172a", marginBottom:6 }}>{item.title}</h3>
                    <p style={{ fontSize:13, color:"#64748b", lineHeight:1.6, margin:0 }}>{item.desc}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section ref={valuesRef.ref} style={{
        padding:"80px 40px",
        transition:"opacity 0.7s", opacity: valuesRef.inView ? 1 : 0
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="section-tag anim-left d1">
            <span className="section-tag-line"/><span className="section-tag-text">Our Values</span>
          </div>

          <h2 className="anim-up d2" style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, lineHeight:1.15, marginBottom:40, color:"#0f172a" }}>
            What we<br/><span style={{ fontWeight:300, color:"#64748b" }}>stand for.</span>
          </h2>

          <div className="anim-up d3" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:16 }}>
            {values.map((v, i) => (
              <TiltCard key={v.title}>
                <div className="value-card">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <span style={{ fontSize:22, color:"#fbbf24" }} aria-hidden>{v.symbol}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#cbd5e1", letterSpacing:"0.12em" }}>
                      {String(i + 1).padStart(2,"0")}
                    </span>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:17, color:"#0f172a", marginBottom:10 }}>{v.title}</h3>
                  <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7, margin:0 }}>{v.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding:"0 40px 80px" }}>
        <div style={{
          maxWidth:1100, margin:"0 auto",
          background:"linear-gradient(135deg, #0f172a 0%, #1e293b 80%, #451a03 100%)",
          borderRadius:24, padding:"48px 48px", position:"relative", overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:32, flexWrap:"wrap"
        }}>
          <PipePattern />
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.7)", marginBottom:10 }}>
              Ready to start?
            </div>
            <h3 style={{ fontSize:"clamp(22px,3vw,36px)", fontWeight:700, color:"#f8fafc", lineHeight:1.2, margin:0 }}>
              Let's talk about<br/>your project.
            </h3>
          </div>
          <a href="/contact" style={{
            position:"relative", flexShrink:0,
            background:"#fbbf24", color:"#0f172a",
            fontWeight:700, fontSize:14, letterSpacing:"0.04em",
            padding:"14px 36px", borderRadius:12, textDecoration:"none",
            boxShadow:"0 4px 16px rgba(251,191,36,0.35)",
            transition:"background 0.3s, box-shadow 0.3s, transform 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background="#f59e0b"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#fbbf24"; e.currentTarget.style.transform="translateY(0)"; }}>
            Get in touch →
          </a>
        </div>
      </section>

      <TestimonialsSection />
    </main>
  );
}