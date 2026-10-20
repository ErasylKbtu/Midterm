import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import useRoute, { DEFAULT_FILTERS } from "./hooks/useRoute.js";
import useLibrary from "./hooks/useLibrary.js";
import Header from "./components/Header.jsx";
import CatalogPage from "./components/CatalogPage.jsx";
import CourseDetails from "./components/CourseDetails.jsx";
import AddCourseModal from "./components/AddCourseModal.jsx";
import Toast from "./components/Toast.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const { route, navigate, backToCatalog } = useRoute();
  const library = useLibrary();
  const [showForm, setShowForm] = useState(false);
  const addTrigger = useRef(null);
  function openForm(event) {
    addTrigger.current = event.currentTarget;
    setShowForm(true);
  }
  useEffect(() => {
    if (!showForm) addTrigger.current?.focus();
  }, [showForm]);
  const [revision, setRevision] = useState(0);
  const [toast, setToast] = useState(null);
  function notify(message, type = "success") {
    setToast({ message, type, id: Date.now() });
  }
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  function changeView(view, extra = {}) {
    navigate(
      { ...DEFAULT_FILTERS, view, course: null, ...extra },
      { scroll: true },
    );
  }
  function toggleSaved(id) {
    try {
      notify(
        library.toggleSaved(id)
          ? "Course added to your saved collection."
          : "Course removed from saved.",
      );
    } catch (error) {
      notify(error.message, "error");
    }
  }
  function created(course) {
    setShowForm(false);
    setRevision((value) => value + 1);
    changeView("discover", { sort: "newest" });
    notify(`“${course.title}” added to your catalog.`);
  }
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="workspace" inert={showForm}>
        <Header
          route={route}
          savedCount={library.savedIds.length}
          learningCount={Object.keys(library.learning).length}
          onNavigate={changeView}
          onAdd={openForm}
        />
        <main id="main-content" className="page-content" tabIndex={-1}>
          {library.error && (
            <div className="storage-alert" role="alert">
              <AlertCircle size={18} />
              {library.error}
            </div>
          )}
          {route.course ? (
            <CourseDetails
              key={route.course}
              id={route.course}
              entry={library.learning[route.course]}
              isSaved={library.savedIds.includes(route.course)}
              onBack={backToCatalog}
              onToggleSave={toggleSaved}
              onUpdate={library.updateProgress}
              notify={notify}
            />
          ) : (
            <CatalogPage
              route={route}
              navigate={navigate}
              library={library}
              revision={revision}
              onToggleSave={toggleSaved}
              onDiscover={() => changeView("discover")}
              onAdd={openForm}
            />
          )}
        </main>
        <Footer />
      </div>
      {showForm && (
        <AddCourseModal
          onClose={() => setShowForm(false)}
          onCreated={created}
        />
      )}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
