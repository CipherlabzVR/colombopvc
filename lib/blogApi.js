import api from "@/lib/base/api";

// ─── Helpers ─────────────────────────────────────────────────

/** ApiResponse: statusCode is numeric 200 on success (see ResponseStatusJsonConverter on backend). */
function isApiSuccess(data) {
  const code = data?.statusCode ?? data?.StatusCode;
  const failed =
    code === -99 ||
    code === "-99" ||
    code === "FAILED" ||
    (typeof code === "string" && code.toUpperCase() === "FAILED");
  if (failed) return false;
  return code === 200;
}

function getApiResult(data) {
  return data?.result ?? data?.Result;
}

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
    id: item.id ?? item.Id,
    slug: (item.slug ?? item.Slug ?? "").trim(),
    title: item.title ?? item.Title ?? "",
    excerpt: item.excerpt ?? item.Excerpt ?? "",
    image: item.featuredImageUrl ?? item.FeaturedImageUrl ?? "",
    date: formatDate(item.publishDate ?? item.PublishDate),
    body: item.content ?? item.Content ?? "",
    isActive: item.isActive ?? item.IsActive,
    displayOrder: item.displayOrder ?? item.DisplayOrder,
    publishDate: item.publishDate ?? item.PublishDate,
    createdOn: item.createdOn ?? item.CreatedOn,
  };
}

// ─── Public blog endpoints (no token) ────────────────────────

export async function getBlogPosts({ skipCount = 0, maxResultCount = 10 } = {}) {
  const data = await api.get("/ECommerce/GetPublicBlogPosts", {
    SkipCount: skipCount,
    MaxResultCount: maxResultCount,
  });

  if (!isApiSuccess(data)) {
    throw new Error(
      (data?.message ?? data?.Message ?? "").trim() || "Failed to load blog posts"
    );
  }

  const result = getApiResult(data);
  const rawItems = Array.isArray(result)
    ? result
    : (result?.items ?? result?.Items ?? []);
  const items = rawItems.filter(Boolean).map(normalizePost).filter(Boolean);
  const totalCount = Array.isArray(result)
    ? result.length
    : (result?.totalCount ?? result?.TotalCount ?? items.length);

  return { items, totalCount };
}

export async function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const data = await api.get("/ECommerce/GetPublicBlogPostBySlug", { slug });
  const payload = getApiResult(data);
  if (!isApiSuccess(data) || payload == null) return null;
  return normalizePost(payload);
}

export async function getBlogPostById(id) {
  const data = await api.get("/ECommerce/GetPublicBlogPostById", { id });
  const payload = getApiResult(data);
  if (!isApiSuccess(data) || payload == null) return null;
  return normalizePost(payload);
}
