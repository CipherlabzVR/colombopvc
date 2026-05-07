"use client";

import { useEffect } from "react";
import { saveCorsLink } from "@/lib/appSettingApi";
import { SITE_URL } from "@/lib/seo";

/**
 * Fire-and-forget client component that registers this site's origin
 * with the ERP backend's CORS allow-list via /AppSetting/SaveCorsLink.
 *
 * Mounted on the landing page so the call happens once per visitor session.
 * Renders nothing.
 */
export default function CorsLinkRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const STORAGE_KEY = "cpvc_cors_link_registered";

    let webLink = SITE_URL;
    try {
      if (window.location?.origin) {
        webLink = window.location.origin;
      }
    } catch {
      // fall back to SITE_URL
    }

    try {
      const already = window.sessionStorage?.getItem(STORAGE_KEY);
      if (already === webLink) return;
    } catch {
      // sessionStorage may be unavailable (private mode etc.) — proceed anyway
    }

    saveCorsLink({ webLink, isActive: true })
      .then(() => {
        try {
          window.sessionStorage?.setItem(STORAGE_KEY, webLink);
        } catch {
          // ignore storage errors
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[CorsLinkRegistrar] SaveCorsLink failed:", err);
        }
      });
  }, []);

  return null;
}
