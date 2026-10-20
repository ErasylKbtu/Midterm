import { useEffect, useState } from "react";
import { CATEGORIES, LEVELS, SORTS, DURATIONS } from "../lib/catalog.js";
export const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  level: "All",
  duration: "All",
  sort: "featured",
  page: 1,
  status: "all",
};
function readRoute() {
  const params = new URLSearchParams(window.location.search);
  const pick = (key, allowed, fallback) =>
    allowed.includes(params.get(key)) ? params.get(key) : fallback;
  return {
    view: pick("view", ["discover", "saved", "learning"], "discover"),
    course: params.get("course") || null,
    search: (params.get("search") || "").slice(0, 120),
    category: pick("category", CATEGORIES, "All"),
    level: pick("level", LEVELS, "All"),
    duration: pick("duration", DURATIONS, "All"),
    sort: pick("sort", SORTS, "featured"),
    page: Math.max(1, Math.floor(Number(params.get("page")) || 1)),
    status: pick("status", ["all", "active", "completed"], "all"),
  };
}
export function routeHref(route) {
  const params = new URLSearchParams();
  const defaults = { ...DEFAULT_FILTERS, view: "discover", course: null };
  for (const [key, value] of Object.entries(route))
    if (value != null && value !== defaults[key]) params.set(key, value);
  return `${window.location.pathname}${params.size ? `?${params}` : ""}`;
}
export default function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function navigate(patch, { replace = false, scroll = false } = {}) {
    const next = { ...readRoute(), ...patch };
    window.history[replace ? "replaceState" : "pushState"](
      { openedCourse: Boolean(patch.course) },
      "",
      routeHref(next),
    );
    setRoute(next);
    if (scroll) window.scrollTo({ top: 0, behavior: "instant" });
  }
  function backToCatalog() {
    if (window.history.state?.openedCourse) window.history.back();
    else navigate({ course: null }, { replace: true, scroll: true });
  }
  return { route, navigate, backToCatalog };
}
