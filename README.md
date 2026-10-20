# StudyHub — React Midterm Project

A responsive course catalog and personal study tracker. Explore 120 courses, save a shortlist, add a course, record study progress, and keep personal learning notes.

**Student:** Karas Yerassyl · Information Systems, KBTU  
**Stack:** React 19, Vite 6, JavaScript, CSS, lucide-react  
**Data source:** one simulated asynchronous API, backed by JSON and localStorage.

## Run locally

Use **Node.js 22.12 or newer**.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Keep the terminal running while using the app. The source project must be run through Vite; double-clicking `index.html` will not work.

```bash
npm test          # 10 API regression tests, using Node's built-in test runner
npm run build     # production files in dist/
npm run preview   # check the production build locally
```

## Features

- **Discover:** 120 initial records across eight categories; multiword search over titles, descriptions, instructors, categories, and outcomes.
- **Filters:** category, experience level, duration; combine filters and clear them individually or together.
- **Sort and paginate:** featured, newest, title, shortest, longest; nine courses per page.
- **Two layouts:** course grid and compact list.
- **Course details:** a separate asynchronous fetch by ID, learning outcomes, instructor, duration, and lesson count.
- **Saved courses:** bookmarks persist across reloads; bookmarking in Discover does not refetch the catalog.
- **My learning:** start tracking, mark lessons complete, undo the last mark, and filter in-progress or completed courses.
- **Learning notes:** a controlled textarea with an explicit save action and a 3,000-character limit.
- **Add course:** a controlled modal form with field-level validation, duplicate checks, request cancellation, and clear success/error feedback.
- **URL state:** search, filters, sorting, page, active view, and selected course are encoded in query parameters. Refresh and browser Back/Forward work without a router dependency.
- **Accessible interaction:** labels, visible focus, keyboard dialog wrapping, focus return, inert background, reduced-motion support, and live status messages.
- **Local artwork:** category covers are CSS and SVG icons. No remote image or font service is needed after dependencies are installed.

## Scope and persistence

This is a **course catalog and a self-reported study tracker**, not a platform that hosts lesson videos, payments, or accounts. The seed courses and instructors are demonstration data. No learning completion is independently verified.

All course API operations live in `src/api/coursesApi.js`:

| Function                         | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `getCourses(query, { signal })`  | Search, filter, sort, and paginate records       |
| `getCourseById(id, { signal })`  | Load details independently of the current page   |
| `getCatalogOverview({ signal })` | Count courses, categories, and total study hours |
| `createCourse(form, { signal })` | Validate and save a new course                   |

Requests use Promises, cancellable delays, JSON serialization, and localStorage. Effects abort superseded requests. The API rejects invalid records instead of silently overwriting them.

Storage keys:

| Key                    | Contents                             |
| ---------------------- | ------------------------------------ |
| `studyhub-catalog-v1`  | Seed catalog and newly added courses |
| `studyhub-saved-v1`    | Saved course IDs                     |
| `studyhub-learning-v1` | Per-course lesson progress and notes |

The original catalog and saved-course keys are preserved. Existing valid data remains available **on the same origin in the same browser**. Moving from localhost to GitHub Pages does not transfer browser storage. Private browsing, a different device, or clearing site data creates a separate workspace. A custom-course URL works only where that custom record exists.

## Structure and state

| Location                            | Responsibility                                                       |
| ----------------------------------- | -------------------------------------------------------------------- |
| `src/App.jsx`                       | Compose screens, coordinate notifications and course creation        |
| `src/hooks/useRoute.js`             | Parse/query URL state and browser history                            |
| `src/hooks/useCourses.js`           | Debounce search, request the list, abort stale requests              |
| `src/hooks/useLibrary.js`           | Persist saved IDs, progress, and notes; report storage errors        |
| `src/components/CatalogPage.jsx`    | Catalog screen, overview, layout choice, filters and pagination      |
| `src/components/CourseDetails.jsx`  | Detail request and local learning-notes form                         |
| `src/components/AddCourseModal.jsx` | Local form values, errors, submission, and focus trapping            |
| `src/components/CourseCard.jsx`     | Reusable course preview with stable `course.id` identity             |
| `src/components/CourseArtwork.jsx`  | Consistent category artwork                                          |
| `src/components/`                   | Header, hero, filters, pagination, empty/error states, toast, footer |
| `src/lib/catalog.js`                | Shared constants and form/API validation                             |
| `src/data/courses.json`             | 120 initial records                                                  |
| `tests/api.test.js`                 | Behavior and failure-path regression tests                           |

State is kept close to its use. Form values live in the modal; notes live in the learning panel; layout lives in the catalog. Shared saved/progress state lives in `useLibrary`, called by `App`. The detail component has `key={route.course}`, so changing courses resets local note state deliberately. API responses are rendered through props and stable keys. React owns the DOM; refs are used for accessibility focus only.




