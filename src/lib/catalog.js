export const CATEGORIES = [
  "Development",
  "Data Science",
  "Design",
  "Business",
  "AI & Automation",
  "Marketing",
  "Productivity",
  "Cybersecurity",
];
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const SORTS = [
  "featured",
  "newest",
  "title-asc",
  "duration-asc",
  "duration-desc",
];
export const DURATIONS = ["All", "short", "medium", "long"];
export const PAGE_SIZE = 9;

// Shared by the controlled form and API, so their validation cannot drift apart.
export function validateCourse(form) {
  const errors = {};
  const title = String(form.title ?? "").trim();
  const instructor = String(form.instructor ?? "").trim();
  const description = String(form.description ?? "").trim();
  if (title.length < 3 || title.length > 85)
    errors.title = "Use 3–85 characters for the title.";
  if (instructor.length < 2 || instructor.length > 55)
    errors.instructor = "Use 2–55 characters for the instructor.";
  if (description.length < 20 || description.length > 500)
    errors.description = "Write a description of 20–500 characters.";
  if (!CATEGORIES.includes(form.category))
    errors.category = "Choose a category.";
  if (!LEVELS.includes(form.level)) errors.level = "Choose a level.";
  for (const [field, max, label] of [
    ["durationHours", 100, "Hours"],
    ["lessons", 200, "Lessons"],
  ]) {
    const value = Number(form[field]);
    if (!Number.isInteger(value) || value < 1 || value > max)
      errors[field] = `${label} must be a whole number from 1 to ${max}.`;
  }
  if (String(form.outcomes ?? "").length > 600)
    errors.outcomes = "Keep learning outcomes under 600 characters.";
  return errors;
}
export function progressPercent(entry, lessons) {
  return entry
    ? Math.round((Math.min(entry.completed, lessons) / lessons) * 100)
    : 0;
}
