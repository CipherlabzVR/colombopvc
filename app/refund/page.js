export default function RefundPage() {
  const lastUpdated = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const sections = [
    {
      num: "01",
      title: "Introduction",
      symbol: "◆",
      content: (
        <>
          <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8, marginBottom:16 }}>
            Colombo PVC Center will refund a purchase (selected items) for the exact amount, deducting the following:
          </p>
          <ul style={{ margin:"0 0 16px 0", padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
            {["Any delivery costs already incurred by Colombo PVC Center","Any restocking fee for special orders"].map(t => (
              <li key={t} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ marginTop:6, width:6, height:6, borderRadius:"50%", background:"#fbbf24", flexShrink:0 }}/>
                <span style={{ fontSize:15, color:"#64748b", lineHeight:1.7 }}>{t}</span>
              </li>
            ))}
          </ul>
          <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
            Refunds will only be processed as per the refund and return policy mentioned below and special details provided in the product you purchased. We will also consider the payment method used when the order was created, and funds will be returned via the same channel (e.g. credit card, KOKO, bank transfer).
          </p>
        </>
      ),
    },
    {
      num: "02",
      title: "Valid Reasons to Return",
      symbol: "◇",
      content: (
        <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
          {[
            "The delivered product is damaged (physically destroyed or broken) or defective (e.g. unable to switch on).",
            "The delivered product is incomplete (i.e. has missing items and/or accessories).",
            "The delivered product is not as advertised (i.e. does not match product description or picture).",
            "The delivered product does not fit.",
            "The delivered product is incorrect (i.e. wrong product/size/colour, fake/counterfeit item, or expired).",
          ].map(t => (
            <li key={t} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ marginTop:6, width:6, height:6, borderRadius:"50%", background:"#fbbf24", flexShrink:0 }}/>
              <span style={{ fontSize:15, color:"#64748b", lineHeight:1.7 }}>{t}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      num: "03",
      title: "Return Policy",
      symbol: "▣",
      content: (
        <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
          {[
            "Colombo PVC Center must be informed within 24 hours of any cancellation, before goods are dispatched from our stores. Some product orders may not be cancellable upon confirmation, which will be noted on the product page.",
            "Colombo PVC Center must be informed within 7 days for any eligible returns.",
            "Items must be in original packaging with tags intact, in the same condition as delivered.",
            "Items returned after the return period has lapsed will not be accepted.",
            "Items to be returned are the sole responsibility of the customer until they reach us. Ensure items are properly packed to prevent damage en route — damaged items will not be accepted.",
            "It is the customer's responsibility to ensure proof of postage for returned parcels.",
            "Colombo PVC Center requires a minimum of 5–7 business days to process your return request and ready the replacement unit.",
            "You may also return a product at your cost to our store, provided you have the original invoice/proof of purchase along with any warranty certificates and have complied with all required terms.",
          ].map(t => (
            <li key={t} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ marginTop:6, width:6, height:6, borderRadius:"50%", background:"#fbbf24", flexShrink:0 }}/>
              <span style={{ fontSize:15, color:"#64748b", lineHeight:1.7 }}>{t}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      num: "04",
      title: "Refund Policy",
      symbol: "◈",
      content: (
        <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
          {[
            "Colombo PVC Center, in its sole discretion, reserves the right to initiate all refunds via electronic mediums.",
            "A refund can take up to 7 working days to reflect in your account, and fund transfers are subject to verification of your banking details.",
            "We reserve the right not to refund the delivery fee for late cancellations. If your payment is cancelled or ceases to be valid for any reason, you remain bound to pay the full purchase price including any recovery costs incurred by us.",
            "If a replacement unit for the size/specific model is no longer available, the customer will be issued a full refund. The refund will not include delivery charges borne by the customer for the return.",
          ].map(t => (
            <li key={t} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ marginTop:6, width:6, height:6, borderRadius:"50%", background:"#fbbf24", flexShrink:0 }}/>
              <span style={{ fontSize:15, color:"#64748b", lineHeight:1.7 }}>{t}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      num: "05",
      title: "Product Pricing",
      symbol: "◉",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          The prices for all items listed on Colombopvc.lk are the final and last prices of sale via online means.
        </p>
      ),
    },
  ];

  const quickFacts = [
    { icon:"🕐", label:"Cancellation window", value:"Within 24h" },
    { icon:"📦", label:"Return window",        value:"Within 7 days" },
    { icon:"💳", label:"Refund processing",    value:"5–7 business days" },
    { icon:"🔄", label:"Refund method",        value:"Original payment" },
  ];

  return (
    <main style={{ fontFamily:"'Outfit', sans-serif", background:"#ffffff", color:"#1e293b", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(28px,-18px)} 66%{transform:translate(-14px,22px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-22px,14px)} 66%{transform:translate(18px,-26px)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes revealBar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spinSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .anim-up  { animation: slideUp  0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-fade{ animation: fadeIn 1s ease both; }
        .d1{animation-delay:0.05s}.d2{animation-delay:0.15s}.d3{animation-delay:0.25s}
        .d4{animation-delay:0.35s}.d5{animation-delay:0.45s}

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
        .section-tag { display:inline-flex; align-items:center; gap:10px; margin-bottom:28px; }
        .section-tag-line { width:28px; height:2px; background:#fbbf24; border-radius:2px; }
        .section-tag-text { font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:#f59e0b; }

        .policy-card {
          border:1px solid #e2e8f0; border-radius:18px;
          background:#ffffff; overflow:hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .policy-card:hover {
          border-color:#fbbf24;
          box-shadow:0 6px 24px rgba(251,191,36,0.10);
        }

        .quick-card {
          padding:20px 18px; border-radius:16px;
          border:1px solid #e2e8f0; background:#f8fafc;
          display:flex; align-items:center; gap:14px;
          transition: border-color 0.3s, background 0.3s;
        }
        .quick-card:hover { border-color:#fbbf24; background:#fffbeb; }

        .side-ring {
          width:100px; height:100px; border-radius:50%;
          border:1px solid rgba(251,191,36,0.3);
          position:absolute;
          animation: spinSlow 30s linear infinite;
        }
        .side-ring::before {
          content:''; position:absolute; top:-3px; left:50%;
          transform:translateX(-50%);
          width:6px; height:6px; border-radius:50%; background:#fbbf24;
        }

        .cta-btn {
          display:inline-block; background:#fbbf24; color:#0f172a;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:14px;
          padding:13px 32px; border-radius:12px; text-decoration:none;
          box-shadow:0 4px 14px rgba(251,191,36,0.35);
          transition:background 0.3s, box-shadow 0.3s, transform 0.2s;
        }
        .cta-btn:hover { background:#f59e0b; box-shadow:0 6px 20px rgba(251,191,36,0.45); transform:translateY(-1px); }

        @media(max-width:900px){
          .page-layout { flex-direction:column !important; }
          .sidebar { width:100% !important; position:static !important; }
          .hero-bg-text { display:none !important; }
          .quick-grid { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:520px){
          .quick-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #451a03 100%)",
        padding:"80px 40px 64px", color:"#f8fafc"
      }}>
        {/* Dot pattern */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
        {/* Orbs */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }} aria-hidden>
          <div style={{ position:"absolute", top:"8%", left:"4%", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,191,36,0.16) 0%, transparent 70%)", filter:"blur(40px)", animation:"drift1 18s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", bottom:"10%", right:"5%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)", filter:"blur(50px)", animation:"drift2 22s ease-in-out infinite" }}/>
        </div>

        <div className="hero-bg-text" style={{
          position:"absolute", right:"-1%", top:"50%", transform:"translateY(-50%)",
          fontSize:"clamp(80px,11vw,170px)", fontWeight:800, lineHeight:1,
          color:"rgba(251,191,36,0.04)", userSelect:"none", letterSpacing:"-0.03em"
        }}>REFUND</div>

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="anim-fade d1" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <span className="live-dot"/>
            <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.8)" }}>
              Legal · Colombo PVC Center
            </span>
          </div>

          <h1 className="anim-up d2" style={{ fontSize:"clamp(44px,7vw,92px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.02em", margin:"0 0 4px" }}>
            Refund
          </h1>
          <h1 className="anim-up d3" style={{ fontSize:"clamp(44px,7vw,92px)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.02em", margin:0 }}>
            Policy<span style={{ color:"#fbbf24" }}>.</span>
          </h1>

          <span className="gold-bar d4" style={{ marginTop:24, marginBottom:24 }}/>

          <p className="anim-up d4" style={{ fontSize:15, color:"rgba(248,250,252,0.6)", maxWidth:400, lineHeight:1.8, fontWeight:400 }}>
            We want every purchase to be right. Here's exactly how returns and refunds work.
          </p>

          <div className="anim-fade d5" style={{
            display:"inline-flex", alignItems:"center", gap:8, marginTop:32,
            padding:"8px 16px", borderRadius:999,
            border:"1px solid rgba(251,191,36,0.25)", background:"rgba(251,191,36,0.06)"
          }}>
            <svg width="13" height="13" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:12, color:"rgba(251,191,36,0.75)", fontWeight:500 }}>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* ── QUICK FACTS STRIP ── */}
      <section style={{ padding:"32px 40px 0", maxWidth:1100, margin:"0 auto" }}>
        <div className="quick-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {quickFacts.map(({ icon, label, value }) => (
            <div key={label} className="quick-card">
              <span style={{ fontSize:24, flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding:"56px 40px 80px", maxWidth:1100, margin:"0 auto" }}>
        <div className="page-layout" style={{ display:"flex", gap:48, alignItems:"flex-start" }}>

          {/* ── POLICY SECTIONS ── */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>
            {sections.map((sec) => (
              <div key={sec.num} className="policy-card">
                {/* Card header */}
                <div style={{
                  display:"flex", alignItems:"center", gap:16,
                  padding:"22px 24px", borderBottom:"1px solid #f1f5f9",
                  background:"#fafafa"
                }}>
                  <div style={{
                    width:40, height:40, borderRadius:12, flexShrink:0,
                    background:"#0f172a", color:"#fbbf24",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, letterSpacing:"0.05em"
                  }}>{sec.num}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:16, color:"#fbbf24" }} aria-hidden>{sec.symbol}</span>
                    <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", margin:0, textTransform:"uppercase", letterSpacing:"0.04em" }}>
                      {sec.title}
                    </h2>
                  </div>
                </div>
                {/* Card body */}
                <div style={{ padding:"24px 24px 24px 24px" }}>
                  {sec.content}
                </div>
              </div>
            ))}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="sidebar" style={{ width:272, flexShrink:0, position:"sticky", top:24, display:"flex", flexDirection:"column", gap:14 }}>

            {/* CTA card */}
            <div style={{
              borderRadius:20, background:"#0f172a", color:"#f8fafc",
              padding:"28px 24px", borderTop:"3px solid #fbbf24",
              position:"relative", overflow:"hidden"
            }}>
              <div className="side-ring" style={{ top:-30, right:-30, opacity:0.25 }}/>
              <div className="side-ring" style={{ width:64, height:64, top:-4, right:-4, opacity:0.15, animationDirection:"reverse", animationDuration:"18s" }}/>
              <div style={{ position:"relative" }}>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.7)", marginBottom:10 }}>Need help?</div>
                <h3 style={{ fontSize:19, fontWeight:700, lineHeight:1.3, marginBottom:12, color:"#f8fafc" }}>
                  Have a question about a return?
                </h3>
                <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:20 }}>
                  Our team is happy to guide you through the process.
                </p>
                <a href="/contact" className="cta-btn" style={{ display:"block", textAlign:"center" }}>
                  Contact us →
                </a>
              </div>
            </div>

            {/* At a glance */}
            <div style={{ borderRadius:18, border:"1px solid #e2e8f0", padding:"22px 20px", background:"#f8fafc" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#94a3b8", marginBottom:14 }}>
                At a glance
              </div>
              {[
                { label:"Cancellation", value:"Within 24h of order" },
                { label:"Return window", value:"7 days from delivery" },
                { label:"Processing time", value:"5–7 business days" },
                { label:"Refund channel", value:"Original payment method" },
                { label:"Condition required", value:"Unopened, original packaging" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding:"9px 0", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#94a3b8", marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Quick contact */}
            <div style={{ borderRadius:18, border:"1px solid #e2e8f0", padding:"20px", background:"#f8fafc" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#94a3b8", marginBottom:12 }}>
                Quick contact
              </div>
              {[
                { icon:"📞", label:"Call", value:"077 686 7877 (Hot line)", href:"tel:94776867877" },
                { icon:"✉️", label:"Email", value:"sales.colombopvc@gmail.com", href:"mailto:sales.colombopvc@gmail.com" },
              ].map(({ icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 py-2.5 px-2.5 rounded-xl no-underline text-inherit transition-colors mb-1 hover:bg-amber-100/70"
                >
                  <span style={{ fontSize:17 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:10, fontWeight:600, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{value}</div>
                  </div>
                </a>
              ))}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}