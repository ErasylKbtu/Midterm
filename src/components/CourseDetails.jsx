import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Play,
  Undo2,
  UserRound,
} from "lucide-react";
import { getCourseById } from "../api/coursesApi.js";
import { formatDuration, initials } from "../lib/courseUi.js";
import { progressPercent } from "../lib/catalog.js";
import CourseArtwork from "./CourseArtwork.jsx";
import StatePanel from "./StatePanel.jsx";

function LearningPanel({ course, entry, onUpdate, notify }) {
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const percent = progressPercent(entry, course.lessons);
  const done = entry && entry.completed >= course.lessons;
  function update(patch, message) {
    try {
      onUpdate(course, patch);
      if (message) notify(message);
    } catch (error) {
      notify(error.message, "error");
    }
  }
  return (
    <>
      <div className="tracking-card">
        <div className="section-kicker">
          <GraduationCap size={17} /> YOUR LEARNING PLAN
        </div>
        <h2>
          {entry
            ? done
              ? "Look how far you’ve come."
              : "Keep showing up."
            : "Make this your next step."}
        </h2>
        <p>Track the lessons you study at your own pace.</p>
        {entry && (
          <div className="detail-progress">
            <div>
              <strong>{percent}% complete</strong>
              <span>
                {entry.completed} / {course.lessons} lessons
              </span>
            </div>
            <progress
              max={course.lessons}
              value={Math.min(entry.completed, course.lessons)}
              aria-label="Course completion"
            />
          </div>
        )}
        <button
          type="button"
          className={`button ${done ? "button-completed" : "button-primary"} full-width`}
          disabled={done}
          onClick={() =>
            update(
              entry ? { completed: entry.completed + 1 } : {},
              entry
                ? entry.completed + 1 === course.lessons
                  ? "Course completed. A milestone worth celebrating!"
                  : "One more lesson recorded. Keep going!"
                : "Added to My learning. Your progress starts here.",
            )
          }
        >
          {done ? (
            <CheckCircle2 size={18} />
          ) : entry ? (
            <Check size={18} />
          ) : (
            <Play size={17} />
          )}{" "}
          {entry
            ? done
              ? "Course completed"
              : "Mark next lesson complete"
            : "Start tracking"}
        </button>
        {entry?.completed > 0 && (
          <button
            type="button"
            className="text-button undo-button"
            onClick={() =>
              update(
                { completed: entry.completed - 1 },
                "Last lesson mark undone.",
              )
            }
          >
            <Undo2 size={14} /> Undo last lesson
          </button>
        )}
        <p className="tracking-note">
          This is a catalog and study tracker. Lesson videos and teaching
          materials are not hosted here.
        </p>
      </div>
      {entry && (
        <form
          className="notes-card"
          onSubmit={(event) => {
            event.preventDefault();
            update({ notes }, "Your learning notes are saved.");
          }}
        >
          <label htmlFor="learning-notes">
            <BookOpen size={17} /> Your learning notes
          </label>
          <p>Ideas, takeaways, and things to try next.</p>
          <textarea
            id="learning-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={6}
            maxLength={3000}
            placeholder="One thing I learned today…"
          />
          <div className="notes-bottom">
            <span>{notes.length}/3000</span>
            <button
              className="button button-outline"
              type="submit"
              disabled={notes === entry.notes}
            >
              Save notes
            </button>
          </div>
        </form>
      )}
    </>
  );
}
export default function CourseDetails({
  id,
  entry,
  isSaved,
  onBack,
  onToggleSave,
  onUpdate,
  notify,
}) {
  const [state, setState] = useState({
    status: "loading",
    course: null,
    error: "",
  });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", course: null, error: "" });
    getCourseById(id, { signal: controller.signal })
      .then((course) => {
        if (!controller.signal.aborted)
          setState({ status: "success", course, error: "" });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ status: "error", course: null, error: error.message });
      });
    return () => controller.abort();
  }, [id, retry]);
  const { course } = state;
  return (
    <section className="details-page">
      <button className="back-link" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Back to courses
      </button>
      {state.status === "loading" ? (
        <div className="detail-loading" role="status">
          <span className="spinner" /> Finding your next chapter…
        </div>
      ) : state.status === "error" ? (
        <StatePanel
          type="error"
          title="We couldn’t find this course"
          description={state.error}
          action={() => setRetry((value) => value + 1)}
          actionLabel="Try again"
        />
      ) : (
        <div className="detail-layout">
          <div className="detail-main">
            <CourseArtwork category={course.category} large />
            <div className="detail-heading">
              <div className="course-topline">
                <span>{course.category}</span>
                <span
                  className={`level-badge level-${course.level.toLowerCase()}`}
                >
                  {course.level}
                </span>
              </div>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
              <div className="detail-instructor">
                <span className="instructor-avatar">
                  {initials(course.instructor)}
                </span>
                <span>
                  Curated with <strong>{course.instructor}</strong>
                </span>
              </div>
            </div>
            <div className="detail-section">
              <div className="section-kicker">
                <ArrowUpRight size={17} /> TAKE SOMETHING WITH YOU
              </div>
              <h2>What you’ll learn</h2>
              <div className="outcome-list">
                {course.outcomes.map((outcome, index) => (
                  <div className="outcome" key={`${index}-${outcome}`}>
                    <CheckCircle2 size={20} />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="detail-section">
              <div className="section-kicker">
                <Layers3 size={17} /> THE DETAILS
              </div>
              <h2>A plan that fits your pace.</h2>
              <dl className="detail-specs">
                <div>
                  <dt>
                    <Clock3 size={18} /> Estimated study time
                  </dt>
                  <dd>{formatDuration(course.durationHours)}</dd>
                </div>
                <div>
                  <dt>
                    <BookOpen size={18} /> Lessons to track
                  </dt>
                  <dd>{course.lessons}</dd>
                </div>
                <div>
                  <dt>
                    <GraduationCap size={18} /> Experience level
                  </dt>
                  <dd>{course.level}</dd>
                </div>
                <div>
                  <dt>
                    <UserRound size={18} /> Instructor
                  </dt>
                  <dd>{course.instructor}</dd>
                </div>
              </dl>
            </div>
            <div className="learning-tip">
              <span>✳</span>
              <div>
                <h3>Make it stick.</h3>
                <p>
                  After a study session, write down one useful idea and one way
                  you’ll apply it. Small reflections make room for better
                  understanding.
                </p>
              </div>
            </div>
          </div>
          <aside className="detail-sidebar">
            <div className="detail-sticky">
              <LearningPanel
                course={course}
                entry={entry}
                onUpdate={onUpdate}
                notify={notify}
              />
              <button
                className={`button button-outline full-width save-detail ${isSaved ? "is-saved" : ""}`}
                type="button"
                aria-pressed={isSaved}
                onClick={() => onToggleSave(course.id)}
              >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved to your collection" : "Save for later"}
              </button>
              <p className="local-note">
                Your courses, progress, and notes stay in this browser. No
                account needed.
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
