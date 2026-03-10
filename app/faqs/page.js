"use client";

import { useState, useRef, useEffect } from "react";

/* ── Dot pattern ── */
function DotPattern() {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

/* ── Orbs ── */
function HeroOrbs() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }} aria-hidden>
      <div style={{ position:"absolute", top:"10%", left:"4%", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,191,36,0.16) 0%, transparent 70%)", filter:"blur(40px)", animation:"drift1 18s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", bottom:"10%", right:"5%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)", filter:"blur(50px)", animation:"drift2 22s ease-in-out infinite" }}/>
    </div>
  );
}

/* ── Animated accordion item ── */
function FAQItem({ faq, index, isOpen, onToggle }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div style={{
      border: isOpen ? "1px solid #fbbf24" : "1px solid #e2e8f0",
      borderRadius: 16,
      overflow: "hidden",
      background: isOpen ? "#fffbeb" : "#ffffff",
      boxShadow: isOpen ? "0 4px 20px rgba(251,191,36,0.12)" : "0 1px 4px rgba(15,23,42,0.04)",
      transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
    }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width:"100%", display:"flex", alignItems:"center", gap:16,
          padding:"20px 24px", background:"transparent", border:"none",
          cursor:"pointer", textAlign:"left",
        }}
      >
        {/* Number badge */}
        <div style={{
          flexShrink:0, width:36, height:36, borderRadius:10,
          background: isOpen ? "#fbbf24" : "#f1f5f9",
          color: isOpen ? "#0f172a" : "#94a3b8",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, fontWeight:800, letterSpacing:"0.05em",
          transition:"background 0.3s, color 0.3s",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>

        <span style={{
          flex:1, fontWeight:600, fontSize:15, color:"#0f172a",
          lineHeight:1.4,
        }}>{faq.question}</span>

        {/* Chevron */}
        <div style={{
          flexShrink:0, width:32, height:32, borderRadius:8,
          border: isOpen ? "1px solid #fbbf24" : "1px solid #e2e8f0",
          background: isOpen ? "#fbbf24" : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.3s",
        }}>
          <svg width="14" height="14" fill="none" stroke={isOpen ? "#0f172a" : "#94a3b8"} strokeWidth="2.5" viewBox="0 0 24 24"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.3s" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {/* Animated body */}
      <div style={{ height, overflow:"hidden", transition:"height 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
        <div ref={bodyRef} style={{ padding:"0 24px 22px 76px" }}>
          <div style={{ width:28, height:2, background:"#fbbf24", borderRadius:2, marginBottom:12 }}/>
          <p style={{ fontSize:14, color:"#64748b", lineHeight:1.8, margin:0 }}>{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: "What products does Colombo PVC Center offer?",
    answer: "We offer a wide range of PVC pipes and fittings, power tools (drills, saws, grinders), plumbing supplies, and building materials. All our products are from trusted brands and suitable for both professional tradespeople and DIY enthusiasts.",
  },
  {
    question: "Do you offer delivery?",
    answer: "Yes, we provide delivery across Colombo and surrounding areas. Delivery charges and timeframes depend on your location and order size. Contact us for a delivery quote or check out our delivery options at checkout.",
  },
  {
    question: "What are your payment options?",
    answer: "We accept cash on delivery, bank transfers, and major credit/debit cards. For bulk orders, we can arrange payment terms. Please contact our team to discuss your requirements.",
  },
  {
    question: "Can I return or exchange a product?",
    answer: "We accept returns and exchanges within 7 days of purchase for unused, unopened items in original packaging. Damaged or defective products may be exchanged. Please keep your receipt and contact us to initiate a return.",
  },
  {
    question: "How do I know what size pipe or fitting I need?",
    answer: "Our knowledgeable staff can help you choose the right products for your project. You can visit our store, call us at 077 686 7877 (hot line), 077 726 4913, or 076 462 7447, or use the contact form. Describe your project and we'll recommend the right materials.",
  },
  {
    question: "Do you offer wholesale or bulk pricing?",
    answer: "Yes, we offer competitive pricing for contractors, builders, and bulk orders. Contact our sales team at sales.colombopvc@gmail.com with your requirements for a custom quote.",
  },
  {
    question: "What are your business hours?",
    answer: "We are open Monday to Saturday from 9:00 AM to 6:00 PM, and Sunday from 10:00 AM to 1:00 PM.",
  },
  {
    question: "Where is Colombo PVC Center located?",
    answer: "We are at No. 192/4, Srimath Bandaranayaka Mawatha, Colombo 12. For directions, call us at 077 686 7877 (hot line) or send a message through our Contact Us page.",
  },
];

const categories = [
  { label: "All", icon: "◈" },
  { label: "Products", icon: "◆" },
  { label: "Delivery", icon: "◇" },
  { label: "Payments", icon: "▣" },
  { label: "Hours", icon: "◉" },
];

const faqCategories = ["All", "Products", "Delivery", "Payments", "Products", "Products", "Hours", "Products"];

const QUOTE_EMAIL = "sales.colombopvc@gmail.com";

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [quoteSent, setQuoteSent] = useState(false);

  const openQuotationModal = () => setQuotationModalOpen(true);
  const closeQuotationModal = () => {
    setQuotationModalOpen(false);
    setQuoteSent(false);
    setQuoteForm({ name: "", email: "", phone: "", message: "" });
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, message } = quoteForm;
    const subject = encodeURIComponent(`Quotation Request – ${(name || "Customer").trim() || "Website"}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\nPhone: ${phone.trim()}\n\nQuotation request / requirements:\n${message.trim()}`
    );
    const mailto = `mailto:${QUOTE_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    setQuoteSent(true);
    setTimeout(closeQuotationModal, 800);
  };

  const visibleFaqs = faqs.map((f, i) => ({ ...f, originalIndex: i }))
    .filter((_, i) => activeCategory === "All" || faqCategories[i] === activeCategory);

  return (
    <main style={{ fontFamily:"'Outfit', sans-serif", background:"#ffffff", color:"#1e293b", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(28px,-18px)} 66%{transform:translate(-14px,22px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-22px,14px)} 66%{transform:translate(18px,-26px)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes revealBar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spinSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .anim-up   { animation: slideUp  0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-left { animation: slideLeft 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-fade { animation: fadeIn 1s ease both; }
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

        .cat-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:8px 18px; border-radius:999px;
          border:1px solid #e2e8f0; background:#ffffff;
          font-family:'Outfit',sans-serif; font-size:13px; font-weight:600;
          color:#64748b; cursor:pointer;
          transition:all 0.25s;
        }
        .cat-btn:hover { border-color:#fbbf24; color:#0f172a; background:#fffbeb; }
        .cat-btn.active { background:#fbbf24; border-color:#fbbf24; color:#0f172a; box-shadow:0 3px 12px rgba(251,191,36,0.3); }

        .cta-btn {
          display:inline-block; background:#fbbf24; color:#0f172a;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:14px;
          padding:13px 32px; border-radius:12px; text-decoration:none;
          box-shadow:0 4px 14px rgba(251,191,36,0.35);
          transition:background 0.3s, box-shadow 0.3s, transform 0.2s;
        }
        .cta-btn:hover { background:#f59e0b; box-shadow:0 6px 20px rgba(251,191,36,0.45); transform:translateY(-1px); }

        .stat-item { border-left:2px solid rgba(251,191,36,0.4); padding-left:18px; }

        .side-ring {
          width:120px; height:120px; border-radius:50%;
          border:1px solid rgba(251,191,36,0.3);
          position:absolute;
          animation: spinSlow 30s linear infinite;
        }
        .side-ring::before {
          content:''; position:absolute; top:-4px; left:50%;
          transform:translateX(-50%);
          width:8px; height:8px; border-radius:50%; background:#fbbf24;
        }

        @media(max-width:900px){
          .page-layout { flex-direction:column !important; }
          .sidebar { width:100% !important; position:static !important; }
          .hero-bg-text { display:none !important; }
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
          fontSize:"clamp(90px,13vw,190px)", fontWeight:800, lineHeight:1,
          color:"rgba(251,191,36,0.04)", userSelect:"none", letterSpacing:"-0.03em"
        }}>FAQ</div>

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="anim-fade d1" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <span className="live-dot"/>
            <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.8)" }}>
              Help Center
            </span>
          </div>

          <h1 className="anim-up d2" style={{ fontSize:"clamp(44px,7vw,92px)", fontWeight:300, lineHeight:0.95, letterSpacing:"-0.02em", margin:"0 0 4px" }}>
            Got a
          </h1>
          <h1 className="anim-up d3" style={{ fontSize:"clamp(44px,7vw,92px)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.02em", margin:0 }}>
            Question<span style={{ color:"#fbbf24" }}>?</span>
          </h1>

          <span className="gold-bar d4" style={{ marginTop:24, marginBottom:24 }}/>

          <p className="anim-up d4" style={{ fontSize:15, color:"rgba(248,250,252,0.6)", maxWidth:420, lineHeight:1.8, fontWeight:400 }}>
            Find answers to common questions about our products,<br/>delivery, payments, and more.
          </p>

          {/* Stats */}
          <div className="anim-up d5" style={{ display:"flex", gap:36, marginTop:44, flexWrap:"wrap" }}>
            {[{n:"8", label:"Questions answered"},{n:"24h", label:"Support response"},{n:"500+", label:"Products covered"}].map(({ n, label }) => (
              <div key={label} className="stat-item">
                <div style={{ fontSize:32, fontWeight:800, lineHeight:1, color:"#fbbf24" }}>{n}</div>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(248,250,252,0.4)", marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ padding:"64px 40px 80px", maxWidth:1100, margin:"0 auto" }}>

        {/* Category filter */}
        <div className="anim-left d1" style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:40 }}>
          {categories.map(({ label, icon }) => (
            <button key={label} type="button"
              className={`cat-btn${activeCategory === label ? " active" : ""}`}
              onClick={() => { setActiveCategory(label); setOpenIndex(null); }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>

        <div className="page-layout" style={{ display:"flex", gap:48, alignItems:"flex-start" }}>

          {/* ── FAQ LIST ── */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {visibleFaqs.map((faq, i) => (
                <FAQItem
                  key={faq.originalIndex}
                  faq={faq}
                  index={faq.originalIndex}
                  isOpen={openIndex === faq.originalIndex}
                  onToggle={() => setOpenIndex(openIndex === faq.originalIndex ? null : faq.originalIndex)}
                />
              ))}
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="sidebar" style={{ width:280, flexShrink:0, position:"sticky", top:24 }}>

            {/* CTA card */}
            <div style={{
              borderRadius:20, background:"#0f172a", color:"#f8fafc",
              padding:"28px 24px", marginBottom:16,
              borderTop:"3px solid #fbbf24", position:"relative", overflow:"hidden"
            }}>
              {/* mini rings */}
              <div className="side-ring" style={{ width:160, height:160, top:-40, right:-40, opacity:0.3 }}/>
              <div className="side-ring" style={{ width:100, height:100, top:-10, right:-10, opacity:0.2, animationDirection:"reverse", animationDuration:"20s" }}/>

              <div style={{ position:"relative" }}>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(251,191,36,0.7)", marginBottom:10 }}>
                  Still unsure?
                </div>
                <h3 style={{ fontSize:20, fontWeight:700, lineHeight:1.25, marginBottom:12, color:"#f8fafc" }}>
                  Talk to our team directly.
                </h3>
                <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:20 }}>
                  Our experts are happy to help with any question about products or projects.
                </p>
                <a href="/contact" className="cta-btn" style={{ display:"block", textAlign:"center" }}>
                  Contact us →
                </a>
                <button
                  type="button"
                  onClick={openQuotationModal}
                  className="cta-btn"
                  style={{ display:"block", width:"100%", textAlign:"center", marginTop:12, border:"none", cursor:"pointer", background:"rgba(251,191,36,0.2)", color:"#fbbf24" }}
                >
                  Request quotation
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div style={{ borderRadius:20, border:"1px solid #e2e8f0", padding:"22px 20px", background:"#f8fafc" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#94a3b8", marginBottom:14 }}>
                Quick contact
              </div>
              {[
                { icon:"📞", label:"Call us", value:"077 686 7877 (Hot line)", href:"tel:94776867877" },
                { icon:"✉️", label:"Email", value:"sales.colombopvc@gmail.com", href:"mailto:sales.colombopvc@gmail.com" },
              ].map(({ icon, label, value, href }) => (
                <a key={label} href={href} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"10px 12px", borderRadius:10, textDecoration:"none", color:"inherit",
                  transition:"background 0.2s",
                  marginBottom:6,
                }}
                  onMouseEnter={e => e.currentTarget.style.background="#fef3c7"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:10, fontWeight:600, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{value}</div>
                  </div>
                </a>
              ))}

              <div style={{ borderTop:"1px solid #e2e8f0", marginTop:10, paddingTop:14 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#94a3b8", marginBottom:10 }}>
                  Hours today
                </div>
                {[
                  { day:"Monday – Saturday", time:"9:00 AM – 6:00 PM" },
                  { day:"Sunday", time:"10:00 AM – 1:00 PM" },
                ].map(({ day, time }) => (
                  <div key={day} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", color:"#64748b" }}>
                    <span>{day}</span>
                    <span style={{ fontWeight:600, color: time === "Closed" ? "#f87171" : "#f59e0b" }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quotation Modal */}
      {quotationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quotation-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => e.target === e.currentTarget && closeQuotationModal()}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              maxWidth: 440,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 24px 48px rgba(15,23,42,0.2)",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 id="quotation-modal-title" style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Request a quotation
              </h2>
              <button
                type="button"
                onClick={closeQuotationModal}
                aria-label="Close"
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "1px solid #e2e8f0",
                  background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#64748b", fontSize: 18,
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleQuoteSubmit} style={{ padding: 24 }}>
              {quoteSent ? (
                <p style={{ color: "#0f172a", fontWeight: 600, margin: 0 }}>
                  Your email client will open. Send the message to request your quotation.
                </p>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="quote-name" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      Name *
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      required
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      placeholder="Your name"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                        fontSize: 14, color: "#0f172a", boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="quote-email" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      Email *
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      placeholder="you@example.com"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                        fontSize: 14, color: "#0f172a", boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="quote-phone" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      Phone
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      placeholder="07X XXX XXXX"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                        fontSize: 14, color: "#0f172a", boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="quote-message" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      What do you need a quote for? *
                    </label>
                    <textarea
                      id="quote-message"
                      required
                      rows={4}
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      placeholder="Describe products, quantities, or project details..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                        fontSize: 14, color: "#0f172a", resize: "vertical", boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={closeQuotationModal}
                      style={{
                        padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0",
                        background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cta-btn"
                      style={{ padding: "10px 24px", border: "none", cursor: "pointer", fontSize: 14 }}
                    >
                      Send via email
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}