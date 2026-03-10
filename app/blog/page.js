"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blogApi";

export default function BlogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBlogPosts({ skipCount: 0, maxResultCount: 50 })
      .then(({ items: posts }) => setItems(posts))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 font-poppins">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Blog</h1>
        <p className="text-slate-600 mb-10">Tips, guides, and inspiration for your next project</p>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#B45309]" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 mb-6">
            Could not load blog posts. ({error})
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((post) => (
              <Link
                key={post.slug || post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col"
              >
                <div className="aspect-video overflow-hidden bg-slate-100">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500 mb-2">{post.date}</p>
                  <h2 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-[#B45309] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-2 flex-1">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[#B45309]">
                    Read more
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-slate-500 text-center py-10">No blog posts yet.</p>
        )}
      </div>
    </main>
  );
}
