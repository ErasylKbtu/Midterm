import { ArrowUpRight, Bookmark, Clock3, Layers3 } from "lucide-react";
import { initials } from "../lib/courseUi.js";
import { progressPercent } from "../lib/catalog.js";
import CourseArtwork from "./CourseArtwork.jsx";
export default function CourseCard({
  course,
  isSaved,
  entry,
  href,
  onOpen,
  onToggleSave,
}) {
  const percent = progressPercent(entry, course.lessons);
  function open(event) {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      onOpen(course.id);
    }
  }
  return (
    <article className="course-card">
      <div className="card-art-wrap">
        <a href={href} onClick={open} tabIndex={-1} aria-hidden="true">
          <CourseArtwork category={course.category} />
        </a>
        <button
          className={`save-button ${isSaved ? "is-saved" : ""}`}
          type="button"
          aria-label={`${isSaved ? "Unsave" : "Save"} ${course.title}`}
          aria-pressed={isSaved}
          onClick={() => onToggleSave(course.id)}
        >
          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="course-content">
        <div className="course-topline">
          <span>{course.category}</span>
          <span className={`level-badge level-${course.level.toLowerCase()}`}>
            {course.level}
          </span>
        </div>
        <h3>
          <a href={href} onClick={open}>
            {course.title}
          </a>
        </h3>
        <p className="course-description">{course.description}</p>
        <div className="course-meta">
          <span>
            <Clock3 size={14} />
            {course.durationHours} hours
          </span>
          <span>
            <Layers3 size={14} />
            {course.lessons} lessons
          </span>
        </div>
        {entry && (
          <div className="card-progress">
            <div>
              <span>{percent === 100 ? "Completed" : "In progress"}</span>
              <strong>{percent}%</strong>
            </div>
            <progress
              max={course.lessons}
              value={Math.min(entry.completed, course.lessons)}
              aria-label={`Progress for ${course.title}`}
            />
          </div>
        )}
        <div className="course-bottom">
          <span className="instructor">
            <span className="instructor-avatar">
              {initials(course.instructor)}
            </span>
            {course.instructor}
          </span>
          <a
            className="course-open"
            href={href}
            onClick={open}
            aria-label={`View details for ${course.title}`}
          >
            <ArrowUpRight size={19} />
          </a>
        </div>
      </div>
    </article>
  );
}
