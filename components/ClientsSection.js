"use client";

const brands = [
  { name: "Brand 1", logo: "/1 (1).svg" },
  { name: "Brand 2", logo: "/1 (2).svg" },
  { name: "Brand 3", logo: "/1 (3).svg" },
  { name: "Brand 4", logo: "/1 (4).svg" },
  { name: "Brand 5", logo: "/1 (5).svg" },
  { name: "Brand 6", logo: "/1 (6).svg" },
  { name: "Brand 7", logo: "/1 (7).svg" },
  { name: "Brand 8", logo: "/1 (9).svg" },
  { name: "Brand 8", logo: "/1 (10).svg" },
  { name: "Brand 8", logo: "/1 (11).svg" },
  { name: "Brand 8", logo: "/1 (12).svg" },
  { name: "Brand 8", logo: "/1 (13).svg" },
  { name: "Brand 8", logo: "/1 (14).svg" },
  { name: "Brand 8", logo: "/1 (15).svg" },
  { name: "Brand 8", logo: "/1 (16).svg" },
  { name: "Brand 8", logo: "/1 (17).svg" },
];

export default function ClientsSection() {
  return (
    <section className="bg-white py-10 sm:py-12 md:py-16 overflow-hidden" aria-labelledby="brands-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 id="brands-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
          Brands
        </h2>
      </div>

      <div className="relative mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex animate-marquee-left gap-4 sm:gap-6 w-max">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="shrink-0 w-28 sm:w-32 md:w-36 aspect-square bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes clients-marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left {
          animation: clients-marquee-left 40s linear infinite;
        }
        .animate-marquee-left:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
