import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";

const AppointmentConfirmationModal = ({
  isOpen = false,
  toggle,
  onConfirm,
  status,
  isAppointment = false,
  isTransferBarber = false,
  isService = false,
  appointmentId,
  showSpinner,
}: // appointmentInfo,
// Ensure appointmentId is passed
{
  isOpen: boolean;
  toggle: () => void;
  onConfirm: (appointmentId: string) => void; // Pass appointmentId when confirming
  status: string;
  isAppointment: boolean;
  isTransferBarber: boolean;
  isService: boolean;
  appointmentId: string;
  showSpinner?: boolean;
  // appointmentInfo:any  // Added appointmentId to props
}) => {
  const [showTempSpinner, setShowSpinner] = useState<boolean>(false);

  const setConfirmData = async (selectedAppointmentId: any) => {
    try {
      setShowSpinner(true);
      await onConfirm?.(selectedAppointmentId); // call parent logic (can be async)
      toggle(); // close modal after confirmation completes
    } catch (error) {
      // console.error("Confirmation failed:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="appointment-modal"
      centered
      backdrop="static"
    >
      <ModalHeader toggle={toggle} className="modal-header">
        <h4 className="modal-title">
          Confirm {isAppointment ? "Appointment" : "Status Update"}
        </h4>
      </ModalHeader>
      <ModalBody className="modal-body">
        {isAppointment ? (
          <p className="confirmation-text">
            Are you sure you want to cancel this appointment?
          </p>
        ) : isTransferBarber ? (
          <>
            <p className="confirmation-text">
              Are you sure you want to update the status?
              <strong className="status">{status}</strong>?
            </p>
            {/* Note Section */}
            <p className="note">
              <strong>
                Note: If you transfer this barber from Schedule to WalkIn, it
                will automatically cancel all future appointments.
              </strong>{" "}
            </p>
          </>
        ) : isService ? (
          <p className="confirmation-text">
            Are you sure you want to{" "}
            <strong>{status === "true" ? "Active" : "Deactive"}</strong> this
            service?
          </p>
        ) : (
          <p className="confirmation-text">
            Are you sure you want to update the status to{" "}
            <strong className="status">{status}</strong>?
          </p>
        )}
      </ModalBody>
      <ModalFooter className="modal-footer">
        <Button
          color="success"
          className="btn-confirm"
          disabled={showTempSpinner} // Disable button while submitting
          onClick={() => setConfirmData(appointmentId)} // Pass the appointmentId here
        >
          {showTempSpinner && (
            <Spinner size="sm" className="me-2">
              Submitting...
            </Spinner>
          )}
          Confirm
        </Button>
        <Button color="secondary" className="btn-cancel" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AppointmentConfirmationModal;
