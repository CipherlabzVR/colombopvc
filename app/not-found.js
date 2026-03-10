import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-[#0D1B3E]">404</h1>
      <p className="mt-4 text-lg text-slate-600">This page could not be found.</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center bg-[#F5C518] hover:bg-[#E0B415] text-[#0D1B3E] font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
