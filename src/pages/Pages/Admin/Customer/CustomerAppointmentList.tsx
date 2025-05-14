import React, { useMemo, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { Status } from "../Appointments/AppointmentListCol";
import TableContainer from "Components/Common/TableContainerReactTable";
import { formatDate } from "Components/Common/DateUtil";
import { Row, Col } from "reactstrap";

const CustomerAppointmentList = ({ appointments }: any) => {
  const [loadingRow, setLoadingRow] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleDetailsClick = (row: any) => {
    setLoadingRow(row.id);
    setTimeout(() => {
      setSelectedAppointment(row);
      setShowModal(true);
      setLoadingRow(null);
    }, 500);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  // const hasMultipleSalons = useMemo(() => {
  //   const salonNames = new Set(
  //     (appointments || []).map((appt: any) => appt?.salon?.name).filter(Boolean)
  //   );
  //   return salonNames.size > 1;
  // }, [appointments]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        header: "Full Name",
        accessorKey: "name",
        cell: (cell: any) => cell.getValue() || "Unknown",
        enableColumnFilter: false,
      },
      {
        header: "Barber Name",
        accessorKey: "Barber.name",
        cell: (cell: any) => cell.getValue() || "Unknown",
        enableColumnFilter: false,
      },
      {
        header: "Salon Name",
        accessorKey: "salon.name",
        cell: (cell: any) => cell.getValue() || "N/A",
        enableColumnFilter: false,
      },
      {
        header: "Date",
        accessorKey: "check_in_time",
        cell: (cell: { row: { original: any } }) =>
          formatDate(
            cell.row.original.appointment_date ||
              cell.row.original.check_in_time
          ),
        enableColumnFilter: false,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: any) => <Status {...cell} />,
        enableColumnFilter: false,
      },
      {
        header: "Actions",
        accessorKey: "id",
        enableColumnFilter: false,
        cell: (cell: { row: { original: any } }) => {
          const row = cell.row.original;
          return (
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => handleDetailsClick(row)}
              disabled={loadingRow === row.id}
            >
              {loadingRow === row.id ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                />
              ) : (
                "Details"
              )}
            </button>
          );
        },
      },
    ];

    return baseColumns.filter(Boolean); // remove false when salon is single
  }, [appointments, loadingRow]);

  return (
    <React.Fragment>
      <TableContainer
        columns={columns}
        data={appointments || []}
        isGlobalFilter={true}
        customPageSize={100}
        divClass="table-responsive table-card mb-3"
        tableClass="align-middle table-nowrap mb-0"
        theadClass="table-light text-muted"
        SearchPlaceholder="Search by barber, salon or name"
      />

      {/* Details Modal */}
      <Modal isOpen={showModal} toggle={handleModalClose}  centered>
        <ModalHeader toggle={handleModalClose}></ModalHeader>
        <ModalBody>
          {selectedAppointment ? (
            <Row>
              {/* LEFT COLUMN */}
              <Col md={7}>
                <h5 className="mb-3 text-primary">
                  {/* <i className="bi bi-person-vcard me-2"></i> */}
                  Appointment Info
                </h5>

                <p>
                  <i className="bi bi-person-circle me-2"></i>
                  <strong>Full Name:</strong> {selectedAppointment.name}
                </p>
                <p>
                  <i className="bi bi-telephone me-2"></i>
                  <strong>Mobile Number:</strong>{" "}
                  {selectedAppointment.mobile_number || "N/A"}
                </p>

                <p>
                  <i className="bi bi-building me-2"></i>
                  <strong>Salon:</strong>{" "}
                  {selectedAppointment?.salon?.name || "N/A"}
                </p>
                <p>
                  <i className="bi bi-scissors me-2"></i>
                  <strong>Barber:</strong>{" "}
                  {selectedAppointment?.Barber?.name || "N/A"}
                </p>

                <p>
                  <i className="bi bi-calendar-check me-2"></i>
                  <strong>Type:</strong>{" "}
                  <span
                    className={`fw-semibold text-${
                      selectedAppointment.check_in_time ? "info" : "secondary"
                    }`}
                  >
                    {selectedAppointment.check_in_time
                      ? "Check-In"
                      : "Appointment"}
                  </span>
                </p>
                <p>
                  <i className="bi bi-calendar-event me-2"></i>
                  <strong>Date:</strong>{" "}
                  {formatDate(
                    selectedAppointment?.appointment_date ||
                      selectedAppointment.check_in_time
                  )}
                </p>

                {!selectedAppointment.check_in_time && (
                  <>
                    <p>
                      <i className="bi bi-clock me-2"></i>
                      <strong>Start Time:</strong>{" "}
                      {selectedAppointment.appointment_start_time
                        ? new Date(
                            `1970-01-01T${selectedAppointment.appointment_start_time}`
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                    <p>
                      <i className="bi bi-clock-history me-2"></i>
                      <strong>End Time:</strong>{" "}
                      {selectedAppointment.appointment_end_time
                        ? new Date(
                            `1970-01-01T${selectedAppointment.appointment_end_time}`
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </>
                )}

                <p>
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`fw-semibold ${
                      selectedAppointment.status === "completed"
                        ? "text-success"
                        : selectedAppointment.status === "canceled"
                        ? "text-danger"
                        : "text-warning"
                    }`}
                  >
                    {selectedAppointment.status.charAt(0).toUpperCase() +
                      selectedAppointment.status.slice(1)}
                  </span>
                </p>

                {selectedAppointment.haircutDetails?.length > 0 && (
                  <>
                    <h6 className="mt-4 mb-2 text-primary">
                      <i className="bi bi-scissors me-2"></i>Haircut Details
                    </h6>
                    <ul className="ps-3">
                      {selectedAppointment.haircutDetails.map(
                        (item: any, index: number) => (
                          <li key={index}>{item.name || "Unnamed Haircut"}</li>
                        )
                      )}
                    </ul>
                  </>
                )}
              </Col>

              {/* RIGHT COLUMN */}
              <Col md={5}>
                <h5 className="mb-3 text-primary">
                  {/* <i className="bi bi-credit-card-2-front me-2"></i> */}
                  Payment Info
                </h5>
                {selectedAppointment.paymentDetails ? (
                  <>
                    <p>
                      <i className="bi bi-cash-coin me-2"></i>
                      <strong>Amount:</strong> $
                      {selectedAppointment.paymentDetails.amount}
                    </p>
                    <p>
                      <i className="bi bi-percent me-2"></i>
                      <strong>Tax:</strong> $
                      {selectedAppointment.paymentDetails.tax}
                    </p>
                    <p>
                      <i className="bi bi-gift me-2"></i>
                      <strong>Tip:</strong> $
                      {selectedAppointment.paymentDetails.tip}
                    </p>
                    {/* <p>
                      <i className="bi bi-tags me-2"></i>
                      <strong>Discount:</strong> $
                      {selectedAppointment.paymentDetails.discount}
                    </p> */}
                    <p>
                      <i className="bi bi-wallet2 me-2"></i>
                      <strong>Total:</strong> $
                      {selectedAppointment.paymentDetails.totalAmount}
                    </p>
                    <p>
                      <i className="bi bi-check-circle me-2"></i>
                      <strong>Payment Status:</strong>{" "}
                      <span
                        className={`fw-semibold ${
                          ["Success", "Completed"].includes(
                            selectedAppointment.paymentDetails.paymentStatus
                          )
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {selectedAppointment.paymentDetails.paymentStatus}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-muted">No payment details available.</p>
                )}
              </Col>
            </Row>
          ) : (
            <p>No data available.</p>
          )}
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default CustomerAppointmentList;
