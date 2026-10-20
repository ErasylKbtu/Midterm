import { useEffect, useState } from "react";
import { getCourses } from "../api/coursesApi.js";
export default function useCourses(route, scopeIds, revision) {
  const { search, category, level, duration, sort, page } = route;
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    error: "",
  });
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, status: "loading", error: "" }));
    getCourses(
      {
        search: debouncedSearch,
        category,
        level,
        duration,
        sort,
        page,
        ids: scopeIds === null ? null : JSON.parse(scopeIds),
      },
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted)
          setState({ ...result, status: "success", error: "" });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            status: "error",
            error: error.message,
          }));
      });
    return () => controller.abort();
  }, [
    debouncedSearch,
    category,
    level,
    duration,
    sort,
    page,
    scopeIds,
    revision,
    retry,
  ]);
  return {
    ...state,
    isSearching: search !== debouncedSearch,
    retry: () => setRetry((value) => value + 1),
  };
}
