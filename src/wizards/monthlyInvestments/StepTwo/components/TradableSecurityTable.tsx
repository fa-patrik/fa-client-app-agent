import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { TimePeriod } from "api/performance/types";
import { useGetPerformanceBySecurityLazy } from "api/performance/useGetPerformanceGroupedBySecurity";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { ReactComponent as SortIcon } from "assets/sort.svg";
import { ReactComponent as SortAscIcon } from "assets/sortAsc.svg";
import { ReactComponent as SortDescIcon } from "assets/sortDesc.svg";
import classNames from "classnames";
import {
  Button,
  DownloadableDocument,
  Input,
  LoadingIndicator,
} from "components";
import Pagination from "components/Pagination/Pagination";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { Link, useLocation } from "react-router-dom";
import SecurityInfoCell from "./SecurityInfoCell";

interface Row {
  selected: boolean;
  data: TradableSecurity;
}

interface TradableSecuritiesTableProps {
  data: TradableSecurity[];
  /**
   * Use to set selected securities in the parent component.
   */
  onRowSelect?: Dispatch<SetStateAction<TradableSecurity[]>>;
  /**
   * These securities should be selected when the table renders initially.
   */
  preSelectedRows?: TradableSecurity[];
}

enum ColumnSortedState {
  ASC = "asc",
  DESC = "desc",
  RESET = "reset",
}

const getNextSortingState = (currentState: ColumnSortedState) => {
  return currentState === ColumnSortedState.ASC
    ? ColumnSortedState.DESC
    : currentState === ColumnSortedState.DESC
    ? ColumnSortedState.RESET
    : ColumnSortedState.ASC;
};

const DEFAULT_PAGE_SIZE = 6; //nr of rows per page
const DEFAULT_PAGE_INDEX = 1; //initial page nr

