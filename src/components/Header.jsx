import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Compass,
  GraduationCap,
  Plus,
  Sparkles,
} from "lucide-react";
import { DEFAULT_FILTERS, routeHref } from "../hooks/useRoute.js";
const NAV = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "learning", label: "My learning", icon: GraduationCap },
  { id: "saved", label: "Saved courses", icon: Bookmark },
];
export default function Header({
  route,
  savedCount,
  learningCount,
  onNavigate,
  onAdd,
}) {
  function follow(event, view) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onNavigate(view);
  }
  return (
    <>
      <aside className="sidebar">
        <a
          className="brand"
          href={routeHref({ ...DEFAULT_FILTERS, view: "discover" })}
          onClick={(event) => follow(event, "discover")}
          aria-label="StudyHub home"
        >
          <span className="brand-mark">
            <BookOpen size={24} />
          </span>
          <span>
            studyhub<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="sidebar-label">YOUR WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {NAV.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={routeHref({ ...DEFAULT_FILTERS, view: id })}
              onClick={(event) => follow(event, id)}
              className={`nav-link ${route.view === id ? "active" : ""}`}
              aria-current={route.view === id ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              {id !== "discover" && (
                <span className="nav-count">
                  {id === "saved" ? savedCount : learningCount}
                </span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-card">
            <span className="focus-spark">
              <Sparkles size={23} />
            </span>
            <h3>
              A little time.
              <br />A lot of possibility.
            </h3>
            <p>Make room for a new skill with a course under 6 hours.</p>
            <button
              onClick={() => onNavigate("discover", { duration: "short" })}
              type="button"
            >
              Find a short course <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="workspace-label">
            <span className="workspace-avatar">
              <GraduationCap size={19} />
            </span>
            <span>
              <strong>Personal workspace</strong>
              <small>Your own pace, your own path</small>
            </span>
          </div>
        </div>
      </aside>
      <header className="topbar">
        <div className="breadcrumb">
          Workspace <span>/</span>{" "}
          <strong>
            {route.course
              ? "Course details"
              : NAV.find((item) => item.id === route.view).label}
          </strong>
        </div>
        <div className="topbar-actions">
          <span className="topbar-note">
            <span /> Keep your curiosity growing
          </span>
          <button
            className="button button-primary"
            type="button"
            onClick={onAdd}
          >
            <Plus size={17} /> Add course
          </button>
        </div>
      </header>
    </>
  );
}
