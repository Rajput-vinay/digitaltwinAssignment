interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: Props) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Show first, last, and a window of 1 page around the current one, with "…" gaps
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <nav className="pager" aria-label="Pagination">
      <span className="muted small">
        Showing {from}–{to} of {total}
      </span>
      <div className="row">
        <button
          className="btn ghost"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap${i}`} className="muted">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`btn ${p === page ? "" : "ghost"}`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="btn ghost"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
