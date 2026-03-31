/**
 * Centralized API client.
 *
 * Usage:
 *   import api, { API_BASE } from "@/lib/base/api";
 *
 *   // Simple GET
 *   const data = await api.get("/ECommerce/GetPublicBlogPosts", { SkipCount: 0, MaxResultCount: 10 });
 *
 *   // POST with JSON body
 *   const data = await api.post("/ECommerce/SomeEndpoint", { name: "test" });
 *
 *   // POST with FormData
 *   const data = await api.postForm("/ECommerce/Upload", formData);
 *
 * Set API_BASE below to your API origin (include /api if your server uses that prefix).
 */

// export const API_BASE = "https://localhost:44352/api";
export const API_BASE = "https://Colombopvcbackend.clovesis.com/api";
// export const API_BASE = "https://developertest.clovesis.com/api";


function buildUrl(path, params) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

async function get(path, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handleResponse(res);
}

async function post(path, body, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

async function postForm(path, formData, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });
  return handleResponse(res);
}

async function authGet(path, token, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

async function authPost(path, token, body, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

async function authPostForm(path, token, formData, params) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(res);
}

const api = { get, post, postForm, authGet, authPost, authPostForm };
export default api;
