"use client";

import Link from "next/link";

const categories = [
  {
    name: "Grind Tools",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
    href: "/shop?category=grind-tools",
    count: "42 Products",
  },
  {
    name: "Chain Saw",
    image: "https://images.pexels.com/photos/209229/pexels-photo-209229.jpeg?auto=compress&cs=tinysrgb&w=400",
    href: "/shop?category=chain-saw",
    count: "28 Products",
  },
  {
    name: "Power Saw",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80",
    href: "/shop?category=power-saw",
    count: "35 Products",
  },
  {
    name: "Wood Router",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    href: "/shop?category=wood-router",
    count: "19 Products",
  },
];

export default function ShopByCategory() {
  return (
    <section id="shop-by-category" className="py-12 md:py-16 bg-slate-50/80" aria-labelledby="category-heading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="category-heading" className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center mb-2 font-poppins">
          Shop By Category
        </h2>
        <p className="text-slate-600 mb-8 sm:mb-10 font-poppins text-center text-sm sm:text-base max-w-xl mx-auto">
          Explore our tool categories and find what you need for your projects.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 font-poppins">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:border-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.99] transition-all duration-300"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  src={cat.image}
                  alt={`Browse ${cat.name}`}
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300" aria-hidden />
                <span className="absolute bottom-3 left-3 right-3 py-2 text-center text-sm font-medium text-white bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop now
                </span>
              </div>
              <div className="p-4">
                <p className="font-medium text-slate-800 group-hover:text-amber-700 transition-colors">{cat.name}</p>
                <p className="text-slate-500 text-sm mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-poppins font-medium text-slate-700 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg px-4 py-2 transition-colors"
          >
            View all categories
            <span className="text-amber-600" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
