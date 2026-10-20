import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import seed from "../src/data/courses.json" with { type: "json" };
import {
  getCourses,
  getCourseById,
  getCatalogOverview,
  createCourse,
  STORAGE_KEY,
} from "../src/api/coursesApi.js";
class MemoryStorage {
  data = new Map();
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
}
beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
});
const courseForm = {
  title: "Accessible React Interfaces",
  instructor: "Karas Yerassyl",
  category: "Development",
  level: "Intermediate",
  durationHours: "8",
  lessons: "12",
  description:
    "Build keyboard-friendly components with clear state and reusable React patterns.",
  outcomes: "Build a controlled form\nHandle asynchronous requests",
};

test("a fresh catalog has 120 unique records in eight categories", async () => {
  const overview = await getCatalogOverview();
  assert.equal(overview.total, 120);
  assert.equal(overview.categories, 8);
  assert.equal(new Set(seed.map((course) => course.id)).size, 120);
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)).length, 120);
});
test("combined search, level, category and duration filters return matching records", async () => {
  const response = await getCourses({
    search: "  JAVASCRIPT  essentials ",
    category: "Development",
    level: "Beginner",
    duration: "short",
  });
  assert.ok(response.total > 0);
  assert.ok(
    response.items.every(
      (course) =>
        course.title.toLowerCase().includes("javascript") &&
        course.level === "Beginner" &&
        course.durationHours <= 5,
    ),
  );
  const instructor = await getCourses({ search: seed[0].instructor });
  assert.ok(instructor.items.some((course) => course.id === seed[0].id));
});
test("sorting is applied before pagination, and pages do not overlap", async () => {
  const first = await getCourses({ sort: "duration-asc", page: 1 });
  const second = await getCourses({ sort: "duration-asc", page: 2 });
  assert.equal(first.items.length, 9);
  assert.equal(first.pages, 14);
  assert.ok(first.items.at(-1).durationHours <= second.items[0].durationHours);
  assert.equal(
    new Set([...first.items, ...second.items].map((course) => course.id)).size,
    18,
  );
});
test("empty scopes, no matches and out-of-range pages are handled", async () => {
  assert.equal((await getCourses({ ids: [] })).total, 0);
  assert.equal((await getCourses({ search: "zzzznotacoursezzzz" })).total, 0);
  const high = await getCourses({ page: 999 });
  assert.equal(high.page, high.pages);
  assert.equal(high.items.length, 3);
  const invalid = await getCourses({ page: -1, pageSize: -7 });
  assert.equal(invalid.page, 1);
  assert.equal(invalid.items.length, 1);
});
test("detail fetch is independent from pagination and returns an isolated JSON copy", async () => {
  const course = await getCourseById("course-120");
  course.title = "Changed locally";
  assert.notEqual((await getCourseById("course-120")).title, "Changed locally");
  await assert.rejects(getCourseById("not-a-course"), /not in your catalog/);
});
test("creating a valid course trims, persists, and lists it as newest", async () => {
  const course = await createCourse({
    ...courseForm,
    title: `  ${courseForm.title}  `,
  });
  assert.equal(course.title, courseForm.title);
  assert.equal(typeof course.lessons, "number");
  assert.equal((await getCourses({ sort: "newest" })).items[0].id, course.id);
  assert.equal((await getCatalogOverview()).total, 121);
  assert.deepEqual((await getCourseById(course.id)).outcomes, [
    "Build a controlled form",
    "Handle asynchronous requests",
  ]);
});
test("validation and duplicates reject without writing another record", async () => {
  await assert.rejects(createCourse({ ...courseForm, title: "   " }), /title/);
  await assert.rejects(
    createCourse({ ...courseForm, lessons: 1.5 }),
    /whole number/,
  );
  await assert.rejects(
    createCourse({ ...courseForm, category: "Unknown" }),
    /category/,
  );
  await createCourse(courseForm);
  await assert.rejects(
    createCourse({ ...courseForm, title: courseForm.title.toUpperCase() }),
    /already exists/,
  );
  assert.equal((await getCatalogOverview()).total, 121);
});
test("aborted requests reject and cancelled creation never writes", async () => {
  const controller = new AbortController();
  const pending = getCourses({}, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  const writeController = new AbortController();
  const creation = createCourse(courseForm, { signal: writeController.signal });
  writeController.abort();
  await assert.rejects(creation, { name: "AbortError" });
  assert.equal(localStorage.getItem(STORAGE_KEY), null);
});
test("malformed and duplicate-ID stored data is preserved and reported", async () => {
  localStorage.setItem(STORAGE_KEY, "{broken");
  await assert.rejects(getCourses(), /could not be read/);
  assert.equal(localStorage.getItem(STORAGE_KEY), "{broken");
  localStorage.setItem(STORAGE_KEY, JSON.stringify([seed[0], seed[0]]));
  await assert.rejects(getCourses(), /could not be read/);
});
test("storage read/write failures produce useful errors instead of false success", async () => {
  localStorage.getItem = () => {
    throw new Error("blocked");
  };
  await assert.rejects(getCourses(), /storage is unavailable/);
  globalThis.localStorage = new MemoryStorage();
  await getCourses();
  localStorage.setItem = () => {
    throw new Error("quota exceeded");
  };
  await assert.rejects(createCourse(courseForm), /not enough browser storage/);
});
