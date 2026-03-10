"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blogApi";

export default function BlogPostSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getBlogPosts({ skipCount: 0, maxResultCount: 4 })
      .then(({ items }) => setPosts(items))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <h2 className="text-3xl font-medium text-slate-800 text-center mb-2 font-poppins px-2">
        From Our Blog
      </h2>
      <p className="text-slate-600 mb-10 font-poppins text-center px-2 max-w-2xl mx-auto">
        Tips, guides, and inspiration for your next project
      </p>

      <div className="max-w-6xl mx-auto px-2 sm:px-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-poppins">
          {posts.map((post) => (
            <article
              key={post.slug || post.id}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col"
            >
              <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
                <div className="aspect-4/3 overflow-hidden bg-slate-100">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500 mb-2">{post.date}</p>
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-[#B45309] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 flex-1">{post.excerpt}</p>
                </div>
              </Link>
              <div className="p-4 pt-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B45309] hover:text-[#923a07] transition-colors"
                >
                  Read more
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-block bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 font-semibold px-6 py-3 rounded-md transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
