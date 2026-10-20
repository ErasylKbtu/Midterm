import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookPlus, LoaderCircle, X } from "lucide-react";
import { CATEGORIES, LEVELS, validateCourse } from "../lib/catalog.js";
import { createCourse } from "../api/coursesApi.js";
const EMPTY = {
  title: "",
  instructor: "",
  category: "Development",
  level: "Beginner",
  durationHours: "6",
  lessons: "12",
  description: "",
  outcomes: "",
};
export default function AddCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const controllerRef = useRef(null);
  const closeRef = useRef(null);
  const submitRef = useRef(null);
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);
  function change(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setApiError("");
  }
  async function submit(event) {
    event.preventDefault();
    if (controllerRef.current) return;
    const nextErrors = validateCourse(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    setApiError("");
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const course = await createCourse(form, { signal: controller.signal });
      if (!controller.signal.aborted) onCreated(course);
    } catch (error) {
      if (!controller.signal.aborted) {
        setApiError(error.message);
        setSubmitting(false);
      }
    } finally {
      controllerRef.current = null;
    }
  }
  function keyboard(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!submitting) onClose();
    }
    if (event.key === "Tab") {
      if (submitting) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && event.target === closeRef.current) {
        event.preventDefault();
        submitRef.current?.focus();
      }
      if (!event.shiftKey && event.target === submitRef.current) {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }
  }
  const field = (name) => ({
    id: name,
    "aria-label": {
      title: "Course title",
      instructor: "Instructor",
      category: "Category",
      level: "Experience level",
      durationHours: "Duration in hours",
      lessons: "Number of lessons",
      description: "Description",
      outcomes: "What will you learn?",
    }[name],
    name,
    value: form[name],
    onChange: change,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const error = (name) =>
    errors[name] && (
      <span id={`${name}-error`} className="field-error">
        {errors[name]}
      </span>
    );
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onKeyDown={keyboard}
      >
        <div className="modal-head">
          <span className="modal-icon">
            <BookPlus size={23} />
          </span>
          <button
            type="button"
            ref={closeRef}
            className="icon-button"
            aria-label="Close form"
            disabled={submitting}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <span className="eyebrow muted">MAKE ROOM FOR SOMETHING NEW</span>
        <h2 id="modal-title">A good course deserves a home.</h2>
        <p id="modal-description">
          Add it to your personal catalog. All fields are required unless marked
          optional.
        </p>
        <form className="course-form" noValidate onSubmit={submit}>
          <fieldset disabled={submitting}>
            <label htmlFor="title">
              Course title
              <input
                {...field("title")}
                autoFocus
                required
                minLength={3}
                maxLength={85}
                placeholder="e.g. Building thoughtful interfaces with React"
              />
              {error("title")}
            </label>
            <div className="form-grid">
              <label htmlFor="category">
                Category
                <select {...field("category")}>
                  {CATEGORIES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                {error("category")}
              </label>
              <label htmlFor="level">
                Experience level
                <select {...field("level")}>
                  {LEVELS.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                {error("level")}
              </label>
            </div>
            <label htmlFor="instructor">
              Instructor
              <input
                {...field("instructor")}
                required
                minLength={2}
                maxLength={55}
                placeholder="Who’s sharing their knowledge?"
              />
              {error("instructor")}
            </label>
            <div className="form-grid">
              <label htmlFor="durationHours">
                Duration in hours
                <input
                  {...field("durationHours")}
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  required
                />
                {error("durationHours")}
              </label>
              <label htmlFor="lessons">
                Number of lessons
                <input
                  {...field("lessons")}
                  type="number"
                  min="1"
                  max="200"
                  step="1"
                  required
                />
                {error("lessons")}
              </label>
            </div>
            <label htmlFor="description">
              Description
              <textarea
                {...field("description")}
                rows={3}
                minLength={20}
                maxLength={500}
                required
                placeholder="What makes this course worth exploring?"
              />
              {error("description")}
              <span className="field-hint">
                20–500 characters · {form.description.length}/500
              </span>
            </label>
            <label htmlFor="outcomes">
              What will you learn? <span className="optional">Optional</span>
              <textarea
                {...field("outcomes")}
                rows={3}
                maxLength={600}
                placeholder={
                  "One learning outcome per line\nUp to five outcomes"
                }
              />
              {error("outcomes")}
            </label>
          </fieldset>
          {Object.values(errors).some(Boolean) && (
            <p className="form-error" role="alert">
              Please check the highlighted fields.
            </p>
          )}
          {apiError && (
            <p className="form-error" role="alert">
              {apiError}
            </p>
          )}
          <div className="form-actions">
            <span>Saved in this browser</span>
            <button
              className="button button-outline"
              type="button"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              ref={submitRef}
              className="button button-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="spin" /> Adding course…
                </>
              ) : (
                <>
                  Add to catalog <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
