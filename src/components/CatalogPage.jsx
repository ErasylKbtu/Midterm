import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CheckCheck,
  Compass,
  GraduationCap,
  Layers3,
} from "lucide-react";
import { getCatalogOverview } from "../api/coursesApi.js";
import { DEFAULT_FILTERS } from "../hooks/useRoute.js";
import { PAGE_SIZE } from "../lib/catalog.js";
import useCourses from "../hooks/useCourses.js";
import Hero from "./Hero.jsx";
import Filters from "./Filters.jsx";
import CourseGrid from "./CourseGrid.jsx";
import Pagination from "./Pagination.jsx";
export default function CatalogPage({
  route,
  navigate,
  library,
  revision,
  onToggleSave,
  onDiscover,
  onAdd,
}) {
  const [layout, setLayout] = useState("grid");
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(false);
  const [overviewRetry, setOverviewRetry] = useState(0);
  const entries = Object.entries(library.learning);
  const completed = entries.filter(
    ([, entry]) => entry.completed >= entry.total,
  ).length;
  const learningIds = entries
    .filter(
      ([, entry]) =>
        route.status === "all" ||
        (route.status === "completed"
          ? entry.completed >= entry.total
          : entry.completed < entry.total),
    )
    .map(([id]) => id);
  // Bookmarks never invalidate Discover's API request: null remains null.
  const scopeIds =
    route.view === "saved"
      ? JSON.stringify(library.savedIds)
      : route.view === "learning"
        ? JSON.stringify(learningIds)
        : null;
  const result = useCourses(route, scopeIds, revision);
  useEffect(() => {
    const controller = new AbortController();
    setOverviewError(false);
    getCatalogOverview({ signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setOverview(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setOverviewError(true);
      });
    return () => controller.abort();
  }, [revision, overviewRetry]);
  const changeFilters = (patch) =>
    navigate({ ...patch, page: 1 }, { replace: true });
  const reset = () => navigate(DEFAULT_FILTERS, { replace: true });
  const hasFilters =
    Boolean(route.search) ||
    route.category !== "All" ||
    route.level !== "All" ||
    route.duration !== "All" ||
    route.status !== "all";
  const isDiscover = route.view === "discover";
  const stats = isDiscover
    ? [
        {
          icon: BookOpen,
          count: overview?.total ?? "—",
          label: "courses to explore",
          tone: "purple",
        },
        {
          icon: Layers3,
          count: overview?.categories ?? "—",
          label: "ways to follow your curiosity",
          tone: "peach",
        },
        {
          icon: Bookmark,
          count: library.savedIds.length,
          label: "saved for another day",
          tone: "green",
        },
      ]
    : [
        {
          icon: GraduationCap,
          count: entries.length - completed,
          label: "courses in progress",
          tone: "purple",
        },
        {
          icon: CheckCheck,
          count: completed,
          label: "courses completed",
          tone: "green",
        },
        {
          icon: Bookmark,
          count: library.savedIds.length,
          label: "courses in your collection",
          tone: "peach",
        },
      ];
  return (
    <>
      <div className="page-intro">
        <div>
          <div className="eyebrow muted">YOUR SPACE TO GROW</div>
          <h2>
            {isDiscover
              ? "Good things start with curiosity."
              : route.view === "saved"
                ? "Good finds, all in one place."
                : "A little better, every day."}
          </h2>
        </div>
        <span className="intro-icon">
          <Compass size={26} strokeWidth={1.4} />
        </span>
      </div>
      {isDiscover ? (
        <Hero />
      ) : (
        <div
          className={`collection-banner ${route.view === "saved" ? "saved-banner" : ""}`}
        >
          <div>
            <span className="eyebrow">
              {route.view === "saved"
                ? "YOUR PERSONAL COLLECTION"
                : "PROGRESS, AT YOUR PACE"}
            </span>
            <h1>
              {route.view === "saved"
                ? "For your next “what if?”"
                : "Keep the momentum going."}
            </h1>
            <p>
              {route.view === "saved"
                ? "Everything you want to learn, right where you left it."
                : "Track the lessons you study and collect your own notes along the way."}
            </p>
          </div>
          <span aria-hidden="true">{route.view === "saved" ? "✳" : "↗"}</span>
        </div>
      )}
      <div className="stats-row">
        {stats.map(({ icon: Icon, count, label, tone }) => (
          <div className="stat" key={label}>
            <span className={`stat-icon ${tone}`}>
              <Icon size={21} />
            </span>
            <div>
              <strong>{count}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      {overviewError && (
        <div className="overview-error" role="status">
          Catalog totals are unavailable.{" "}
          <button
            type="button"
            onClick={() => setOverviewRetry((value) => value + 1)}
          >
            Retry totals
          </button>
        </div>
      )}
      <section
        id="catalog"
        className="catalog-section"
        aria-labelledby="catalog-title"
      >
        <div className="section-header">
          <div>
            <h2 id="catalog-title">
              {isDiscover
                ? "Find your next thing"
                : route.view === "saved"
                  ? "Saved courses"
                  : "My learning"}
              <span className="heading-dot">.</span>
            </h2>
            <p>
              {isDiscover
                ? "Fresh perspectives. Practical skills. A place to begin."
                : "A collection that grows with you."}
            </p>
          </div>
          <span className="catalog-count">
            {result.status === "success"
              ? `${result.total} courses`
              : "Exploring…"}
          </span>
        </div>
        {route.view === "learning" && (
          <div className="status-tabs" aria-label="Learning status">
            {[
              ["all", "All learning"],
              ["active", "In progress"],
              ["completed", "Completed"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={route.status === value}
                className={route.status === value ? "selected" : ""}
                onClick={() => changeFilters({ status: value })}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <Filters
          route={route}
          onChange={changeFilters}
          onReset={reset}
          layout={layout}
          onLayout={setLayout}
        />
        <div className="results-label" aria-live="polite">
          <span>
            {result.isSearching || result.status === "loading"
              ? "Finding your next skill…"
              : result.status === "error"
                ? "Catalog unavailable"
                : result.total
                  ? `Showing ${(result.page - 1) * PAGE_SIZE + 1}–${Math.min(result.page * PAGE_SIZE, result.total)} of ${result.total} courses`
                  : "No matching courses"}
          </span>
          <span className="results-hint">
            A little learning goes a long way <span>↗</span>
          </span>
        </div>
        <CourseGrid
          result={result}
          route={route}
          layout={layout}
          library={library}
          onOpen={(id) => navigate({ course: id }, { scroll: true })}
          onToggleSave={onToggleSave}
          onReset={reset}
          onDiscover={onDiscover}
          hasFilters={hasFilters}
        />
        {result.status === "success" && !result.isSearching && (
          <Pagination
            currentPage={result.page}
            totalPages={result.pages}
            onPageChange={(page) => navigate({ page }, { replace: true })}
          />
        )}
      </section>
      {isDiscover && (
        <div className="bottom-banner">
          <span className="bottom-spark" aria-hidden="true">
            ✳
          </span>
          <div>
            <h3>Found something worth learning?</h3>
            <p>Give it a home in your personal catalog.</p>
          </div>
          <button
            className="button button-outline"
            type="button"
            onClick={onAdd}
          >
            Add your own course <ArrowUpRight size={17} />
          </button>
        </div>
      )}
    </>
  );
}
