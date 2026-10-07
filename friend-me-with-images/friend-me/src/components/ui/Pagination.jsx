import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page = 1,
  pages = 1,
  onPageChange
}) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const list = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(pages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="pagination"
      aria-label="Pagination Navigation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginTop: "40px"
      }}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous Page"
        className="btn-outline"
        style={{
          padding: "8px 14px",
          borderRadius: "var(--radius-full)",
          cursor: page <= 1 ? "not-allowed" : "pointer",
          opacity: page <= 1 ? 0.4 : 1
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {pageNumbers.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          style={{
            minWidth: "38px",
            height: "38px",
            borderRadius: "var(--radius-full)",
            border: p === page ? "none" : "1px solid var(--border)",
            background: p === page ? "var(--primary)" : "var(--white)",
            color: p === page ? "var(--white)" : "var(--black)",
            fontWeight: p === page ? 600 : 500,
            fontSize: "var(--font-sm)",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next Page"
        className="btn-outline"
        style={{
          padding: "8px 14px",
          borderRadius: "var(--radius-full)",
          cursor: page >= pages ? "not-allowed" : "pointer",
          opacity: page >= pages ? 0.4 : 1
        }}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
