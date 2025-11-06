import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const buildPages = (current: number, total: number): (number | string)[] => {
  const pages: (number | string)[] = [];
  const maxButtons = 5;

  if (total <= maxButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("left-ellipsis");

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total - 1) pages.push("right-ellipsis");

  pages.push(total);
  return pages;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
      >
        Anterior
      </button>

      <div className="flex items-center gap-2">
        {pages.map((p, idx) => {
          if (typeof p === "string") return (
            <span key={`${p}-${idx}`} className="px-2">...</span>
          );

          const isActive = p === currentPage;

          return (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium ${
                isActive ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-400 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;