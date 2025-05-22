import React, { Fragment, useEffect, useState } from "react";
import { CardBody, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import {
  Column,
  Table as ReactTable,
  ColumnFiltersState,
  FilterFn,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import { rankItem } from "@tanstack/match-sorter-utils";

import {
  ProductsGlobalFilter,
  CustomersGlobalFilter,
  OrderGlobalFilter,
  ContactsGlobalFilter,
  CompaniesGlobalFilter,
  LeadsGlobalFilter,
  CryptoOrdersGlobalFilter,
  InvoiceListGlobalSearch,
  TicketsListGlobalFilter,
  NFTRankingGlobalFilter,
  TaskListGlobalFilter,
  TaskStatusGlobalFilter,
  TaskListStatusFilter,
} from "../../Components/Common/GlobalSearchFilter";

// Column Filter
const Filter = ({
  column,
}: {
  column: Column<any, unknown>;
  table: ReactTable<any>;
}) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Search..."
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
};

// Global Filter
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value); // Call only when the value changes
      }
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <input
      {...props}
      value={value}
      id="search-bar-0"
      className="form-control search"
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

interface TableContainerProps {
  columns?: any;
  data?: any;
  isGlobalFilter?: any;
  isProductsFilter?: any;
  isCustomerFilter?: any;
  isOrderFilter?: any;
  isContactsFilter?: any;
  isCompaniesFilter?: any;
  isLeadsFilter?: any;
  isCryptoOrdersFilter?: any;
  isInvoiceListFilter?: any;
  isTicketsListFilter?: any;
  isNFTRankingFilter?: any;
  isTaskListFilter?: any;
  isStatusFilter?: any;
  isStatusListFilter?: any;
  isLeaveFilter?: any;
  handleTaskClick?: any;
  customPageSize?: any;
  selectedDateRange?: any;
  selectedStatus?: any;
  selectedStatuss?: any;
  tableClass?: any;
  theadClass?: any;
  trClass?: any;
  thClass?: any;
  divClass?: any;
  SearchPlaceholder?: any;
  handleLeadClick?: any;
  handleCompanyClick?: any;
  handleContactClick?: any;
  handleTicketClick?: any;
  filterData?: any;
  searchText?: any;
  totalPages?: number; // Add this prop
  totalItems?: number; // Add this prop
  currentPageIndex?: number; // Add this prop
  onChangeIndex?: any;
  appointmentType?: "appointment" | "check_in";
}

