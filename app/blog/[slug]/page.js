"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/blogApi";

function renderBody(body) {
  if (!body) return null;
  return body.split(/\n\n+/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const html = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return (
      <p key={i} className="text-slate-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    getBlogPostBySlug(slug)
      .then((p) => {
        if (!p) setError("Post not found");
        else setPost(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#B45309]" />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">{error || "Post not found"}</p>
        <Link href="/blog" className="text-sm font-medium text-[#B45309] hover:text-[#923a07]">
          ← Back to blog
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 font-poppins">
        <nav className="text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-[#B45309]">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/blog" className="hover:text-[#B45309]">Blog</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-medium line-clamp-1">{post.title}</span>
        </nav>

        <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="aspect-video sm:aspect-2/1 overflow-hidden bg-slate-100">
            {post.image ? (
              <img src={post.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm text-slate-500 mb-2">{post.date}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>
            <div className="prose prose-slate max-w-none">{renderBody(post.body)}</div>
          </div>
        </article>

        <div className="mt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#B45309] hover:text-[#923a07]">
            ← Back to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
