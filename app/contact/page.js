"use client";

import { useState, useEffect, useRef } from "react";

/* ── Floating orb background (hero) ── */
function HeroOrbs() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }} aria-hidden>
      <div style={{
        position:"absolute", top:"10%", left:"5%", width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
        filter:"blur(40px)", animation:"drift1 18s ease-in-out infinite"
      }}/>
      <div style={{
        position:"absolute", bottom:"10%", right:"6%", width:300, height:300, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)",
        filter:"blur(50px)", animation:"drift2 22s ease-in-out infinite"
      }}/>
    </div>
  );
}

/* ── Dot pattern (hero) ── */
function DotPattern() {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.08 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

const contactItems = [
  {
    label: "Phone", value: "Hot line 077 686 7877 · 077 726 4913 · 076 462 7447", href: "tel:94776867877",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    // label: "Email", value: "sales.colombopvc@gmail.com", href: "mailto:sales.colombopvc@gmail.com",
    label: "Email", value: "buddikakb4@gmail.com", href: "mailto:buddikakb4@gmail.com",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Address", value: "No. 192/4, Srimath Bandaranayaka Mawatha, Colombo 12", href: null,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const businessHours = [
  { days: "Monday – Saturday", time: "9:00 AM – 6:00 PM" },
  { days: "Sunday",            time: "10:00 AM – 1:00 PM" },
];

/* ── Tilt card ── */
function TiltCard({ children }) {
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
      style={{ transition:"transform 0.2s ease", willChange:"transform" }}>
      {children}
    </div>
  );
}

/* ── Count-up ── */
function CountUp({ end, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
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
  }, [end, duration]);
  return <span ref={ref}>{val}</span>;
}

