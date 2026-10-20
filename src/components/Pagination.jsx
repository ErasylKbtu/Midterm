import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const visible = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1,
  );
  const pages = [];
  visible.forEach((n, i) => {
    if (i > 0 && n - visible[i - 1] > 1) pages.push(`gap-${n}`);
    pages.push(n);
  });
  return (
    <nav className="pagination" aria-label="Course pages">
      <button
        className="page-action"
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ArrowLeft size={17} /> <span>Previous</span>
      </button>
      <div className="page-numbers">
        {pages.map((n) =>
          typeof n === "string" ? (
            <span className="page-ellipsis" key={n}>
              ···
            </span>
          ) : (
            <button
              type="button"
              key={n}
              className={`page-number ${n === currentPage ? "current" : ""}`}
              onClick={() => onPageChange(n)}
              aria-current={n === currentPage ? "page" : undefined}
            >
              {n}
            </button>
          ),
        )}
      </div>
      <button
        className="page-action"
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <span>Next</span> <ArrowRight size={17} />
      </button>
    </nav>
  );
}