const TableContainer = ({
  columns,
  data,
  isGlobalFilter,
  isProductsFilter,
  isCustomerFilter,
  isOrderFilter,
  isContactsFilter,
  isCompaniesFilter,
  isLeadsFilter,
  isCryptoOrdersFilter,
  isInvoiceListFilter,
  isTicketsListFilter,
  isNFTRankingFilter,
  isTaskListFilter,
  isStatusListFilter,
  isStatusFilter,
  isLeaveFilter,
  customPageSize,
  selectedDateRange,
  selectedStatus,
  selectedStatuss,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,
  SearchPlaceholder,
  filterData,
  searchText,
  totalPages,
  totalItems,
  currentPageIndex,
  onChangeIndex,
  appointmentType,
}: TableContainerProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCurrentPageIndex, setCurrentPageIndex] = useState(0);

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageOptions,
    setPageIndex,
    nextPage,
    previousPage,
    setPageSize,
    getState,
  } = table;

  const authTUser = localStorage.getItem("authUser");
  let storeUserInfo: any;
  if (authTUser) {
    storeUserInfo = JSON.parse(authTUser);
  }
  useEffect(() => {
    Number(customPageSize) && setPageSize(Number(customPageSize));
  }, [customPageSize, setPageSize]);

  const [filters, setFilters] = useState<{
    dateRange: Date[] | null;
    status: string;
  }>({
    dateRange: null,
    status: "all",
  });

  // Callback to handle filter submission
  const handleFilterSubmit = (selectedFilters: {
    dateRange: Date[] | null;
    status: string;
  }) => {
    setFilters(selectedFilters);
    filterData(selectedFilters);
  };

  // Handler to receive the updated global filter value
  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value); // Update local state
    searchText(value);
  };

  const setPageIndexData = (item: any) => {
    // Prevent redundant updates if the page index is the same
    // if (selectedCurrentPageIndex === item) return;
    setPageIndex(item);
    setCurrentPageIndex(item);
    onChangeIndex(item);
  };

  const setPageNextData = () => {
    const nextIndex = (currentPageIndex ?? 0) + 1;
    // Prevent redundant updates if already on the last page
    if (
      selectedCurrentPageIndex === nextIndex ||
      nextIndex >= (totalPages ?? 0)
    )
      return;

    nextPage(); // Move to the next page in the table
    setCurrentPageIndex(nextIndex); // Update local state
    onChangeIndex(nextIndex); // Inform parent about the change
  };

  const setPagePreviousData = () => {
    const prevIndex = (currentPageIndex ?? 0) - 1;

    // Prevent redundant updates if already on the first page
    // if (selectedCurrentPageIndex === prevIndex || prevIndex < 0) return;

    previousPage(); // Move to the previous page in the table
    setCurrentPageIndex(prevIndex); // Update local state
    onChangeIndex(prevIndex); // Inform parent about the change
  };

  return (
    <Fragment>
      {isGlobalFilter && (
        <Row className="mb-3">
          <CardBody className="border border-dashed border-end-0 border-start-0">
            <form>
              <Row>
                {!storeUserInfo.berber && !isLeaveFilter && (
                  <Col sm={5}>
                    <div
                      className={
                        isProductsFilter ||
                        isContactsFilter ||
                        isCompaniesFilter ||
                        isNFTRankingFilter
                          ? "search-box me-2 mb-2 d-inline-block"
                          : "search-box me-2 mb-2 d-inline-block col-12"
                      }
                    >
                      <DebouncedInput
                        value={globalFilter ?? ""}
                        onChange={(value) =>
                          handleGlobalFilterChange(String(value))
                        }
                        placeholder={SearchPlaceholder}
                      />
                      <i className="bx bx-search-alt search-icon"></i>
                    </div>
                  </Col>
                )}
                {isProductsFilter && <ProductsGlobalFilter />}
                {isCustomerFilter && <CustomersGlobalFilter />}
                {isOrderFilter && <OrderGlobalFilter />}
                {isContactsFilter && <ContactsGlobalFilter />}
                {isCompaniesFilter && <CompaniesGlobalFilter />}
                {isLeadsFilter && <LeadsGlobalFilter />}
                {isCryptoOrdersFilter && <CryptoOrdersGlobalFilter />}
                {isInvoiceListFilter && <InvoiceListGlobalSearch />}
                {isTicketsListFilter && <TicketsListGlobalFilter />}
                {isNFTRankingFilter && <NFTRankingGlobalFilter />}
                {isStatusListFilter && (
                  <TaskStatusGlobalFilter
                    onFilterSubmit={handleFilterSubmit}
                    initialDateRange={selectedDateRange} // Pre-selected range
                    initialStatus={selectedStatus}
                     // Pre-selected status
                  />
                )}

                {isStatusFilter && (
                  <TaskListStatusFilter
                    onFilterSubmit={handleFilterSubmit}
                    initialStatus={selectedStatus}
                    appointmentType={appointmentType || "check_in"} // FIX: Use prop, not undefined variable
                  />
                )}

                {isTaskListFilter && (
                  <TaskListGlobalFilter
                    onFilterSubmit={handleFilterSubmit}
                    initialDateRange={selectedDateRange} // Pre-selected range
                    initialStatus={selectedStatus}

                    // Pre-selected status
                  />
                )}
              </Row>
            </form>
          </CardBody>
        </Row>
      )}

      <div className={divClass}>
        <Table hover className={tableClass}>
          <thead className={theadClass}>
            {getHeaderGroups().map((headerGroup: any) => (
              <tr className={trClass} key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th
                    key={header.id}
                    className={thClass}
                    {...{
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <React.Fragment>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ",
                          desc: " ",
                        }[header.column.getIsSorted() as string] ?? null}
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} table={table} />
                          </div>
                        ) : null}
                      </React.Fragment>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {getRowModel().rows?.length > 0 ? (
              getRowModel().rows.map((row: any) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={getHeaderGroups()[0]?.headers?.length || 1}
                  className="text-center py-3"
                >
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Row className="align-items-center mt-2 g-3 text-center text-sm-start">
        <div className="col-sm">
          <div className="text-muted">
            Showing<span className="fw-semibold ms-1">{data?.length ?? 0}</span>{" "}
            of <span className="fw-semibold">{totalItems ?? 0}</span> Results
          </div>
          {/* <div className="text-muted">Showing<span className="fw-semibold ms-1">{getState().pagination.pageSize}</span> of <span className="fw-semibold">{data.length}</span> Results
          </div> */}
        </div>
        <div className="col-sm-auto">
          <ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start flex-wrap mb-0">
            {/* Previous Button */}
            <li
              className={
                (currentPageIndex ?? 0) === 0
                  ? "page-item disabled"
                  : "page-item"
              }
            >
              <Link
                to="#"
                className="page-link"
                onClick={() => setPagePreviousData()}
              >
                Previous
              </Link>
            </li>

            {/* Dynamically Render Page Numbers */}
            {Array.from(
              { length: totalPages ?? table.getPageCount() },
              (_, index) => {
                const total = totalPages ?? table.getPageCount(); // Safely handle undefined
                const current = currentPageIndex ?? 0; // Default currentPageIndex to 0

                const shouldRender =
                  index === 0 || // First page
                  index === total - 1 || // Last page
                  index === current || // Current page
                  index === current - 1 || // One page before current
                  index === current + 1; // One page after current

                const isEllipsis =
                  (index === current - 2 && current > 2) || // Ellipsis before current page
                  (index === current + 2 && current < total - 3); // Ellipsis after current page

                if (isEllipsis) {
                  return (
                    <li key={index} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }

                if (shouldRender) {
                  return (
                    <li key={index} className="page-item">
                      <Link
                        to="#"
                        className={
                          current === index ? "page-link active" : "page-link"
                        }
                        onClick={() => setPageIndexData(index)}
                      >
                        {index + 1}
                      </Link>
                    </li>
                  );
                }

                return null;
              }
            )}

            {/* Next Button */}
            <li
              className={
                data?.length === totalItems ? "page-item disabled" : "page-item"
              }
            >
              <Link
                to="#"
                className="page-link"
                onClick={() => setPageNextData()}
              >
                Next
              </Link>
            </li>
          </ul>
        </div>
      </Row>
    </Fragment>
  );
};

export default TableContainer;
