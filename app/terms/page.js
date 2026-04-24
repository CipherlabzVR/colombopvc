export default function TermsPage() {
  const effectiveDate = "March 2026";

  const sections = [
    {
      num: "01", symbol: "◆", title: "About Us",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          Colombo PVC Center is an e-commerce hardware store operating in Sri Lanka. We sell hardware, tools, construction materials, electrical supplies, and related products to consumers and businesses via <a href="https://www.colombopvc.lk" style={{ color:"#f59e0b", textDecoration:"none", fontWeight:600 }}>www.colombopvc.lk</a>.
        </p>
      ),
    },
    {
      num: "02", symbol: "◇", title: "Acceptance of Terms",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          By accessing our website, creating an account, or placing an order, you confirm that you are at least <strong style={{ color:"#0f172a" }}>18 years of age</strong>, legally capable of entering into a binding contract, and agree to these Terms of Service and our Privacy Policy.
        </p>
      ),
    },
    {
      num: "03", symbol: "▣", title: "Products & Availability",
      content: (
        <BulletList items={[
          "All products listed on our website are subject to availability.",
          "We reserve the right to limit quantities or discontinue products at any time.",
          "Product images are for illustrative purposes and may slightly differ from the actual item.",
          "We make every effort to display accurate product descriptions; however, we do not warrant that descriptions are error-free.",
        ]}/>
      ),
    },
    {
      num: "04", symbol: "◈", title: "Pricing & Payment",
      content: (
        <BulletList items={[
          "All prices are displayed in Sri Lankan Rupees (LKR) and are inclusive of applicable taxes unless stated otherwise.",
          "We reserve the right to change prices at any time without prior notice.",
          "Payment methods accepted: Credit/Debit Cards, Bank Transfer, and Cash on Delivery (COD).",
          "For Bank Transfer orders, payment must be confirmed within 24 hours or the order may be cancelled.",
          "COD orders are subject to a maximum order value limit as displayed at checkout.",
          "We reserve the right to cancel any order where payment is not successfully received.",
        ]}/>
      ),
    },
    {
      num: "05", symbol: "◉", title: "Order Processing",
      content: (
        <BulletList items={[
          "Orders are processed on business days (Monday–Friday, excluding public holidays in Sri Lanka).",
          "You will receive an order confirmation email after placing your order.",
          "We reserve the right to cancel or refuse any order at our discretion, including cases of pricing errors, suspected fraud, or product unavailability.",
          "If your order is cancelled after payment, a full refund will be issued.",
        ]}/>
      ),
    },
    {
      num: "06", symbol: "◆", title: "Delivery",
      content: (
        <BulletList items={[
          "We deliver to addresses within Sri Lanka.",
          "Estimated delivery times are 3–7 business days for standard delivery (may vary by location).",
          "Delivery times are estimates only and are not guaranteed.",
          "We are not liable for delays caused by courier services, weather, or other circumstances beyond our control.",
          "Risk of loss and title pass to the customer upon delivery.",
        ]}/>
      ),
    },
    {
      num: "07", symbol: "◇", title: "User Accounts",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          If you create an account on our website, you are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Please notify us immediately if you suspect unauthorised access to your account.
        </p>
      ),
    },
    {
      num: "08", symbol: "▣", title: "Prohibited Uses",
      content: (
        <>
          <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8, marginBottom:14 }}>You agree not to:</p>
          <BulletList items={[
            "Use our website for any unlawful purpose or in violation of any Sri Lankan law.",
            "Submit false, fraudulent, or misleading orders or information.",
            "Attempt to gain unauthorised access to any part of our website or systems.",
            "Use automated tools (bots, scrapers) to access or collect data from our website.",
            "Reproduce, distribute, or exploit any content from our website without prior written permission.",
          ]}/>
        </>
      ),
    },
    {
      num: "09", symbol: "◈", title: "Intellectual Property",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          All content on this website — including text, images, logos, product descriptions, and graphics — is the property of Colombo PVC Center or its licensors and is protected by applicable intellectual property laws. You may not reproduce or use any content without our express written consent.
        </p>
      ),
    },
    {
      num: "10", symbol: "◉", title: "Returns & Refunds",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          We accept returns of unused, unopened items in original packaging within <strong style={{ color:"#0f172a" }}>7 days</strong> of delivery. Damaged or defective products may be exchanged. Refunds are processed within 5–7 business days after we receive the returned item. Please refer to our full <a href="/refund-policy" style={{ color:"#f59e0b", textDecoration:"none", fontWeight:600 }}>Refund Policy</a> for complete details.
        </p>
      ),
    },
    {
      num: "11", symbol: "◆", title: "Limitation of Liability",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          To the fullest extent permitted by Sri Lankan law, Colombo PVC Center shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products — including but not limited to loss of profits, data, or business. Our total liability shall not exceed the amount paid for the specific order giving rise to the claim.
        </p>
      ),
    },
    {
      num: "12", symbol: "◇", title: "Disclaimer of Warranties",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          Our website and products are provided <em>"as is"</em> and <em>"as available"</em>. We make no warranties, express or implied, regarding the uninterrupted availability of the website or the suitability of products for a particular purpose, except as required by Sri Lankan consumer protection laws.
        </p>
      ),
    },
    {
      num: "13", symbol: "▣", title: "Governing Law & Disputes",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          These Terms of Service are governed by the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka. We encourage you to contact us first to resolve any disputes amicably.
        </p>
      ),
    },
    {
      num: "14", symbol: "◈", title: "Changes to Terms",
      content: (
        <p style={{ fontSize:15, color:"#64748b", lineHeight:1.8 }}>
          We reserve the right to modify these Terms of Service at any time. Updated terms will be posted on this page with a revised effective date. Your continued use of our website after changes constitutes acceptance of the new terms.
        </p>
      ),
    },
  ];

  const quickFacts = [
    { icon:"🏛️", label:"Governing law",    value:"Sri Lanka" },
    { icon:"📦", label:"Return window",    value:"7 days" },
    { icon:"💳", label:"Payment methods",  value:"Card, Transfer, COD" },
    { icon:"🚚", label:"Delivery est.",    value:"3–7 business days" },
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

        .policy-card {
          border:1px solid #e2e8f0; border-radius:18px;
          background:#ffffff; overflow:hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
          scroll-margin-top: 24px;
        }
        .policy-card:hover {
          border-color:#fbbf24;
          box-shadow:0 6px 24px rgba(251,191,36,0.10);
        }

        .quick-card {
          padding:18px 16px; border-radius:16px;
          border:1px solid #e2e8f0; background:#f8fafc;
          display:flex; align-items:center; gap:14px;
          transition: border-color 0.3s, background 0.3s;
        }
        .quick-card:hover { border-color:#fbbf24; background:#fffbeb; }

        .toc-link {
          display:flex; align-items:center; gap:8px;
          padding:7px 10px; border-radius:8px;
          font-size:13px; color:#64748b; text-decoration:none;
          transition: background 0.2s, color 0.2s;
          font-weight:500;
        }
        .toc-link:hover { background:#fef3c7; color:#0f172a; }
        .toc-num { font-size:10px; font-weight:700; color:#fbbf24; min-width:22px; }

        .side-ring {
          border-radius:50%; border:1px solid rgba(251,191,36,0.3);
          position:absolute; animation: spinSlow 30s linear infinite;
        }
        .side-ring::before {
          content:''; position:absolute; top:-3px; left:50%;
          transform:translateX(-50%);
          width:6px; height:6px; border-radius:50%; background:#fbbf24;
        }

        .cta-btn {
          display:block; text-align:center; background:#fbbf24; color:#0f172a;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:14px;
          padding:13px 32px; border-radius:12px; text-decoration:none;
          box-shadow:0 4px 14px rgba(251,191,36,0.35);
          transition:background 0.3s, box-shadow 0.3s, transform 0.2s;
        }
        .cta-btn:hover { background:#f59e0b; box-shadow:0 6px 20px rgba(251,191,36,0.45); transform:translateY(-1px); }

        @media(max-width:960px){
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
          fontSize:"clamp(70px,10vw,160px)", fontWeight:800, lineHeight:1,
          color:"rgba(251,191,36,0.04)", userSelect:"none", letterSpacing:"-0.03em"
        }}>TERMS</div>

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="anim-fade d1" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <span className="live-dot"/>
            <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.8)" }}>
              Legal · Colombo PVC Center
            </span>
          </div>

          <h1 className="anim-up d2" style={{ fontSize:"clamp(40px,6.5vw,88px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.02em", margin:"0 0 4px" }}>
            Terms of
          </h1>
          <h1 className="anim-up d3" style={{ fontSize:"clamp(40px,6.5vw,88px)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.02em", margin:0 }}>
            Service<span style={{ color:"#fbbf24" }}>.</span>
          </h1>

          <span className="gold-bar d4" style={{ marginTop:24, marginBottom:24 }}/>

          <p className="anim-up d4" style={{ fontSize:15, color:"rgba(248,250,252,0.6)", maxWidth:440, lineHeight:1.8, fontWeight:400 }}>
            Please read these terms carefully before accessing or placing orders with Colombo PVC Center.
          </p>

          {/* Badges row */}
          <div className="anim-fade d5" style={{ display:"flex", gap:12, marginTop:32, flexWrap:"wrap" }}>
            {[
              { icon:"📅", text:`Effective: ${effectiveDate}` },
              { icon:"🌐", text:"www.colombopvc.lk" },
              { icon:"🏛️", text:"Governed by Sri Lankan Law" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display:"inline-flex", alignItems:"center", gap:7,
                padding:"7px 14px", borderRadius:999,
                border:"1px solid rgba(251,191,36,0.25)", background:"rgba(251,191,36,0.06)"
              }}>
                <span style={{ fontSize:12 }}>{icon}</span>
                <span style={{ fontSize:12, color:"rgba(251,191,36,0.75)", fontWeight:500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK FACTS ── */}
      <section style={{ padding:"32px 40px 0", maxWidth:1100, margin:"0 auto" }}>
        <div className="quick-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {quickFacts.map(({ icon, label, value }) => (
            <div key={label} className="quick-card">
              <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#94a3b8", marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <section style={{ padding:"56px 40px 80px", maxWidth:1100, margin:"0 auto" }}>
        <div className="page-layout" style={{ display:"flex", gap:48, alignItems:"flex-start" }}>

          {/* ── SECTIONS ── */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:14 }}>
            {sections.map((sec) => (
              <div key={sec.num} id={`section-${sec.num}`} className="policy-card">
                {/* Header */}
                <div style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"20px 22px", borderBottom:"1px solid #f1f5f9",
                  background:"#fafafa"
                }}>
                  <div style={{
                    width:38, height:38, borderRadius:10, flexShrink:0,
                    background:"#0f172a", color:"#fbbf24",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, letterSpacing:"0.05em"
                  }}>{sec.num}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ fontSize:15, color:"#fbbf24" }} aria-hidden>{sec.symbol}</span>
                    <h2 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:0, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                      {sec.title}
                    </h2>
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding:"22px 22px" }}>
                  {sec.content}
                </div>
              </div>
            ))}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="sidebar" style={{ width:268, flexShrink:0, position:"sticky", top:24, display:"flex", flexDirection:"column", gap:14 }}>

            {/* CTA card */}
            <div style={{
              borderRadius:20, background:"#0f172a", color:"#f8fafc",
              padding:"26px 22px", borderTop:"3px solid #fbbf24",
              position:"relative", overflow:"hidden"
            }}>
              <div className="side-ring" style={{ width:110, height:110, top:-28, right:-28, opacity:0.22 }}/>
              <div className="side-ring" style={{ width:68, height:68, top:-4, right:-4, opacity:0.14, animationDirection:"reverse", animationDuration:"18s" }}/>
              <div style={{ position:"relative" }}>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.7)", marginBottom:10 }}>Questions?</div>
                <h3 style={{ fontSize:18, fontWeight:700, lineHeight:1.3, marginBottom:10, color:"#f8fafc" }}>
                  Need help understanding these terms?
                </h3>
                <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:18 }}>
                  Our team is happy to clarify anything before you order.
                </p>
                <a href="/contact" className="cta-btn">Contact us →</a>
              </div>
            </div>

            {/* Table of contents */}
            <div style={{ borderRadius:18, border:"1px solid #e2e8f0", padding:"20px 16px", background:"#f8fafc" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#94a3b8", marginBottom:12, padding:"0 4px" }}>
                Contents
              </div>
              <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {sections.map((sec) => (
                  <a key={sec.num} href={`#section-${sec.num}`} className="toc-link">
                    <span className="toc-num">{sec.num}</span>
                    <span>{sec.title}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick contact */}
            <div style={{ borderRadius:18, border:"1px solid #e2e8f0", padding:"20px", background:"#f8fafc" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#94a3b8", marginBottom:12 }}>Quick contact</div>
              {[
                { icon:"✉️", label:"Email", value:"info@colombopvc.lk", href:"mailto:info@colombopvc.lk" },
                { icon:"📍", label:"Address", value:"Colombo, Sri Lanka", href:null },
              ].map(({ icon, label, value, href }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 8px", borderRadius:10, marginBottom:4 }}>
                  <span style={{ fontSize:16 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:10, fontWeight:600, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
                    {href
                      ? <a href={href} style={{ fontSize:12, fontWeight:600, color:"#f59e0b", textDecoration:"none" }}>{value}</a>
                      : <span style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{value}</span>
                    }
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Shared bullet list ── */
function BulletList({ items }) {
  return (
    <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
      {items.map((t, i) => (
        <li key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ marginTop:7, width:6, height:6, borderRadius:"50%", background:"#fbbf24", flexShrink:0 }}/>
          <span style={{ fontSize:15, color:"#64748b", lineHeight:1.7 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}