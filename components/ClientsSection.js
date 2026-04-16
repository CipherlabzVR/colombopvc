"use client";

const brands = [
  { name: "Brand 1",  logo: "/1 (1).svg"  },
  { name: "Brand 2",  logo: "/1 (2).svg"  },
  { name: "Brand 3",  logo: "/1 (3).svg"  },
  { name: "Brand 4",  logo: "/1 (4).svg"  },
  { name: "Brand 5",  logo: "/1 (5).svg"  },
  { name: "Brand 6",  logo: "/1 (6).svg"  },
  { name: "Brand 7",  logo: "/1 (7).svg"  },
  { name: "Brand 8",  logo: "/1 (9).svg"  },
  { name: "Brand 9",  logo: "/1 (10).svg" },
  { name: "Brand 10", logo: "/1 (11).svg" },
  { name: "Brand 11", logo: "/1 (12).svg" },
  { name: "Brand 12", logo: "/1 (13).svg" },
  { name: "Brand 13", logo: "/1 (14).svg" },
  { name: "Brand 14", logo: "/1 (15).svg" },
  { name: "Brand 15", logo: "/1 (16).svg" },
  { name: "Brand 16", logo: "/1 (17).svg" },
];

// Split brands into 3 rows for the staggered tracks
const rows = [
  brands.slice(0, 6),
  brands.slice(5, 12),
  brands.slice(10, 16),
];

function MarqueeTrack({ items, direction = "left", duration = "32s" }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="flex w-max gap-3.5"
      style={{
        animation: `marquee-${direction} ${duration} linear infinite`,
      }}
      onMouseEnter={e => e.currentTarget.style.animationPlayState = "paused"}
      onMouseLeave={e => e.currentTarget.style.animationPlayState = "running"}
    >
      {doubled.map((brand, i) => (
        <div
          key={`${brand.logo}-${i}`}
          className="shrink-0 w-[110px] h-[72px] bg-white border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-105 hover:border-amber-400 transition-all duration-300 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt={brand.name}
            loading="lazy"
            decoding="async"
            className="h-auto w-auto max-h-10 max-w-[80%] object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export default function ClientsSection() {
  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{ background: "#f5f2ec" }}
      aria-labelledby="brands-heading"
    >
      {/* Diagonal dark accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(108deg, transparent 52%, #1a1a2e 52%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-8 grid grid-cols-[1fr_2fr] gap-12 items-center">

        {/* Left: heading */}
        <div className="flex flex-col gap-4">
          <span
            className="text-[11px] font-medium tracking-[0.22em] uppercase"
            style={{ color: "#c9a84c" }}
          >
            Trusted by
          </span>

          <h2
            id="brands-heading"
            className="font-serif text-5xl leading-[1.05]"
            style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', serif" }}
          >
            Brands<br />
            that <em className="italic" style={{ color: "#c9a84c" }}>matter.</em>
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">
            World-class companies who trust us to deliver.
          </p>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 w-fit text-sm font-medium mt-1"
            style={{ background: "#1a1a2e", color: "#f5f2ec" }}
          >
            <span
              className="rounded-full px-3 py-0.5 text-xs font-bold"
              style={{ background: "#c9a84c", color: "#1a1a2e" }}
            >
              16+
            </span>
            global partners
          </div>
        </div>

        {/* Right: 3 marquee rows */}
        <div
          className="flex flex-col gap-3.5 overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <MarqueeTrack items={rows[0]} direction="left"  duration="32s" />
          <MarqueeTrack items={rows[1]} direction="right" duration="28s" />
          <MarqueeTrack items={rows[2]} direction="left"  duration="36s" />
        </div>
      </div>

      {/* Bottom gold rule */}
      <div
        className="absolute bottom-0 left-8 right-8 h-px"
        style={{ background: "linear-gradient(to right, #c9a84c, transparent)" }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}