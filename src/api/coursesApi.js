import initialCourses from "../data/courses.json" with { type: "json" };
import {
  CATEGORIES,
  LEVELS,
  PAGE_SIZE,
  validateCourse,
} from "../lib/catalog.js";

export const STORAGE_KEY = "studyhub-catalog-v1"; // Preserve the original project's catalog.
const abortError = () =>
  new DOMException("The request was cancelled.", "AbortError");
const clone = (value) => JSON.parse(JSON.stringify(value));
const normalize = (value) =>
  String(value ?? "")
    .toLocaleLowerCase()
    .trim();
function waitForApi(signal, ms = 300) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
function validRecord(course) {
  return (
    course &&
    typeof course.id === "string" &&
    course.id.length > 0 &&
    typeof course.title === "string" &&
    typeof course.description === "string" &&
    typeof course.instructor === "string" &&
    CATEGORIES.includes(course.category) &&
    LEVELS.includes(course.level) &&
    Number.isInteger(course.durationHours) &&
    course.durationHours > 0 &&
    Number.isInteger(course.lessons) &&
    course.lessons > 0 &&
    typeof course.publishedAt === "string" &&
    Number.isFinite(Date.parse(course.publishedAt)) &&
    Array.isArray(course.outcomes) &&
    course.outcomes.every((item) => typeof item === "string")
  );
}
function readDatabase() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCourses));
      return clone(initialCourses);
    }
  } catch {
    throw new Error(
      "Browser storage is unavailable. Allow site storage in your browser, then try again.",
    );
  }
  try {
    const records = JSON.parse(raw);
    if (
      !Array.isArray(records) ||
      !records.length ||
      !records.every(validRecord) ||
      new Set(records.map((item) => item.id)).size !== records.length
    )
      throw new Error("Invalid records");
    return records;
  } catch {
    throw new Error(
      "The saved catalog could not be read. Your data has not been changed. Try reloading the page, or restore a backup of your browser data.",
    );
  }
}
export async function getCourses(
  {
    search = "",
    category = "All",
    level = "All",
    duration = "All",
    sort = "featured",
    page = 1,
    pageSize = PAGE_SIZE,
    ids = null,
  } = {},
  { signal } = {},
) {
  await waitForApi(signal);
  const words = normalize(search).split(/\s+/).filter(Boolean);
  const allowedIds = ids === null ? null : new Set(ids);
  const matching = readDatabase().filter((course) => {
    const text = normalize(
      [
        course.title,
        course.description,
        course.instructor,
        course.category,
        ...course.outcomes,
      ].join(" "),
    );
    return (
      words.every((word) => text.includes(word)) &&
      (category === "All" || course.category === category) &&
      (level === "All" || course.level === level) &&
      (duration === "All" ||
        (duration === "short" && course.durationHours <= 5) ||
        (duration === "medium" &&
          course.durationHours > 5 &&
          course.durationHours <= 10) ||
        (duration === "long" && course.durationHours > 10)) &&
      (allowedIds === null || allowedIds.has(course.id))
    );
  });
  const sorters = {
    featured: (a, b) => a.id.localeCompare(b.id),
    newest: (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id),
    "title-asc": (a, b) => a.title.localeCompare(b.title),
    "duration-asc": (a, b) =>
      a.durationHours - b.durationHours || a.title.localeCompare(b.title),
    "duration-desc": (a, b) =>
      b.durationHours - a.durationHours || a.title.localeCompare(b.title),
  };
  matching.sort(sorters[sort] ?? sorters.featured);
  const safeSize = Math.max(
    1,
    Math.min(100, Math.floor(Number(pageSize) || PAGE_SIZE)),
  );
  const total = matching.length;
  const pages = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.max(1, Math.min(Math.floor(Number(page) || 1), pages));
  return clone({
    items: matching.slice((safePage - 1) * safeSize, safePage * safeSize),
    total,
    page: safePage,
    pages,
  });
}
export async function getCatalogOverview({ signal } = {}) {
  await waitForApi(signal, 180);
  const records = readDatabase();
  return {
    total: records.length,
    categories: new Set(records.map((item) => item.category)).size,
    hours: records.reduce((sum, item) => sum + item.durationHours, 0),
  };
}
export async function getCourseById(id, { signal } = {}) {
  await waitForApi(signal, 220);
  const course = readDatabase().find((item) => item.id === id);
  if (!course)
    throw new Error(
      "This course is not in your catalog. It may belong to another browser or have been removed.",
    );
  return clone(course);
}
export async function createCourse(form, { signal } = {}) {
  await waitForApi(signal, 400);
  const errors = validateCourse(form);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const database = readDatabase();
  if (
    database.some(
      (item) =>
        normalize(item.title) === normalize(form.title) &&
        normalize(item.instructor) === normalize(form.instructor),
    )
  ) {
    throw new Error("A course with this title and instructor already exists.");
  }
  const course = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    title: form.title.trim(),
    instructor: form.instructor.trim(),
    description: form.description.trim(),
    category: form.category,
    level: form.level,
    durationHours: Number(form.durationHours),
    lessons: Number(form.lessons),
    publishedAt: new Date().toISOString(),
    outcomes: String(form.outcomes ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5),
  };
  if (!course.outcomes.length)
    course.outcomes = [
      "Explore the key concepts.",
      "Apply your knowledge in a practice project.",
    ];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([course, ...database]));
  } catch {
    throw new Error(
      "There is not enough browser storage to save this course. Free some space and try again.",
    );
  }
  return clone(course);
}
