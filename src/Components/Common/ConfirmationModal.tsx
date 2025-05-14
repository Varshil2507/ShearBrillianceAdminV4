import React from "react";
import { Modal, ModalBody } from "reactstrap";

interface ConfirmationModalProps {
  show?: boolean;
  onOkClick?: () => void;
  onCloseClick?: () => void;
  recordId?: string;
  cardDetails?: any;
  cardList?: any;
  isButtonClick?: any;
  oldStatus?: any;
  newStatus?: any;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, onOkClick, onCloseClick, recordId, cardDetails, cardList, isButtonClick, oldStatus, newStatus }) => {
  let movedCard: any;
  let sourceLine: any;
  let destinationLine: any;
  if (!isButtonClick) {
    sourceLine = cardList.find(
      (line: any) => line.id === cardDetails?.source?.droppableId
    );
    destinationLine = cardList.find(
      (line: any) => line.id === cardDetails?.destination?.droppableId
    );
    // Get the moved card
    movedCard = sourceLine?.cards[cardDetails?.source?.index];
  } else {
    sourceLine = cardDetails;
    movedCard = cardDetails;
  }
  return (
    <Modal fade={true} isOpen={show} toggle={onCloseClick} centered
      backdrop="static" // Prevents closing on outside click
    >
      <ModalBody className="py-3 px-5">
        <table className="table table-striped">
          <tbody>
            <tr>
              <th>Customer Name</th>
              <td className="text-muted">{movedCard?.title}</td>
            </tr>
            <tr>
              <th>Services</th>
              <td className="text-muted">{movedCard?.Services?.length > 0 ? (movedCard?.Services.map(
                (
                  element: any,
                  idx: any
                ) => (
                  <span> {idx > 0 && (<span>,</span>)} {element.name}</span>
                )
              )) : <span className="text-muted"><i>No data found</i></span>}</td>
            </tr>
            <tr>
              <th>Barber</th>
              <td>
                <b className="" style={{ color: movedCard?.barber_bg_color }}>{movedCard?.barber}</b>
              </td>
            </tr>
            <tr>
              <th>Salon</th>
              <td className="text-muted">{movedCard?.salon}</td>
            </tr>
            <tr>
              <th>Mobile</th>
              <td className="text-muted">{movedCard?.mobile_number ? movedCard?.mobile_number : <i>No data found</i>}</td>
            </tr>
            <tr>
              <th><i className="ri-user-line"></i></th>
              <td className="text-muted">{movedCard?.number_of_people}</td>
            </tr>
            <tr>
              <th><i className="ri-time-line"></i></th>
              <td className="text-muted">
                {movedCard?.estimated_wait_time > 60
                  ? `${Math.floor(movedCard?.estimated_wait_time / 60)} hr ${movedCard?.estimated_wait_time % 60
                  } min`
                  : `${movedCard?.estimated_wait_time} min`}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2">
          <div className="mt-4 pt-2 fs-15">
            <p className="text-muted mb-0">
              Are you sure you want to move this appointment &nbsp; 
              <span className="text-info">&nbsp;
                {isButtonClick ? oldStatus === 'in_salon' ? 'In Salon' : oldStatus === 'check_in' ? 'Check In' : oldStatus : sourceLine?.nameAlias} </span>
              to <span className="text-info">
                {isButtonClick ? newStatus === 'in_salon' ? 'In Salon' : newStatus === 'check_in' ? 'Check In' : newStatus : destinationLine?.nameAlias}</span>  ?
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-light"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Close
          </button>
          <button
            type="button"
            className="btn w-sm btn-danger "
            id="delete-record"
            onClick={onOkClick}
          >
            Yes, Do It!
          </button>
        </div>
      </ModalBody>
    </Modal>
  ) as unknown as JSX.Element;
};

export default ConfirmationModal;