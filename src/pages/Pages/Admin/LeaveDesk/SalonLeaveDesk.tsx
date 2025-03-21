import React, { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Table,
  Label,
  Spinner,
} from "reactstrap";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import TableContainer from "Components/Common/TableContainer";
import AppointmentConfirmationModal from "Components/Common/AppointmentStatusChange";
import axios from "axios";
import Loader from "Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchRequestedLeaves } from "../../../../Services/SalonLeaveSetvice"; // Adjust the path as necessary
import { updateLeaveStatus } from "../../../../Services/LeaveStatusService"; // Import your API function
import { cancelAppointment } from "Services/AppointmentService";
import { fetchAvailableBarber, saveTransferAppointments } from "Services/barberService";

interface RequestedLeave {
  id: number;
  barber_name: string;
  date: string[]; // Multiple dates for leave
  createdAt: any;
  selectedLeaveDate: string;
  start_time: string;
  end_time: string;
  barber: Barber;
  reason: string;
  status: string;
}

interface Barber {
  name: string;
  salon: {
    name: string;
  };
  appointments: any;
}
export const REQUESTED_LEAVES_ENDPOINT = "/barber-leave/all";

const RequestedLeavesTable: React.FC = () => {
  const [leaveData, setLeaveData] = useState<RequestedLeave[]>([]);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<RequestedLeave | null>(null);
  const [selectedBarberAppointment, setSelectedBarberAppointment] = useState<any>(null);
  const [denyReason, setDenyReason] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTransfer, setModalTransfer] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Controls the loading state
  const [selectedStartDate, setStartDate] = useState<any>(new Date());
  const [selectedEndDate, setEndDate] = useState<any>(new Date());
  const [selectedSearchText, selectedSearch] = useState<null>();
  const [selectedStatus, setStatus] = useState<any>("pending");
  const [selectedUpdatedStatus, setUpdatedStatus] = useState<any>("pending");
  const [appointmentId, setAppointmentId] = useState<any>();
  const [availableAppointmentBabrers, setAvailableAppointmentBabrers] = useState<any>();
  const [selectedAvailableBabrer, setSelectedAvailableBabrer] = useState<any>();
  const [selectedCurrentPage, setCurrentPage] = useState<any | null>(0);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const limit = 10;

  // const [leaveStatus, setLeaveStatus] = useState<string>("approved");

  const fetchrequestedLeaveData = async (
    page: any,
    start_date: any,
    end_Date: any,
    status: any,
    search: any
  ) => {
    try {
      const response: any = await fetchRequestedLeaves(
        page === 0 ? 1 : page,
        limit,
        otherFormatDate(start_date),
        otherFormatDate(end_Date),
        status ? status : "",
        search
      );

      setTotalItems(response?.pagination?.totalItems); // Set total items count
      setTotalPages(response?.pagination?.totalPages); // Set total pages from response
      setLeaveData(response?.leaves); // Set fetched leaves data
      if (leaveData?.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 500); // Hide loader after 5 seconds
        return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
      } else {
        setShowLoader(false); // Immediately hide loader if data is available
      }
    } catch (error: any) {
      // Error handling
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message;
        toast.error(apiMessage || "An error occurred");
      } else {
        toast.error(error.message || "Something went wrong");
      }
      setShowLoader(false);
    }
  };


  useEffect(() => {
    fetchrequestedLeaveData(
      1,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      " ",
    ); // Trigger fetch with current page
  }, []); // Dependencies trigger re-fetch

  const handleDetailsClick = (leave: any) => {
    const { start_date, end_date } = leave;

    // Check if both dates are the same or if end_date is missing
    if (!end_date || start_date === end_date) {
      leave.selectedLeaveDate = formatDate(start_date); // Show only the start_date
    }

    // Otherwise, show the range
    leave.selectedLeaveDate = `${formatDate(start_date)} To ${formatDate(end_date)}`;
    setSelectedLeave(leave);
    setStatus(leave?.status || "pending"); // Set status from leave or default to 'pending'
    setModalOpen(true);
  };

  const handleAppointmentDetails = async (appointment: any) => {
    try {
      const responseBarber = await fetchAvailableBarber(appointment.id);
      setAvailableAppointmentBabrers(responseBarber);
      setModalTransfer(true);
      setSelectedBarberAppointment(appointment);
    } catch (error: any) {
      // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const cancelAppointmentDetails = async (appointment: any) => {
    setAppointmentId(appointment.id);
    toggleConfirmModal(); // Open the confirmation modal
  }
  const otherFormatDate = (dateString: any) => {
    if (!dateString) return ""; // Return an empty string if dateString is invalid

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Return an empty string if date is invalid

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Helper function to format a date
  const formatDate = (dateString: any) => {
    if (!dateString) return ""; // Return an empty string if dateString is invalid
    const date = new Date(dateString);
    // Get the user's current timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: userTimeZone, // Automatically adapts to the user's location
    };

    // Get formatted date
    const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date); // en-CA ensures YYYY-MM-DD format

    // Replace slashes with dashes to ensure YYYY-MM-DD format
    return formattedDate.replace(/\//g, '-');
  };
  const handleStatusChange = (event: any) => {
    setUpdatedStatus(event.target.value); // Apply the selected status locally
    // You may also want to clear the deny reason when the status is approved
    if (event.target.value !== "denied") {
      setDenyReason(""); // Clear reason if the status is not 'denied'
    }
  };
  const handleDeny = () => {
    if (selectedLeave) {
      setSelectedLeave({ ...selectedLeave, status: 'denied' });
    }
  };
  // const handleApprove = async () => {
  //   if (selectedLeave) {
  //     try {
  //       // Pass both status and an empty response_reason for 'approved'
  //       await updateLeaveStatus(selectedLeave.id, {
  //         status: 'approved',
  //         response_reason: '' // No reason needed for approval
  //       });
  //       setSelectedLeave({ ...selectedLeave, status: 'approved' });
  //       setModalOpen(false); // Close the modal after successful update
  //     } catch (error) {
  //       console.error("Error submitting leave status:", error);
  //     }
  //   }
  // };

  // const handleDeny = () => {
  //   if (selectedLeave) {
  //     setSelectedLeave({ ...selectedLeave, status: "denied" });
  //   }
  // };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedLeave) {
      // Pre-validation
      if (selectedUpdatedStatus === "denied" && !denyReason.trim()) {
        toast.error("Please provide a reason for rejection.");
        return;
      }

      try {
        setIsSubmitting(true); // Set loading state

        const dataToUpdate = {
          status: selectedUpdatedStatus,
          response_reason: selectedUpdatedStatus === "denied" ? denyReason : "",
        };

        await updateLeaveStatus(selectedLeave.id, dataToUpdate);

        setModalOpen(false);
        fetchrequestedLeaveData(
          1,
          selectedStartDate,
          selectedEndDate,
          selectedStatus,
          " ",
        )
        toast.success("Leave status updated successfully", { autoClose: 2000 });
      } catch (error) {
        toast.error("Error submitting leave status");
        console.error("Error submitting leave status:", error);
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    }
  };

  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: ({ row }: { row: { original: { createdAt: string } } }) => {
          const { createdAt } = row.original;
          // Return the formatted date to be displayed
          return formatDate(createdAt);
        },
      },
      {
        header: "Barber Name",
        accessorKey: "barber", // Use 'barber' directly
        cell: ({ row }: { row: { original: { barber: { name: string } } } }) =>
          row.original.barber?.name, // Access nested barber name
        enableColumnFilter: false,
      },
      // {
      //   header: "Salon Name",
      //   accessorKey: "barber.salon.name", // Use 'barber.salon.name' as the accessor key
      //   cell: ({
      //     row,
      //   }: {
      //     row: { original: { barber: { salon: { name: string } } } };
      //   }) => row.original.barber?.salon?.name, // Access the nested salon name
      //   enableColumnFilter: false,
      // },

      {
        header: "Leave Date",
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
            return formatDate(start_date); // Show only the start_date
          }

          // Otherwise, show the range
          return `${formatDate(start_date)} To ${formatDate(end_date)}`;
        },
      },

      {
        header: "Reason",
        accessorKey: "reason",
        enableColumnFilter: false,
        cell: ({ getValue }: { getValue: () => string }) => {
          const value = getValue();
          // Remove all non-alphabetic characters and convert to uppercase
          return value.replace(/[^a-zA-Z\s]/g, ' ').toUpperCase();
        },
      },
      {
        header: "Available Time",
        accessorKey: "availabe_time",
        enableColumnFilter: false,
        cell: ({
          row,
        }: {
          row: { original: { start_time: string; end_time: string } };
        }) => {
          const { start_time, end_time } = row.original;
          return `${start_time ? formatHours(start_time) : "-"} - ${end_time ? formatHours(end_time) : ""
            }`;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info: any) => {
          const status = info.row.original.status;
          return status === "pending" ? (
            <span className="badge bg-warning-subtle text-warning text-uppercase">
              {status}
            </span>
          ) : status === "approved" ? (
            <span className="badge bg-success-subtle text-success text-uppercase">
              {status}
            </span>
          ) : status === "denied" ? (
            <span className="badge bg-danger-subtle text-danger text-uppercase">
              {status}
            </span>
          ) : null;
        },
        enableColumnFilter: false,
      },
      {
        header: "Actions",
        cell: (info: any) => (
          <Button
            color="btn btn-sm btn-light"
            size="sm"
            onClick={() => handleDetailsClick(info.row.original)}
            disabled={info.row.original.status !== 'pending'}
          >
            Details
          </Button>
        ),
        enableColumnFilter: false,
      },
    ],
    []
  );
  const handlePageChange = async (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    fetchrequestedLeaveData(
      total,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      selectedSearchText ?? ""
    );
  };

  const formatHours = (timeString: string) => {
    const padZero = (num: number) => String(num).padStart(2, "0");

    // Split the time string into hours, minutes, and seconds
    const [hoursStr, minutesStr] = timeString.split(":");

    let hours = parseInt(hoursStr, 10);
    const minutes = padZero(parseInt(minutesStr, 10));
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    return `${padZero(hours)}:${minutes} ${ampm}`;
  };

  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  }

  const confirmAppointmentChange = async () => {
    try {
      if (appointmentId) {
        await cancelAppointment(appointmentId); // API call with appointment ID
        toast.success("Cancel appointment successfully", { autoClose: 2000 });
        setAppointmentId(null);
        toggleConfirmModal(); // Close modal
        // Ensure selectedLeave and barber exist before modifying appointments
        if (selectedLeave && selectedLeave.barber && selectedLeave.barber.appointments) {
          const updatedAppointments = selectedLeave.barber.appointments.filter(
            (appointment: any) => appointment.id !== appointmentId
          );

          // Create a new barber object with updated appointments
          const updatedBarber = {
            ...selectedLeave.barber,
            appointments: updatedAppointments,
          };

          // Update the selectedLeave object with a new reference
          const updatedSelectedLeave = {
            ...selectedLeave,
            barber: updatedBarber,
          };
          setSelectedLeave(updatedSelectedLeave); // Update state or wherever selectedLeave is stored
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSearchText = (search: any) => {

    selectedSearch(search);
    if (search) {
      fetchrequestedLeaveData(
        1,
        selectedStartDate,
        selectedEndDate,
        selectedStatus,
        search,
      );
    } else {
      fetchrequestedLeaveData(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        selectedStartDate,
        selectedEndDate,
        selectedStatus,
        search,
      );
    }

    // Handle page change logic here
  };

  const handleAvailableBarberChange = (event: any) => {
    setSelectedAvailableBabrer(event.target.value);
  }

  const appointmentTransfer = async () => {
    try {
      setShowSpinner(true);
      const obj = {
        appointmentId: selectedBarberAppointment.id,
        newBarberId: parseInt(selectedAvailableBabrer)
      }
      const data = await saveTransferAppointments(obj);
      setShowSpinner(false);
      setModalTransfer(!modalTransfer);
      toast.success("Transfer barber successfully", { autoClose: 2000 });
      // Ensure selectedLeave and barber exist before modifying appointments
      if (selectedLeave && selectedLeave.barber && selectedLeave.barber.appointments) {
        const updatedAppointments = selectedLeave.barber.appointments.filter(
          (appointment: any) => appointment.id !== selectedBarberAppointment.id
        );

        // Create a new barber object with updated appointments
        const updatedBarber = {
          ...selectedLeave.barber,
          appointments: updatedAppointments,
        };

        // Update the selectedLeave object with a new reference
        const updatedSelectedLeave = {
          ...selectedLeave,
          barber: updatedBarber,
        };
        setSelectedLeave(updatedSelectedLeave); // Update state or wherever selectedLeave is stored
      }
    } catch (error: any) {
      // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const handleFilterData = async (data: any) => {
    if (data) {
      setStartDate(data.dateRange[0]);
      setEndDate(data.dateRange[1]);
      setStatus(data.status); // Update status in state
    }
    fetchrequestedLeaveData(
      selectedCurrentPage === 0 ? 1 : selectedCurrentPage,

      data.dateRange[0],
      data.dateRange[1],
      data?.status === "All" ? "" : data?.status, // Send empty string for "All"
      selectedSearchText ?? ""
    );
  };

  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={4}>
          <h5>Requested Leaves</h5>
        </Col>
      </Row>
      <div className="card-body pt-0">
        {showLoader ? (
          <Loader />
        ) : (
          <TableContainer
            columns={columns}
            data={leaveData || []} // This should contain the correctly structured data
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
            divClass="table-responsive table-card mb-3"
            tableClass="align-middle table-nowrap mb-0"
            theadClass="table-light text-muted"
            isStatusListFilter={true}
            isLeaveFilter={true}
            SearchPlaceholder="Search by barber name"
          />
        )}
      </div>

      {/* Leave Details Modal */}
      {selectedLeave && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered backdrop="static" size="lg">
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            Leave Details
          </ModalHeader>
          <ModalBody>
            <Row className="g-3">
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Barber: <b className="text-muted"> {selectedLeave?.barber?.name} </b>
                  </Label>
                </div>
              </Col>
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Salon: <b className="text-muted"> {selectedLeave?.barber?.salon?.name}</b>
                  </Label>
                </div>
              </Col>
            </Row>
            <Row className="g-3">
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Reason: <b className="text-muted"> {selectedLeave?.reason} </b>
                  </Label>
                </div>
              </Col>
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Laeve Date: <b className="text-muted"> {selectedLeave?.selectedLeaveDate} </b>
                  </Label>
                </div>
              </Col>
            </Row>
            <Row className="g-3">
              <Col lg={6}>
                <div className="d-flex align-items-center justify-content-start mb-6">
                  <Label htmlFor="salon" className="form-label me-2">
                    Status
                  </Label>
                  <Input
                    type="select"
                    id="availability_status"
                    value={selectedUpdatedStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approve</option>
                    <option value="denied">Reject</option>
                  </Input>
                </div>
              </Col>
            </Row>
            {/* Show rejection reason textarea only if status is 'denied' */}
            {selectedUpdatedStatus === "denied" && (
              <Row className="g-3">
                <Col lg={12}>
                  <div>
                    <Label htmlFor="salon" className="form-label">
                      Rejection Reason
                    </Label>
                    <Input
                      type="textarea"
                      value={denyReason}
                      onChange={(e) => setDenyReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                    />
                  </div>
                </Col>
              </Row>
            )}
            <div>
              <div className="mt-4">
                <p>
                  <strong>Appointments</strong>
                </p>
                <div className="table-responsive table-card mb-3">
                  <Table hover className="align-middle table-nowrap mb-0">
                    <thead className="table-light text-muted">
                      <tr>
                        <th>Name</th>
                        <th>No. Of Peoples</th>
                        <th>Mobile</th>
                        <th>Start Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLeave?.barber.appointments?.length > 0 ? (
                        selectedLeave?.barber.appointments.map((row: any) => {
                          return (
                            <tr key={row.id}>
                              <td>{row.name}</td>
                              <td>{row.number_of_people}</td>
                              <td>{row.mobile_number}</td>
                              <td>{formatTime(row.appointment_start_time)}</td>
                              <td>
                                <Button
                                  color="btn btn-sm btn-primary me-2"
                                  size="sm"
                                  onClick={() => handleAppointmentDetails(row)}
                                >
                                  Transfer
                                </Button>
                                <Button
                                  color="btn btn-sm btn-danger"
                                  size="sm"
                                  onClick={() => cancelAppointmentDetails(row)}
                                >
                                  Cancel
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-3"
                          >
                            No Data Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
              {/* Conditional action buttons */}
              <div className="d-flex justify-content-end mt-4 mb-4">
                <Button
                  color="success"
                  onClick={handleSubmit}
                  disabled={selectedUpdatedStatus === "pending" || selectedLeave.barber.appointments?.length > 0} // Disable if status is not changed
                >
                  Submit
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
      {modalTransfer && (
        <Modal isOpen={modalTransfer} toggle={() => setModalTransfer(!modalTransfer)} centered backdrop="static" size="lg">
          <ModalHeader toggle={() => setModalTransfer(!modalTransfer)}>
            Transfer Appointment
          </ModalHeader>
          <ModalBody className="modal-body">
            <Row className="g-3">
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Salon: <b className="text-muted"> {selectedLeave?.barber?.salon?.name}</b>
                  </Label>
                </div>
              </Col>
              {/* Barber ID */}
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Barber: <b className="text-muted"> {selectedLeave?.barber?.name} </b>
                  </Label>
                </div>
              </Col>
            </Row>
            <Row className="g-3">
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Appointment Start Time: <b className="text-muted"> {formatTime(selectedBarberAppointment?.appointment_start_time)}</b>
                  </Label>
                </div>
              </Col>
              {/* Barber ID */}
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Appointment End Time: <b className="text-muted"> {formatTime(selectedBarberAppointment?.appointment_end_time)} </b>
                  </Label>
                </div>
              </Col>
            </Row>
            <Row className="g-3">
              <Col lg={12}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Transfer Barber
                  </Label>
                  {availableAppointmentBabrers?.availableBarbers?.length > 0 ? (
                    <Input
                      type="select"
                      name="reason"
                      id="reason"
                      value={selectedAvailableBabrer}
                      onChange={handleAvailableBarberChange}
                    >
                      <option value="">Select Barber</option>
                      {availableAppointmentBabrers.availableBarbers.map((appointment: any, index: any) => (
                        <option key={index} value={appointment.id}>
                          {appointment.name}
                        </option>
                      ))}
                    </Input>
                  ) : (
                    <p>No barber available</p>
                  )}
                </div>
              </Col>
            </Row>
          </ModalBody>
          <div className="modal-footer">
            <div className="gap-2 hstack justify-content-end w-100">
              <div className="hstack gap-2 justify-content-end">
                <Button
                  type="button"
                  onClick={() => {
                    setModalTransfer(!modalTransfer);
                    setSelectedAvailableBabrer(null);
                  }}
                  className="btn-light"
                >
                  Close
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    appointmentTransfer();
                  }}
                  className="btn btn-success"
                  id="add-btn"
                  disabled={showSpinner || !selectedAvailableBabrer} // Disable button when loader is active
                >
                  {showSpinner && (
                    <Spinner size="sm" className="me-2">
                      Loading...
                    </Spinner>
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <AppointmentConfirmationModal
        isOpen={confirmModalOpen}
        toggle={toggleConfirmModal}
        onConfirm={confirmAppointmentChange}  // Pass the confirm function with appointmentId
        status={''}
        isAppointment={true}
        isTransferBarber={false}
        isService={false}
        appointmentId={appointmentId}  // Pass appointmentId to modal
      />
      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default RequestedLeavesTable;
