import classNames from "classnames";
import { Button } from "components/Button/Button";

interface PaginationProps {
  onBack: () => void;
  onNext: () => void;
  setPage: (index: number) => void;
  backLabel: string;
  nextLabel: string;
  backDisabled: boolean;
  nextDisabled: boolean;
  pageCount: number;
  currentPageindex: number;
  id?: string;
}

const Pagination = ({
  backDisabled,
  nextDisabled,
  onBack,
  onNext,
  backLabel,
  nextLabel,
  setPage,
  pageCount,
  currentPageindex,
  id,
}: PaginationProps) => {
  const pages = [];
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    pages.push(pageIndex);
  }
  const visiblePages = pages.slice(currentPageindex, 4);

  return (
    <nav aria-label="Page navigation example" className="py-1">
      <ul className="inline-flex gap-x-5 items-center -space-x-px">
        <Button
          id={!id ? undefined : `${id}-backPageButton`}
          disabled={backDisabled}
          variant="Transparent"
          size="xs"
          onClick={onBack}
          className={classNames(
            "block py-2 px-3 ml-0 leading-tight text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-l-lg border border-gray-300 dark:border-gray-700",
            { "opacity-50 pointer-events-none": backDisabled }
          )}
        >
          <span
            className="sr-only"
            id={!id ? undefined : `${id}-backPageButtonLabel`}
          >
            {backLabel}
          </span>
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </Button>

        {false &&
          visiblePages.map((pageIndex) => {
            return (
              <li
                key={pageIndex}
                className={classNames(
                  "py-2 px-3 leading-tight text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700",
                  { "bg-gray-100": pageIndex === currentPageindex }
                )}
              >
                {pageIndex}
              </li>
            );
          })}
        <Button
          id={!id ? undefined : `${id}-nextPageButton`}
          disabled={nextDisabled}
          variant="Transparent"
          size="xs"
          onClick={onNext}
          className={classNames(
            "block py-2 px-3 ml-0 leading-tight text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-l-lg border border-gray-300 dark:border-gray-700",
            { "opacity-50 pointer-events-none": nextDisabled }
          )}
        >
          <span
            className="sr-only"
            id={!id ? undefined : `${id}-nextPageButtonLabel`}
          >
            {nextLabel}
          </span>
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </Button>
      </ul>
    </nav>
  );
};
export default Pagination;
