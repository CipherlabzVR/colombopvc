"use client";

import { useState, useEffect } from "react";

const testimonials = [
  {
    quote:
      "Colombo PVC Center has been our go-to for all plumbing supplies. The quality of their PVC pipes and fittings is excellent, and the staff always helps us find exactly what we need.",
    name: "Nimal Perera",
    role: "Contractor",
    initials: "NP",
  },
  {
    quote:
      "I renovated my entire bathroom using products from here. Great selection of tools and materials, and the advice they gave saved me time and money. Highly recommend.",
    name: "Samanthi Fernando",
    role: "Homeowner",
    initials: "SF",
  },
  {
    quote:
      "Professional service and fair prices. We order in bulk for our construction projects and have never been disappointed. Delivery is reliable too.",
    name: "Ruwan Silva",
    role: "Site Manager",
    initials: "RS",
  },
];

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1L9.854 5.528H14.657L10.902 8.444L12.756 12.972L8 10.056L3.244 12.972L5.098 8.444L1.343 5.528H6.146L8 1Z"
      fill="#F59E0B"
    />
  </svg>
);

const QuoteIcon = () => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
    <path
      d="M0 28V17.0667C0 13.6444 0.711111 10.6667 2.13333 8.13333C3.6 5.55556 5.93333 3.26667 9.13333 1.26667L12.2667 5.33333C10.2667 6.44444 8.75556 7.73333 7.73333 9.2C6.71111 10.6222 6.13333 12.3111 6 14.2667H12V28H0ZM20.2667 28V17.0667C20.2667 13.6444 20.9778 10.6667 22.4 8.13333C23.8667 5.55556 26.2 3.26667 29.4 1.26667L32.5333 5.33333C30.5333 6.44444 29.0222 7.73333 28 9.2C26.9778 10.6222 26.4 12.3111 26.2667 14.2667H32.2667V28H20.2667Z"
      fill="currentColor"
    />
  </svg>
);

export default function TestimonialsSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        .testimonials-section {
          background: #FAFAF8;
          padding: 80px 24px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .testimonials-section::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,116,144,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .testimonials-section::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .section-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .section-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .eyebrow-line {
          width: 32px;
          height: 2px;
          background: #0E7490;
          border-radius: 2px;
        }

        .eyebrow-text {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0E7490;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 700;
          color: #1A2332;
          text-align: center;
          margin: 0 0 12px;
          line-height: 1.2;
        }

        .section-subtitle {
          font-size: 16px;
          color: #64748B;
          text-align: center;
          margin: 0 0 56px;
          font-weight: 400;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 900px) {
          .cards-grid {
            grid-template-columns: 1fr;
            max-width: 520px;
            margin: 0 auto;
          }
        }

        @media (min-width: 600px) and (max-width: 900px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 720px;
          }
        }

        .card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          opacity: 0;
          transform: translateY(24px);
          animation: none;
        }

        .card.visible {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .card:nth-child(1) { animation-delay: 0s; }
        .card:nth-child(2) { animation-delay: 0.1s; }
        .card:nth-child(3) { animation-delay: 0.2s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06);
        }

        .card-accent {
          position: absolute;
          top: 0;
          left: 32px;
          right: 32px;
          height: 3px;
          background: linear-gradient(90deg, #0E7490, #0891B2);
          border-radius: 0 0 4px 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card:hover .card-accent {
          opacity: 1;
        }

        .quote-icon-wrap {
          color: #E2E8F0;
          margin-bottom: 20px;
          transition: color 0.3s ease;
        }

        .card:hover .quote-icon-wrap {
          color: #BAE6FD;
        }

        .card-quote {
          font-size: 15px;
          line-height: 1.72;
          color: #475569;
          flex: 1;
          margin: 0 0 24px;
          font-weight: 400;
        }

        .stars {
          display: flex;
          gap: 3px;
          margin-bottom: 20px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 20px;
          border-top: 1px solid #F1F5F9;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0E7490, #0891B2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(14,116,144,0.28);
        }

        .reviewer-name {
          font-size: 15px;
          font-weight: 600;
          color: #1A2332;
          margin: 0 0 2px;
          line-height: 1.3;
        }

        .reviewer-role {
          font-size: 13px;
          color: #94A3B8;
          margin: 0;
          font-weight: 400;
        }

        .trust-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-top: 56px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748B;
          font-size: 14px;
          font-weight: 500;
        }

        .trust-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0E7490;
          flex-shrink: 0;
        }

        .trust-divider {
          width: 1px;
          height: 20px;
          background: #E2E8F0;
        }
      `}</style>

      <section className="testimonials-section">
        <div className="section-inner">
          {/* Eyebrow */}
          <div className="section-eyebrow">
            <span className="eyebrow-line" />
            <span className="eyebrow-text">Customer Reviews</span>
            <span className="eyebrow-line" />
          </div>

          {/* Heading */}
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Trusted by homeowners and professionals across Colombo
          </p>

          {/* Cards */}
          <div className="cards-grid">
            {testimonials.map((item, i) => (
              <div key={i} className={`card ${visible ? "visible" : ""}`}>
                <div className="card-accent" />

                <div className="quote-icon-wrap">
                  <QuoteIcon />
                </div>

                <div className="stars">
                  {[...Array(5)].map((_, s) => (
                    <StarIcon key={s} />
                  ))}
                </div>

                <p className="card-quote">{item.quote}</p>

                <div className="card-footer">
                  <div className="avatar">{item.initials}</div>
                  <div>
                    <p className="reviewer-name">{item.name}</p>
                    <p className="reviewer-role">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="trust-bar">
            <div className="trust-item">
              <span className="trust-dot" />
              500+ Happy Customers
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-dot" />
              10+ Years in Business
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-dot" />
              Serving All of Colombo
            </div>
          </div>
        </div>
      </section>
    </>
  );
}