import api from "@/lib/base/api";

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function normalizePost(item) {
  if (!item) return null;
  return {
    id: item.id,
    slug: item.slug || "",
    title: item.title || "",
    excerpt: item.excerpt || "",
    image: item.featuredImageUrl || "",
    date: formatDate(item.publishDate),
    body: item.content || "",
    isActive: item.isActive,
    displayOrder: item.displayOrder,
    publishDate: item.publishDate,
    createdOn: item.createdOn,
  };
}

// ─── Public blog endpoints (no token) ────────────────────────

export async function getBlogPosts({ skipCount = 0, maxResultCount = 10 } = {}) {
  const data = await api.get("/ECommerce/GetPublicBlogPosts", {
    SkipCount: skipCount,
    MaxResultCount: maxResultCount,
  });

  if (data.statusCode !== 200) {
    throw new Error(data.message || "Failed to load blog posts");
  }

  const result = data.result;
  const rawItems = Array.isArray(result) ? result : (result?.items ?? []);
  const items = rawItems.filter(Boolean).map(normalizePost).filter(Boolean);
  const totalCount = Array.isArray(result) ? result.length : (result?.totalCount ?? items.length);

  return { items, totalCount };
}

export async function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const data = await api.get("/ECommerce/GetPublicBlogPostBySlug", { slug });
  if (data.statusCode !== 200 || data.result == null) return null;
  return normalizePost(data.result);
}

export async function getBlogPostById(id) {
  const data = await api.get("/ECommerce/GetPublicBlogPostById", { id });
  if (data.statusCode !== 200 || data.result == null) return null;
  return normalizePost(data.result);
}
