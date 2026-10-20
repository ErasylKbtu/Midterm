import CourseCard from "./CourseCard.jsx";
import StatePanel from "./StatePanel.jsx";
import { routeHref } from "../hooks/useRoute.js";
export default function CourseGrid({
  result,
  route,
  layout,
  library,
  onOpen,
  onToggleSave,
  onReset,
  onDiscover,
  hasFilters,
}) {
  if (result.status === "error")
    return (
      <StatePanel
        type="error"
        title="The catalog needs a moment"
        description={result.error}
        action={result.retry}
        actionLabel="Try again"
      />
    );
  if (result.status === "loading" || result.isSearching)
    return (
      <div
        className={`course-grid ${layout === "list" ? "list-view" : ""}`}
        role="status"
        aria-label="Loading courses"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="course-card skeleton-card">
            <div className="skeleton-art shimmer" />
            <div className="skeleton-body">
              <div className="skeleton-line short shimmer" />
              <div className="skeleton-line title shimmer" />
              <div className="skeleton-line shimmer" />
              <div className="skeleton-line shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  if (!result.items.length)
    return (
      <StatePanel
        type={route.view === "saved" ? "saved" : "empty"}
        title={
          hasFilters
            ? "No courses found. Keep exploring."
            : route.view === "saved"
              ? "Save a little inspiration."
              : "Your next chapter starts here."
        }
        description={
          hasFilters
            ? "Try another keyword or clear your filters to see more courses."
            : route.view === "saved"
              ? "Bookmark a course and it will be waiting for you here."
              : "Open a course and select Start tracking to build your personal learning plan."
        }
        action={hasFilters ? onReset : onDiscover}
        actionLabel={hasFilters ? "Clear filters" : "Explore courses"}
      />
    );
  return (
    <div className={`course-grid ${layout === "list" ? "list-view" : ""}`}>
      {result.items.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          href={routeHref({ ...route, course: course.id })}
          isSaved={library.savedIds.includes(course.id)}
          entry={library.learning[course.id]}
          onOpen={onOpen}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
