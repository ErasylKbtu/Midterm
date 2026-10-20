import { Search, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, LEVELS, getCourseTheme } from "../lib/courseUi.js";
export default function Filters({
  route,
  onChange,
  onReset,
  layout,
  onLayout,
}) {
  const active =
    route.search ||
    route.category !== "All" ||
    route.level !== "All" ||
    route.duration !== "All" ||
    route.status !== "all";
  return (
    <div className="filters">
      <div className="category-scroller" aria-label="Course categories">
        <button
          className={`category-chip ${route.category === "All" ? "selected" : ""}`}
          type="button"
          aria-pressed={route.category === "All"}
          onClick={() => onChange({ category: "All" })}
        >
          All topics
        </button>
        {CATEGORIES.map((category) => {
          const Icon = getCourseTheme(category).icon;
          return (
            <button
              key={category}
              type="button"
              className={`category-chip ${route.category === category ? "selected" : ""}`}
              aria-pressed={route.category === category}
              onClick={() => onChange({ category })}
            >
              <Icon size={15} />
              {category}
            </button>
          );
        })}
      </div>
      <div className="filter-toolbar">
        <div className="search-field">
          <Search size={18} />
          <label className="sr-only" htmlFor="course-search">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            maxLength={120}
            value={route.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Find your next skill…"
          />
          {route.search && (
            <button
              type="button"
              className="icon-button"
              aria-label="Clear search"
              onClick={() => onChange({ search: "" })}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <label className="select-wrap">
          <SlidersHorizontal size={15} />
          <span className="sr-only">Filter by level</span>
          <select
            aria-label="Filter by level"
            value={route.level}
            onChange={(event) => onChange({ level: event.target.value })}
          >
            <option value="All">All levels</option>
            {LEVELS.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
        <label className="select-wrap">
          <span className="sr-only">Filter by duration</span>
          <select
            aria-label="Filter by duration"
            value={route.duration}
            onChange={(event) => onChange({ duration: event.target.value })}
          >
            <option value="All">Any duration</option>
            <option value="short">Up to 5 hours</option>
            <option value="medium">6–10 hours</option>
            <option value="long">Over 10 hours</option>
          </select>
        </label>
        <label className="select-wrap sort-select">
          <span className="sr-only">Sort courses</span>
          <select
            aria-label="Sort courses"
            value={route.sort}
            onChange={(event) => onChange({ sort: event.target.value })}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest first</option>
            <option value="title-asc">Title A–Z</option>
            <option value="duration-asc">Shortest first</option>
            <option value="duration-desc">Longest first</option>
          </select>
        </label>
        <div className="layout-toggle" aria-label="Course layout">
          <button
            type="button"
            className={layout === "grid" ? "selected" : ""}
            aria-pressed={layout === "grid"}
            aria-label="Grid view"
            onClick={() => onLayout("grid")}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            type="button"
            className={layout === "list" ? "selected" : ""}
            aria-pressed={layout === "list"}
            aria-label="List view"
            onClick={() => onLayout("list")}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      {active && (
        <div className="active-filters">
          <span>Filtered by</span>
          {route.search && (
            <button onClick={() => onChange({ search: "" })} type="button">
              “{route.search}” <X size={13} />
            </button>
          )}
          {["category", "level", "duration"]
            .filter((key) => route[key] !== "All")
            .map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => onChange({ [key]: "All" })}
              >
                {key === "duration"
                  ? {
                      short: "Up to 5 hours",
                      medium: "6–10 hours",
                      long: "Over 10 hours",
                    }[route[key]]
                  : route[key]}
                <X size={13} />
              </button>
            ))}
          <button className="clear-filters" type="button" onClick={onReset}>
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
