import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={clsx('font-plex flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'p-2 rounded-full transition-colors',
          currentPage === 1
            ? 'text-stone-400 dark:text-stone-500 cursor-not-allowed'
            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={clsx(
              'w-8 h-8 rounded-full text-xs font-medium transition-colors',
              1 === currentPage
                ? 'bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              )}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="text-stone-400 dark:text-stone-500 px-1">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            'w-8 h-8 rounded-full text-xs font-medium transition-colors',
            page === currentPage
              ? 'bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 shadow'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          )}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-stone-400 dark:text-stone-500 px-1">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={clsx(
              'w-8 h-8 rounded-full text-xs font-medium transition-colors',
              totalPages === currentPage
              ? 'bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 shadow'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
             )}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'p-2 rounded-full transition-colors',
          currentPage === totalPages
            ? 'text-stone-400 dark:text-stone-500 cursor-not-allowed'
            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
