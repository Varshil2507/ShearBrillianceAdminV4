import React, { useEffect, useState, useMemo } from "react";
import { Row, Col } from "reactstrap";
import TableContainer from "Components/Common/TableContainer";
import Loader from "Components/Common/Loader";
import {
  deleteLeave,
  fetchLeaveHistory,
} from "../../../../Services/BarberLeaveHistoryService"; // Update the path to your service file
import {
  formatDate,
  formatHours,
  otherFormatDate,
  formatUTCDate,
} from "Components/Common/DateUtil";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "slices/layouts/toastService";
import DeleteModal from "Components/Common/DeleteModal";

interface LeaveHistory {
  id: number;
  barber_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;

  createdAt: string;
}

interface LeaveHistoryTableProps {
  BarberId: number; // Make sure this prop is passed from the parent
}

const LeaveHistoryTable: React.FC = () => {
  const [leavehistoryData, setLeaveHistoryData] = useState<LeaveHistory[]>([]);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Controls the loading state
  const [selectedStatus, setStatus] = useState<any>("pending");
  const [selectedStartDate, setStartDate] = useState<any>(new Date());
  const [selectedEndDate, setEndDate] = useState<any>(new Date());
  const [selectedSearchText, setSelectedSearch] = useState<null>();
  const [selectedCurrentPage, setCurrentPage] = useState<any | null>(0);
  const [selectedTotalPages, setTotalPages] = useState(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [deleteModal, setDeleteModal] = useState(false); // State for delete modal visibility
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  // const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);

  const limit = 10;
  const fetchLeaveHistoryData = async (
    page: any,
    startDate: any,
    endDate: any,
    status: any,
    search: any,
    showLoading: boolean = true // default = true
  ) => {
    try {
      if (showLoading) setShowLoader(true);
      // setShowLoader(true);
      const response = await fetchLeaveHistory(
        page === 0 ? 1 : page,
        limit,
        otherFormatDate(startDate),
        otherFormatDate(endDate),
        status ? status : "",
        search
      );

      if (response) {
        setLeaveHistoryData(response.leaves || []);
        setTotalPages(response.pagination?.totalPages || 0);
        setTotalItems(response.pagination?.totalItems || 0);
      }

      if (showLoading) setShowLoader(false);
    } catch (error: any) {
      // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        showErrorToast(error.message || "Something went wrong");
      }
      if (showLoading) setShowLoader(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistoryData(
      1,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      ""
    );
  }, []); // Re-fetch when filters or page changes

  // const otherFormatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid

  //   const date = new Date(dateString);
  //   if (isNaN(date.getTime())) return ""; // Return an empty string if date is invalid

  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");

  //   return `${year}-${month}-${day}`;
  // };

  // Helper function to format a date
  // const formatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid
  //   const date = new Date(dateString);
  //   // Get the user's current timezone
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //   const options: Intl.DateTimeFormatOptions = {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric',
  //     timeZone: userTimeZone, // Automatically adapts to the user's location
  //   };

  //   // Get formatted date
  //   const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date); // en-CA ensures YYYY-MM-DD format

  //   // Replace slashes with dashes to ensure YYYY-MM-DD format
  //   return formattedDate.replace(/\//g, '-');
  // };

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "createdAt", // Access the raw date value
        cell: ({ row }: { row: { original: { createdAt: string } } }) => {
          return formatDate(row.original.createdAt); // Format and display the date
        },
        enableColumnFilter: false,
      },

      // {
      //   header: " Leave Date",
      //   accessorKey: "start_date", // Using start_date as the accessor key
      //   enableColumnFilter: false,

      // },

      {
        header: "Available Time",
        accessorKey: "leaves.start_time", // Using start_time as the accessor key
        enableColumnFilter: false,
        cell: ({
          row,
        }: {
          row: { original: { start_time: string; end_time: string } };
        }) => {
          const { start_time, end_time } = row.original;
          return `${start_time ? formatHours(start_time) : "-"} - ${
            end_time ? formatHours(end_time) : ""
          }`;
        },
      },
      {
        header: " Leave Date",
        accessorKey: "start_date", // Using start_date as the accessor key
        enableColumnFilter: false,
        cell: ({
          row,
        }: {
          row: { original: { start_date: string; end_date: string } };
        }) => {
          const { start_date, end_date } = row.original;
          // Check if both dates are the same or if end_date is missing
          if (!end_date || start_date === end_date) {
            return formatUTCDate(start_date); // Show only the start_date
          }

          // Otherwise, show the range
          return `${formatUTCDate(start_date)} To ${formatUTCDate(end_date)}`;
        },
      },
      {
        header: "Leave Reason",
        accessorKey: "reason",
        enableColumnFilter: false,
        cell: ({ getValue }: { getValue: () => string }) => {
          const value = getValue();
          // Remove all non-alphabetic characters and convert to uppercase
          return value.replace(/[^a-zA-Z\s]/g, " ").toUpperCase();
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info: any) => {
          const status = info.row.original.status;
          return status === "pending" ? (
            <span className="badge bg-warning-subtle text-warning text-uppercase">
              Pending
            </span>
          ) : status === "approved" ? (
            <span className="badge bg-success-subtle text-success text-uppercase">
              Approved
            </span>
          ) : status === "denied" ? (
            <span className="badge bg-danger-subtle text-danger text-uppercase">
              Denied
            </span>
          ) : null;
        },
        enableColumnFilter: false,
      },

      {
        header: "Response Reason",
        accessorKey: "response_reason",
        enableColumnFilter: false,
        Cell: ({ cell }: { cell: { getValue: () => string | undefined } }) =>
          cell.getValue() || "--",
      },
      {
        header: "Actions",
        accessorKey: "actions",
        enableColumnFilter: false,
        cell: ({ row }: { row: { original: LeaveHistory } }) => (
          <div>
            <button
              className="btn btn-sm btn-outline-danger"
              disabled={row.original.status === "approved"}
              onClick={() => onClickDelete(row.original)}
            >
              Cancel
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleDeleteLeave = async () => {
    setShowSpinner(true);
    try {
      if (selectedLeave !== null) {
        // ✅ Step 1: Check if leave is approved
        // if (selectedLeave.status === "approved") {
        //   showWarningToast("Approved leave cannot be canceled.");
        //   setShowSpinner(false);
        //   return;
        // }

        // ✅ Step 2: Proceed with cancellation
        await deleteLeave(selectedLeave.id);

        showSuccessToast("Leave cancelled successfully.");
        setDeleteModal(false);
        fetchLeaveHistoryData(
          selectedCurrentPage ? selectedCurrentPage + 1 : 1,
          null,
          null,
          "",
          "",
          false // ⬅️ don't show main loader on cancel
        );
        setSelectedLeave(null);
      }
    } catch (error) {
      showErrorToast("Something went wrong while cancelling leave.");
    } finally {
      setShowSpinner(false);
    }
  };

  const onClickDelete = (leave: any) => {
    setSelectedLeave(leave); // Ensure this is correctly assigning the ID
    setDeleteModal(true);
  };
  const handleCloseModal = () => {
    setDeleteModal(false); // Close the modal
    setSelectedLeave(null); // Clear selected barber ID
    setShowSpinner(false);
  };
  const handleFilterData = async (data: any) => {
    if (data) {
      setStartDate(data.dateRange[0]);
      setEndDate(data.dateRange[1]);
      setStatus(data.status); // Update status in state
    }

    fetchLeaveHistoryData(
      selectedCurrentPage === 0 ? 1 : selectedCurrentPage,
      data?.dateRange[0],
      data?.dateRange[1],
      data?.status === "All" ? "" : data?.status, // Send empty string for "All"
      selectedSearchText ?? "",
      false // ⬅️ don't show main loader on cancel
    );
  };

  const handlePageChange = async (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    await fetchLeaveHistoryData(
      total,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      selectedSearchText ?? "",
      false // ⬅️ don't show main loader on cancel
    ); // Fetch data for the new page
  };

  const handleSearchText = async (search: any) => {
    setSelectedSearch(search);
    setShowLoader(true);

    if (search) {
      fetchLeaveHistoryData(
        1,
        selectedStartDate,
        selectedEndDate,
        selectedStatus,
        search,
        false // ⬅️ don't show main loader on cancel
      );
    }
    // console.error("Error fetching searched leave history:", search);
  };

  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={4}>
          <h5>Barber Leave History</h5>
        </Col>
      </Row>
      {/* <div>Total Records: {leavehistoryData.length}</div> */}

      {showLoader ? (
        <Loader />
      ) : (
        <TableContainer
          columns={columns}
          data={leavehistoryData}
          isGlobalFilter={true}
          totalPages={selectedTotalPages ?? 0}
          totalItems={selectedTotalItems ?? 0}
          customPageSize={limit}
          currentPageIndex={selectedCurrentPage ?? 0}
          selectedDateRange={[
            selectedStartDate ?? new Date(),
            selectedEndDate ?? new Date(),
          ]}
          filterData={handleFilterData}
          searchText={handleSearchText}
          onChangeIndex={handlePageChange}
          selectedStatus={selectedStatus ?? ""}
          // statusOptions={["approved", "pending", "denied"]} // Pass your statuses here
          divClass="table-responsive table-card mb-3"
          tableClass="align-middle table-nowrap mb-0"
          theadClass="table-light text-muted"
          isStatusListFilter={true}
          SearchPlaceholder="Search by Status"
        />
      )}

      <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={handleDeleteLeave}
        onCloseClick={handleCloseModal}
        variant="cancelLeave" // 👈 changes icon and button
        customMessage="Are you sure you want to cancel your leave?"
      />
    </React.Fragment>
  );
};

export default LeaveHistoryTable;