/* ── Decorative rings ── */
function Rings() {
  return (
    <div style={{ position:"relative", height:180, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {[160,120,80].map((size, i) => (
        <div key={size} style={{
          position:"absolute", width:size, height:size, borderRadius:"50%",
          border:"1px solid rgba(251,191,36,0.4)",
          animation:`spinSlow ${[30,20,12][i]}s linear infinite`,
          animationDirection: i === 1 ? "reverse" : "normal"
        }}>
          <div style={{
            position:"absolute", top:-4, left:"50%", transform:"translateX(-50%)",
            width:8, height:8, borderRadius:"50%", background:"#fbbf24"
          }}/>
        </div>
      ))}
      <div style={{ position:"absolute", textAlign:"center" }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", color:"#94a3b8" }}>Est.</div>
        <div style={{ fontSize:28, fontWeight:800, color:"#f59e0b", lineHeight:1 }}>2009</div>
      </div>
    </div>
  );
}

function validateContactForm(data) {
  const errs = {};
  const trimmedName = data.name.trim();
  if (!trimmedName) errs.name = "Name is required.";
  else if (/\d/.test(trimmedName)) errs.name = "Numbers are not allowed in your full name.";
  else if (/[^\p{L}\s]/u.test(trimmedName))
    errs.name = "Special characters are not allowed in your full name.";

  if (!data.email.trim()) errs.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errs.email = "Enter a valid email address.";

  if (!data.message.trim()) errs.message = "Message is required.";

  return errs;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name:"", email:"", phone:"", subject:"", message:"" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errs = validateContactForm(formData);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      setFormData({ name:"", email:"", phone:"", subject:"", message:"" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    ...(fieldErrors[field] ? { borderColor: "#f87171", boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {}),
  });

  return (
    <main style={{ fontFamily:"'Outfit', sans-serif", background:"#ffffff", color:"#1e293b", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,-20px)} 66%{transform:translate(-15px,25px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-25px,15px)} 66%{transform:translate(20px,-30px)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes revealBar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes spinSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .anim-up   { animation: slideUp  0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-left { animation: slideLeft 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-fade { animation: fadeIn 1s ease both; }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.15s} .d3{animation-delay:0.25s}
        .d4{animation-delay:0.35s} .d5{animation-delay:0.45s} .d6{animation-delay:0.55s}

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

        .contact-card {
          display:flex; align-items:center; gap:16px;
          padding:18px 20px; border-radius:16px;
          border:1px solid #e2e8f0; background:#ffffff;
          text-decoration:none; color:inherit;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
        }
        .contact-card:hover {
          border-color:#fbbf24;
          box-shadow:0 4px 20px rgba(251,191,36,0.15);
          background:#fffbeb;
        }

        .field-wrap { display:flex; flex-direction:column; }
        .field-label {
          font-size:11px; font-weight:600; letter-spacing:0.12em;
          text-transform:uppercase; color:#94a3b8; margin-bottom:6px;
          transition:color 0.3s;
        }
        .field-wrap:focus-within .field-label { color:#f59e0b; }

        .cf-input {
          width:100%; padding:11px 16px; border-radius:10px;
          border:1px solid #e2e8f0; background:#f8fafc;
          font-family:'Outfit',sans-serif; font-size:14px; color:#1e293b;
          outline:none; transition:border-color 0.3s, box-shadow 0.3s, background 0.3s;
          caret-color:#fbbf24;
        }
        .cf-input::placeholder { color:#94a3b8; }
        .cf-input:focus { border-color:#fbbf24; background:#ffffff; box-shadow:0 0 0 3px rgba(251,191,36,0.15); }

        .cf-textarea {
          width:100%; padding:11px 16px; border-radius:10px;
          border:1px solid #e2e8f0; background:#f8fafc;
          font-family:'Outfit',sans-serif; font-size:14px; color:#1e293b;
          outline:none; resize:none; line-height:1.7;
          transition:border-color 0.3s, box-shadow 0.3s, background 0.3s;
          caret-color:#fbbf24;
        }
        .cf-textarea::placeholder { color:#94a3b8; }
        .cf-textarea:focus { border-color:#fbbf24; background:#ffffff; box-shadow:0 0 0 3px rgba(251,191,36,0.15); }

        .send-btn {
          position:relative; overflow:hidden;
          background:#fbbf24; border:none; cursor:pointer;
          color:#1e293b; font-family:'Outfit',sans-serif;
          font-size:14px; font-weight:700; letter-spacing:0.04em;
          padding:14px 36px; border-radius:12px;
          transition:background 0.3s, box-shadow 0.3s, transform 0.2s;
          box-shadow:0 4px 14px rgba(251,191,36,0.35);
        }
        .send-btn:hover { background:#f59e0b; box-shadow:0 6px 20px rgba(251,191,36,0.45); transform:translateY(-1px); }
        .send-btn:active { transform:translateY(0); }

        .success-overlay {
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          background:rgba(255,255,255,0.97); border-radius:24px;
          animation:fadeIn 0.4s ease; z-index:10;
        }
        .hours-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; }
        .hours-row + .hours-row { border-top:1px solid rgba(255,255,255,0.08); }

        @media(max-width:860px){
          .split-layout { flex-direction:column !important; }
          .split-left, .split-right { width:100% !important; }
          .hero-bg-text { display:none; }
          .stats-row { gap:24px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #451a03 100%)",
        padding:"80px 40px 64px", color:"#f8fafc"
      }}>
        <DotPattern />
        <HeroOrbs />

        <div className="hero-bg-text" style={{
          position:"absolute", right:"-1%", top:"50%", transform:"translateY(-50%)",
          fontSize:"clamp(100px,14vw,200px)", fontWeight:800, lineHeight:1,
          color:"rgba(251,191,36,0.05)", userSelect:"none", letterSpacing:"-0.03em"
        }}>PVC</div>

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="anim-fade d1" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <span className="live-dot"/>
            <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.8)" }}>
              Colombo PVC · Contact
            </span>
          </div>

          <h1 className="anim-up d2" style={{ fontSize:"clamp(48px,7vw,96px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.02em", margin:"0 0 4px" }}>
            Get in
          </h1>
          <h1 className="anim-up d3" style={{ fontSize:"clamp(48px,7vw,96px)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.02em", margin:0 }}>
            Touch<span style={{ color:"#fbbf24" }}>.</span>
          </h1>

          <span className="gold-bar d4" style={{ marginTop:24, marginBottom:24 }}/>

          <p className="anim-up d4" style={{ fontSize:15, color:"rgba(248,250,252,0.6)", maxWidth:420, lineHeight:1.8, fontWeight:400 }}>
            Questions about products, orders, or a project?<br/>
            We usually reply within 24 hours.
          </p>

          <div className="anim-up d5 stats-row" style={{ display:"flex", gap:40, marginTop:48, flexWrap:"wrap" }}>
            {[{n:24,suffix:"h",label:"Response time"},{n:15,suffix:"+",label:"Years experience"},{n:98,suffix:"%",label:"Satisfaction rate"}].map(({ n, suffix, label }) => (
              <div key={label} style={{ borderLeft:"2px solid rgba(251,191,36,0.4)", paddingLeft:18 }}>
                <div style={{ fontSize:36, fontWeight:800, lineHeight:1, color:"#fbbf24" }}>
                  <CountUp end={n}/>{suffix}
                </div>
                <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(248,250,252,0.45)", marginTop:4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <section style={{ padding:"72px 40px", maxWidth:1200, margin:"0 auto" }}>
        <div className="split-layout" style={{ display:"flex", gap:72, alignItems:"flex-start" }}>

          {/* LEFT */}
          <div className="split-left" style={{ width:"42%", flexShrink:0 }}>
            <div className="anim-left d1" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
              <div style={{ width:28, height:2, background:"#fbbf24", borderRadius:2 }}/>
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#f59e0b" }}>Channels</span>
            </div>

            <h2 className="anim-up d2" style={{ fontSize:36, fontWeight:700, lineHeight:1.15, marginBottom:32, color:"#0f172a" }}>
              Say hello,<br/><span style={{ fontWeight:300, color:"#64748b" }}>pick your channel</span>
            </h2>

            <div className="anim-up d3" style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:32 }}>
              {contactItems.map((item) => (
                <TiltCard key={item.label}>
                  {item.href ? (
                    <a href={item.href} className="contact-card">
                      <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:"#fef3c7", color:"#d97706", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {item.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontSize:15, fontWeight:500, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.value}</div>
                      </div>
                      <svg width="18" height="18" fill="none" stroke="#cbd5e1" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </a>
                  ) : (
                    <div className="contact-card" style={{ cursor:"default" }}>
                      <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:"#fef3c7", color:"#d97706", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {item.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontSize:15, fontWeight:500, color:"#1e293b" }}>{item.value}</div>
                      </div>
                    </div>
                  )}
                </TiltCard>
              ))}
            </div>

            {/* Business hours */}
            <div className="anim-up d4" style={{ borderRadius:16, background:"#0f172a", color:"#f8fafc", padding:"24px 24px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <svg width="14" height="14" fill="none" stroke="#fbbf24" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"#fbbf24" }}>Business hours</span>
              </div>
              {businessHours.map((row) => (
                <div key={row.days} className="hours-row">
                  <span style={{ fontSize:13, fontWeight:400, color: row.time === "Closed" ? "#475569" : "#cbd5e1" }}>{row.days}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: row.time === "Closed" ? "#f87171" : "#fbbf24" }}>{row.time}</span>
                </div>
              ))}
            </div>

            <div className="anim-fade d6"><Rings /></div>
          </div>

          {/* RIGHT: FORM */}
          <div className="split-right" style={{ flex:1 }}>
            <div className="anim-left d1" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
              <div style={{ width:28, height:2, background:"#fbbf24", borderRadius:2 }}/>
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#f59e0b" }}>Send a message</span>
            </div>

            <h2 className="anim-up d2" style={{ fontSize:36, fontWeight:700, lineHeight:1.15, marginBottom:36, color:"#0f172a" }}>
              We read every<br/><span style={{ fontWeight:300, color:"#64748b" }}>single message.</span>
            </h2>

            <div className="anim-up d3" style={{
              position:"relative", background:"#f8fafc", borderRadius:24,
              border:"1px solid #e2e8f0", padding:"36px 36px 32px",
              boxShadow:"0 8px 32px rgba(15,23,42,0.06)"
            }}>
              {submitted && (
                <div className="success-overlay">
                  <div style={{ width:64, height:64, borderRadius:"50%", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                    <svg width="30" height="30" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div style={{ fontSize:24, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Message sent!</div>
                  <div style={{ fontSize:14, color:"#64748b" }}>We'll get back to you soon.</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {submitError && (
                  <div
                    role="alert"
                    style={{
                      marginBottom:20,
                      padding:"12px 14px",
                      borderRadius:10,
                      background:"#fef2f2",
                      border:"1px solid #fecaca",
                      color:"#b91c1c",
                      fontSize:13,
                      lineHeight:1.5,
                    }}
                  >
                    {submitError}
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                  <div className="field-wrap">
                    <label className="field-label">Full name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="cf-input"
                      style={inputStyle("name")}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                    {fieldErrors.name && (
                      <span style={{ fontSize:12, color:"#dc2626", marginTop:6 }}>{fieldErrors.name}</span>
                    )}
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="cf-input"
                      style={inputStyle("email")}
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                    {fieldErrors.email && (
                      <span style={{ fontSize:12, color:"#dc2626", marginTop:6 }}>{fieldErrors.email}</span>
                    )}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                  <div className="field-wrap">
                    <label className="field-label">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="cf-input" placeholder="Phone number" autoComplete="tel"/>
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">Subject</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="cf-input" placeholder="How can we help?"/>
                  </div>
                </div>
                <div className="field-wrap" style={{ marginBottom:28 }}>
                  <label className="field-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="cf-textarea"
                    style={inputStyle("message")}
                    placeholder="Tell us everything..."
                  />
                  {fieldErrors.message && (
                    <span style={{ fontSize:12, color:"#dc2626", marginTop:6 }}>{fieldErrors.message}</span>
                  )}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                  <button type="submit" className="send-btn" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}>
                    {submitting ? "Sending…" : "Send message →"}
                  </button>
                  <span style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>
                    We reply within <strong style={{ color:"#f59e0b" }}>24 hours</strong>
                  </span>
                </div>
              </form>
            </div>

            <div className="anim-fade d6" style={{ marginTop:48, paddingTop:24, borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <span style={{ fontSize:12, color:"#94a3b8" }}>Colombo PVC — No. 192/4, Srimath Bandaranayaka Mawatha, Colombo 12</span>
              
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}