const TradableSecurityTable = ({
  data: securities,
  onRowSelect,
  preSelectedRows,
}: TradableSecuritiesTableProps) => {
  const [columnSortedState, setColumnSortedState] = useState<
    Record<string, string>
  >({});
  const location = useLocation();
  const { t, i18n } = useModifiedTranslation();
  const [sortedRows, setSortedRows] = useState<TradableSecurity[]>(securities);

  const getPathToHolding = (holdingId: number) => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/");
    // Replace the last part of the path with the path to the holding
    pathParts[pathParts.length - 1] = `holdings/${holdingId}`;
    const pathToHoldings = pathParts.join("/");
    return pathToHoldings;
  };

  const [selectedRows, setSelectedRows] = useState<
    Record<TradableSecurity["id"], Row>
  >(() => {
    if (preSelectedRows?.length) {
      const preselected = preSelectedRows?.reduce((prev, curr) => {
        prev[curr.id] = {
          selected: true,
          data: curr,
        };
        return prev;
      }, {} as Record<TradableSecurity["id"], Row>);
      return preselected;
    } else {
      const newState = securities?.reduce((prev, curr) => {
        prev[curr.id] = {
          selected: false,
          data: curr,
        };
        return prev;
      }, {} as Record<TradableSecurity["id"], Row>);
      if (newState) return newState;
    }
    return {};
  });

  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);

  //total nr of pages, given the amount of rows
  const pageCount = Math.ceil(securities.length / DEFAULT_PAGE_SIZE);

  const onPageBack = () => {
    setPageIndex((prev) => (prev > 1 ? prev - 1 : DEFAULT_PAGE_INDEX));
  };
  const onPageNext = () => {
    setPageIndex((prev) => (prev < pageCount ? prev + 1 : pageCount));
  };

  const sortSelected = (
    mode: string,
    columnId: string,
    securities: TradableSecurity[],
    selectedRows: Record<TradableSecurity["id"], Row>
  ) => {
    const newRows = [...securities];
    if (mode === ColumnSortedState.RESET) {
      setSortedRows(() => newRows);
    } else {
      setSortedRows(() =>
        newRows.sort((a, b) => {
          const aValue = selectedRows[a.id]?.selected ? 1 : 0;
          const bValue = selectedRows[b.id]?.selected ? 1 : 0;

          if (mode === ColumnSortedState.ASC) {
            // ascending
            return bValue - aValue;
          } else {
            // descending
            return aValue - bValue;
          }
        })
      );
    }
    setColumnSortedState(() => ({
      [columnId]: mode,
    }));
    setPageIndex(DEFAULT_PAGE_INDEX);
  };

  const sortString = (
    mode: string,
    columnId: string,
    accessorKey: string,
    securities: TradableSecurity[]
  ) => {
    const newRows = [...securities];
    if (mode === ColumnSortedState.RESET) {
      setSortedRows(() => newRows);
    } else {
      setSortedRows(() =>
        newRows.sort((a, b) =>
          mode === ColumnSortedState.ASC
            ? a[accessorKey].localeCompare(b[accessorKey])
            : b[accessorKey].localeCompare(a[accessorKey])
        )
      );
    }
    setColumnSortedState(() => ({
      [columnId]: mode,
    }));
    setPageIndex(DEFAULT_PAGE_INDEX);
  };

  const sortNumber = (
    mode: string,
    columnId: string,
    accessorKey: string,
    securities: TradableSecurity[]
  ) => {
    const newRows = [...securities];
    if (mode === ColumnSortedState.RESET) {
      setSortedRows(() => newRows);
    } else {
      setSortedRows(() =>
        newRows.sort((a, b) =>
          mode === ColumnSortedState.ASC
            ? a[accessorKey] - b[accessorKey]
            : b[accessorKey] - a[accessorKey]
        )
      );
    }
    setColumnSortedState(() => ({
      [columnId]: mode,
    }));
    setPageIndex(DEFAULT_PAGE_INDEX);
  };

  const columns = useMemo(
    () => [
      {
        id: "selected",
        enableSorting: true,
        align: "center", //this aligns the header, not the data
        name: "",
        sortFn: (columnSortedState: Record<string, string>) => {
          const currenColumnSortedState = columnSortedState[
            "selected"
          ] as ColumnSortedState;
          const nextSortingState = getNextSortingState(currenColumnSortedState);
          sortSelected(nextSortingState, "selected", securities, selectedRows);
        },
      },
      {
        id: "security",
        enableSorting: true,
        align: "left",
        name: t("component.tradableSecuritiesTable.securityColumnHeader"),
        sortFn: (columnSortedState: Record<string, string>) => {
          const currenColumnSortedState = columnSortedState[
            "security"
          ] as ColumnSortedState;
          const nextSortingState = getNextSortingState(currenColumnSortedState);
          sortString(nextSortingState, "security", "name", securities);
        },
      },
      {
        id: "performance1year",
        enableSorting: false,
        align: "right",
        name: t("component.tradableSecuritiesTable.1yrTwrColumnHeader"),
        sortFn: undefined,
      },
      {
        id: "managementFee",
        name: t("component.tradableSecuritiesTable.feeColumnHeader"),
        align: "right",
        enableSorting: true,
        sortFn: (columnSortedState: Record<string, string>) => {
          const currenColumnSortedState = columnSortedState[
            "managementFee"
          ] as ColumnSortedState;
          const nextSortingState = getNextSortingState(currenColumnSortedState);
          sortNumber(
            nextSortingState,
            "managementFee",
            "managementFee",
            securities
          );
        },
      },
      {
        id: "minTradeAmount",
        name: t("component.tradableSecuritiesTable.minTradeAmountColumnHeader"),
        align: "right",
        enableSorting: true,
        sortFn: (columnSortedState: Record<string, string>) => {
          const currenColumnSortedState = columnSortedState[
            "minTradeAmount"
          ] as ColumnSortedState;
          const nextSortingState = getNextSortingState(currenColumnSortedState);
          sortNumber(
            nextSortingState,
            "minTradeAmount",
            "minTradeAmount",
            securities
          );
        },
      },
      {
        id: "KIID",
        name: t("component.tradableSecuritiesTable.securityUrl1ColumnHeader"),
        align: "center",
        enableSorting: false,
        sortFn: undefined,
      },
      {
        id: "Details",
        name: t("component.tradableSecuritiesTable.detailsHeader"),
        align: "center",
        enableSorting: false,
        sortFn: undefined,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [securities, selectedRows]
  );

  const isMd = useMatchesBreakpoint("md");
  const isLg = useMatchesBreakpoint("lg");
  const isXl = useMatchesBreakpoint("xl");
  const isLargeScreen = isMd || isLg || isXl;
  const nrOfColumnsIfSmallScreen = 4;
  const columnsAdjustedByViewPort = isLargeScreen
    ? columns
    : columns.slice(0, nrOfColumnsIfSmallScreen);

  /**
   * If the raw table data changes
   * reset sorting and set page to default first page.
   */
  useEffect(() => {
    setColumnSortedState(() => ({}));
    setSortedRows(() => securities);
    setPageIndex(DEFAULT_PAGE_INDEX); //reset page
  }, [securities]);

  //update selected rows/securities in parent component
  useEffect(() => {
    if (onRowSelect) {
      onRowSelect(() =>
        Object.entries(selectedRows).reduce((prev, curr) => {
          const [, value] = curr;
          if (value.selected) prev.push(value.data);
          return prev;
        }, [] as TradableSecurity[])
      );
    }
  }, [selectedRows, onRowSelect]);

  //sort selected column by default
  useEffect(() => {
    const sortBySelected = columns[0]?.sortFn;
    if (sortBySelected) sortBySelected({});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //rows of the currently selected page
  const rowsToDisplay = useMemo(
    () =>
      sortedRows?.slice(
        (pageIndex - 1) * DEFAULT_PAGE_SIZE, //pagination logic
        pageIndex * DEFAULT_PAGE_SIZE
      ),
    [pageIndex, sortedRows]
  );

  const {
    getPerformanceBySecurity,
    data: performanceData,
    loading: performanceLoading,
  } = useGetPerformanceBySecurityLazy();

  //fetch performance (TWR) figures for the securities
  //on the current page of the table
  useEffect(() => {
    const fetch = async () => {
      const ids = rowsToDisplay.map((s) => s.id);
      const timePeriods = [TimePeriod["YEARS-1"]];
      await getPerformanceBySecurity({
        variables: {
          securityIds: ids,
          timePeriodCodes: timePeriods,
        },
      });
    };
    fetch();
  }, [rowsToDisplay, getPerformanceBySecurity]);
  return (
    <table className="min-w-full h-full text-sm text-gray-500 rounded-lg border-collapse table-auto select-none">
      <thead className="sticky top-0 z-10 text-xs text-gray-700 bg-gray-100 rounded-t-lg">
        <tr>
          {useMemo(
            () =>
              columnsAdjustedByViewPort.map((column) => (
                <th
                  onClick={
                    column.enableSorting && column.sortFn
                      ? () => column.sortFn(columnSortedState)
                      : undefined
                  }
                  key={column.id}
                  className={classNames(
                    "py-3 px-2 truncate whitespace-nowrap select-none border-gray-200",
                    {
                      "cursor-pointer": column.enableSorting && column.sortFn,
                    }
                  )}
                >
                  <div
                    className={classNames("flex gap-x-1", {
                      "justify-start": column.align === "left",
                      "justify-end": column.align === "right",
                      "justify-center": column.align === "center",
                    })}
                  >
                    {column.name}
                    {column.enableSorting &&
                      (columnSortedState[column.id] ===
                      ColumnSortedState.ASC ? (
                        <SortAscIcon />
                      ) : columnSortedState[column.id] ===
                        ColumnSortedState.DESC ? (
                        <SortDescIcon />
                      ) : (
                        <SortIcon />
                      ))}
                  </div>
                </th>
              )),

            [columnsAdjustedByViewPort, columnSortedState]
          )}
        </tr>
      </thead>
      <tbody>
        {rowsToDisplay?.map((security) => {
          const performanceOneYear =
            performanceData?.[security.securityCode]?.[TimePeriod["YEARS-1"]] ||
            0;
          return (
            <tr
              onClick={() =>
                setSelectedRows((prevSelected) => {
                  return {
                    ...prevSelected,
                    [security.id]: {
                      selected: !prevSelected[security.id]?.selected,
                      data:
                        prevSelected[security.id]?.data ||
                        securities.find((sec) => sec.id === security.id),
                    },
                  };
                })
              }
              key={security.id}
              className="border-b hover:cursor-pointer"
            >
              <td className="p-1">
                <div className="flex justify-center items-center">
                  <Input
                    label=""
                    type="checkbox"
                    readOnly
                    checked={selectedRows[security.id]?.selected ? true : false}
                  />
                </div>
              </td>
              <td className="p-1">
                {/** Security data */}
                <SecurityInfoCell
                  securityId={security.id}
                  countryCode={security.country?.code}
                  name={security.name}
                  typeName={
                    security.type?.namesAsMap?.[i18n.language] ??
                    security.type.name
                  }
                  isinCode={security.isinCode}
                />
              </td>
              <td className="p-1">
                {/** Security fee */}
                <div className="flex justify-end">
                  {performanceLoading ? (
                    <LoadingIndicator size="xs" />
                  ) : (
                    <span
                      className={classNames({
                        "text-red-500": performanceOneYear < 0,
                        "text-green-400": performanceOneYear > 0,
                      })}
                    >
                      {performanceOneYear.toLocaleString(i18n.language, {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-1">
                {/** Security value change */}
                <div className="flex justify-end">
                  <span
                    className={classNames({
                      "text-red-500": security.managementFee < 0,
                      "text-green-400": security.managementFee > 0,
                    })}
                  >
                    {security.managementFee.toLocaleString(i18n.language, {
                      style: "percent",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </td>

              {/**Extra data to render on big screens */}
              {isLargeScreen && (
                <>
                  <td className="p-1">
                    {/** Security min trade amount */}
                    <div className="flex justify-end">
                      <span>
                        {security.minTradeAmount.toLocaleString(i18n.language, {
                          style: "currency",
                          currency: security.currency.securityCode,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="p-1">
                    {/** Security URL 1 aka. KIID */}
                    <div
                      className="flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DownloadableDocument label="" url={security.url} />
                    </div>
                  </td>
                  <td className="p-1">
                    {/** Security Details button (navigate to holdings/id)*/}
                    <div
                      className="flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        id={`seurityInfoCell-link-${security.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-bold text-primary-500 underline"
                        to={getPathToHolding(security.id)}
                      >
                        <Button size="xs" variant="Secondary">
                          {t(
                            "component.tradableSecuritiesTable.detailsButtonLabel"
                          )}
                        </Button>
                      </Link>
                    </div>
                  </td>
                </>
              )}
            </tr>
          );
        })}
        {/**  Fill the table with empty rows until page size is met
         *    Otherwise the table will not size rows properly
         */}
        {rowsToDisplay.length + 1 < DEFAULT_PAGE_SIZE
          ? [...Array(DEFAULT_PAGE_SIZE - rowsToDisplay.length)]
              .map(() => 0)
              .map((val, index1) => {
                return (
                  <tr key={index1}>
                    {columnsAdjustedByViewPort.map((val, index2) => {
                      return (
                        <td key={`${index1}-${index2}`} className="h-full"></td>
                      );
                    })}
                  </tr>
                );
              })
          : null}
      </tbody>
      <tfoot className="sticky bottom-0 bg-white rounded-b-lg">
        <tr>
          <td colSpan={1000}>
            <div className="flex justify-between items-center px-2 bg-white">
              <Button
                disabled={!Object.values(selectedRows).some((v) => v.selected)}
                size="xs"
                onClick={() =>
                  setSelectedRows(() => {
                    return securities?.reduce((prev, curr) => {
                      prev[curr.id] = {
                        selected: false,
                        data: curr,
                      };
                      return prev;
                    }, {} as Record<TradableSecurity["id"], Row>);
                  })
                }
              >
                {t("component.tradableSecuritiesTable.deselectAllButtonLabel")}
              </Button>
              <Pagination
                currentPageindex={pageIndex}
                pageCount={pageCount}
                setPage={setPageIndex}
                backLabel=""
                nextLabel=""
                onBack={onPageBack}
                backDisabled={pageIndex === 1}
                onNext={onPageNext}
                nextDisabled={pageIndex === pageCount}
              />
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default TradableSecurityTable;
