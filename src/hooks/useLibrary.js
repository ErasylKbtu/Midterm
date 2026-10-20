import { useState } from "react";
const SAVED_KEY = "studyhub-saved-v1";
const LEARNING_KEY = "studyhub-learning-v1";
function readLocal(key, fallback, validate) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { value: fallback, error: "" };
    const value = JSON.parse(raw);
    if (!validate(value)) throw new Error("Invalid data");
    return { value, error: "" };
  } catch {
    return {
      value: fallback,
      error:
        "Your saved learning data could not be read. Existing storage has not been changed.",
    };
  }
}
const validLearning = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.values(value).every(
    (item) =>
      item &&
      Number.isInteger(item.completed) &&
      item.completed >= 0 &&
      Number.isInteger(item.total) &&
      item.total > 0 &&
      item.completed <= item.total &&
      typeof item.notes === "string",
  );
export default function useLibrary() {
  const [saved, setSaved] = useState(() =>
    readLocal(
      SAVED_KEY,
      [],
      (value) =>
        Array.isArray(value) && value.every((id) => typeof id === "string"),
    ),
  );
  const [learning, setLearning] = useState(() =>
    readLocal(LEARNING_KEY, {}, validLearning),
  );
  const [writeError, setWriteError] = useState("");
  function persist(key, next, setter, readError) {
    if (readError) throw new Error(readError);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      const message =
        "Changes could not be saved. Check your browser storage and try again.";
      setWriteError(message);
      throw new Error(message);
    }
    setter({ value: next, error: "" });
    setWriteError("");
  }
  function toggleSaved(id) {
    const has = saved.value.includes(id);
    persist(
      SAVED_KEY,
      has ? saved.value.filter((item) => item !== id) : [...saved.value, id],
      setSaved,
      saved.error,
    );
    return !has;
  }
  function updateProgress(course, patch = {}) {
    const current = learning.value[course.id] ?? {
      completed: 0,
      total: course.lessons,
      notes: "",
      startedAt: new Date().toISOString(),
    };
    const entry = {
      ...current,
      ...patch,
      total: course.lessons,
      updatedAt: new Date().toISOString(),
    };
    entry.completed = Math.max(0, Math.min(course.lessons, entry.completed));
    persist(
      LEARNING_KEY,
      { ...learning.value, [course.id]: entry },
      setLearning,
      learning.error,
    );
  }
  return {
    savedIds: saved.value,
    learning: learning.value,
    toggleSaved,
    updateProgress,
    error: saved.error || learning.error || writeError,
  };
}
