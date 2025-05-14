import React, { useState, useEffect, useMemo } from "react";
import {
  Col,
  Row,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  Form,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  FormFeedback,
  Input,
  Label,
} from "reactstrap";
import { format } from "date-fns";
import {
  fetchBarbersAppointments,
  updateAppointmentStatus,
} from "Services/AppointmentService";
import TableContainer from "Components/Common/TableContainer";
import Loader from "Components/Common/Loader";
import { formatTime, otherFormatDate } from "Components/Common/DateUtil";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";
import { useFormik } from "formik";
import AppointmentConfirmationModal from "Components/Common/AppointmentStatusChange";
import { Link } from "react-router-dom";
import { addHaircutDetail } from "Services/HaircutDetails";
import * as Yup from "yup";
import { updateTipAmount } from "Services/Tipservice";
import printJS from "print-js";
import { Status } from "../Appointments/AppointmentListCol";

interface CardData {
  id?: string;
  kanId?: string;
  title?: string;
  cardId?: string;
  botId?: any;
  check_in_time?: any;
  complete_time?: any;
  in_salon_time?: any;
  cancel_time?: any;
  text?: string;
  haircutDetails?: any[];
  Services?: any[];
  userImages?: any[];
  badgeColor?: string;
}

const limit = 10;
const today = format(new Date(), "yyyy-MM-dd");

const BarberAppointmentList = ({ salonNames }: any) => {
  const [kanbanTasksCards, setKanbanTasksCards] = useState<any>();
  const [event, setEvent] = useState<any>({});
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>(
    salonNames?.barbers || []
  );
  const [openAccordion, setOpenAccordion] = useState<string>("");
  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [selectedStartDate, setStartDate] = useState<any>(new Date());
  const [selectedEndDate, setEndDate] = useState<any>(new Date());
  const [selectedCurrentPage, setCurrentPage] = useState<number>(0);
  const [selectedStatus, setStatus] = useState<string>("all");
  const [selectedSearchText, selectedSearch] = useState<string>("");
  const [selectedTotalItems, setTotalItems] = useState<number>(0);
  const [selectedTotalPages, setTotalPages] = useState<number>(0);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [assignTag, setAssignTag] = useState<any>([]);
  const [selectedHairCutDetails, setSelectedHairCutDetails] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatuss, setSelectedStatus] = useState<string>(""); // don't depend on card here
  const [previousOption, setPreviousOption] = useState("");
  const [appointmentId, setAppointmentId] = useState<any>();
  const [cardhead, setCardHead] = useState<any>();
  const [modal, setModal] = useState(false); // For opening/closing the modal
  const [card, setCard] = useState<any>(null); // To hold appointment details
  const toggle = () => setModal(!modal);
  const [isView, setIsView] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [modall, setModall] = useState<boolean>(false);
  const [tipSubmitting, setTipSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tipAmount: "", // Add this if not already present
  });
  const handleDetails = (appointmentData: any) => {
    setCard(appointmentData); // Set the selected row data
    setSelectedStatus(appointmentData.status); // ✅ sync dropdown with latest status
    setModal(true); // Open the modal
  };

  //   const handleOpen = () => {
  //   setModall(!modall);
  //   setCardHead(null);
  //   setIsView(false);
  // };

  const handleDetailss = (details: any) => {
    handleOpen();
    setIsView(true); // Toggle edit mode
    setSelectedHairCutDetails(details);
    // setSelectedSalonId(barber.SalonId);
    // setSelectedImage(barber.photo ?? Profile); // Use user's profile image or default
    // setNewBarber(barber); // Set the user to be updated
    // toggleModal(); // Open the modal for editing
  };
  useEffect(() => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setStatus("all");
    setCurrentPage(1); // ✅ This is the missing piece

    fetchAppointmentList(1, today, today, "all", undefined, "");
  }, []);

  const fetchAppointmentList = async (
    page: any,
    startDate: Date,
    endDate: Date,
    status: string,
    barberId?: number,
    search: string = ""
  ) => {
    try {
      setShowLoader(true);

      const response: any = await fetchBarbersAppointments({
        startDate: otherFormatDate(startDate),
        endDate: otherFormatDate(endDate),
        search,
        barberId,
        salonId: salonNames?.salon?.id,
        page,
        limit,
        status, // ✅ Pass it here
      });

      let appointments = response.appointments.map((usr: any) => ({
        ...usr,
        fullname: `${usr.User.firstname} ${usr.User.lastname}`,
      }));

      setAppointmentData(appointments);
      setTotalItems(response.pagination.totalRecords); // backend should return this
      setTotalPages(response.pagination.totalPages);
      setShowLoader(false);
    } catch (error: any) {
      setShowLoader(false);
      showErrorToast(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    // reset local filters when barber changes
    setStatus("all");
    // setDateRange([new Date(), new Date()]);
  }, [selectedBarber]);

  const toggleAccordion = (id: string, barberId: number) => {
    const newOpen = openAccordion === id ? "" : id;
    setOpenAccordion(newOpen);

    if (newOpen === id) {
      const resetPage = 1;
      const today = new Date();

      // ✅ Reset filters on barber switch
      setSelectedBarber(String(barberId));
      setCurrentPage(resetPage);
      setStatus("all");
      selectedSearch("");
      setStartDate(today);
      setEndDate(today);

      // ✅ fetch fresh data for this barber with correct page
      fetchAppointmentList(
        resetPage, // ✅ don't hardcode, match it
        today,
        today,
        "all",
        barberId,
        ""
      );
    }
  };

  const isAppointmentToday = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0]; // "2025-05-14"
    // If dateStr is already in YYYY-MM-DD format (e.g., appointment_date), this works
    if (dateStr.length === 10) {
      return dateStr === todayDateStr;
    }
    // Else assume it's ISO datetime (e.g., check_in_time)
    const inputDateStr = new Date(dateStr).toISOString().split("T")[0];
    return inputDateStr === todayDateStr;
  };

  const handleBarberSelect = (card: React.ChangeEvent<HTMLSelectElement>) => {
    const value = card.target.value;
    setSelectedBarber(value === "all" ? null : value);
  };

  const handleFilterData = (data: any) => {
    const page = 1; // ✅ Always reset to page 1 on filter
    const start = data?.dateRange?.[0] || selectedStartDate;
    const end = data?.dateRange?.[1] || selectedEndDate;
    const status = data?.status || "all";

    setStartDate(start);
    setEndDate(end);
    setStatus(status);
    setCurrentPage(page); // ✅ sync current page

    fetchAppointmentList(
      selectedCurrentPage === 0 ? 1 : selectedCurrentPage,

      start,
      end,
      status,
      selectedBarber ? parseInt(selectedBarber) : undefined,
      selectedSearchText
    );
  };

  const handlePageChange = (pageIndex: number) => {
    const page = pageIndex + 1; // Convert back to 1-based for backend
    setCurrentPage(page); // Store for UI control

    fetchAppointmentList(
      page,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      selectedBarber ? parseInt(selectedBarber) : undefined,
      selectedSearchText ?? ""
    );
  };

  const handleSearchText = (search: string) => {
    const page = 1;
    selectedSearch(search);
    setCurrentPage(page);

    fetchAppointmentList(
      selectedCurrentPage ? selectedCurrentPage + 1 : 1,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      selectedBarber ? parseInt(selectedBarber) : undefined,
      search
    );
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedStatus(previousOption);
  };

  const handleStatusChange = (newStatus: string) => {
    toggleModal(); // Open the confirmation modal
    setPreviousOption(selectedStatuss);
    setSelectedStatus(newStatus); // Set the new status
    setAppointmentId(card.id); // Store the appointment ID for modal
  };
  const confirmStatusChange = async () => {
    try {
      if (appointmentId) {
        setShowSpinner(true);
        await updateAppointmentStatus(appointmentId, {
          status: selectedStatuss,
        });
        setCard((prev: any) => ({
          ...prev,
          status: selectedStatuss,
        }));

        setShowSpinner(false);
        toggle(); // Close appointment detail modal (optional)
        toggleModal(); // Close confirmation modal

        showSuccessToast("Status updated successfully");
      }
    } catch (error: any) {
      setShowSpinner(false); // Always hide spinner

      // ✅ Extract error message safely
      const message =
        error?.response?.data?.message || "Failed to update appointment status";

      showErrorToast(message); // ✅ Display backend error
    }
  };

  // const handleWalkinStatusChange = async (newStatus: string) => {
  //   try {
  //     if (!card?.id) return;

  //     setShowSpinner(true);

  //     await updateAppointmentStatus(card.id, { status: newStatus });
  //    setShowSpinner(false);
  //         toggle();
  //         toggleModal(); // Close the modal
  //     // ✅ Update the selectedStatus state so dropdown reflects the new value
  //     setSelectedStatus(newStatus);

  //     showSuccessToast("Status updated successfully");

  //     // Optional: Close modal if needed
  //     // toggleModal();
  //   } catch (error: any) {
  //     showErrorToast(
  //       error?.response?.data?.message || "Failed to update status"
  //     );
  //   } finally {
  //     setShowSpinner(false);
  //   }
  // };

  const handleTipSubmit = async (appointmentId: any) => {
    try {
      setTipSubmitting(true); // Start spinner

      const newTip = Number(formData.tipAmount);
      const oldTip = parseFloat(card?.paymentDetails?.tip || "0");
      const oldTotal = parseFloat(card?.paymentDetails?.totalAmount || "0");

      if (!formData.tipAmount || isNaN(newTip) || newTip <= 0) {
        showErrorToast("Please enter a valid tip amount");
        return;
      }

      const updatedTip = oldTip + newTip;
      const updatedTotal = oldTotal + newTip;

      // ✅ Send final updated tip to backend
      await updateTipAmount(appointmentId, updatedTip); // backend should expect total tip now

      // ✅ Toast message
      showSuccessToast("Tip submitted successfully!");

      setTipModalOpen(false);
      setFormData({ ...formData, tipAmount: "" }); // optional reset
    } catch (error) {
      showErrorToast("Failed to update tip.");
    } finally {
      setTipSubmitting(false); // Stop spinner
    }
  };
  const haircutFormik: any = useFormik({
    enableReinitialize: true,

    initialValues: {
      appointment_id: (card?.id && parseInt(card?.id)) || null,
      user_id: (card?.user && card?.user?.id) || null,
      customer_notes:
        (selectedHairCutDetails && selectedHairCutDetails.customer_notes) || "",
      haircut_style:
        (selectedHairCutDetails && selectedHairCutDetails.haircut_style) || "",
      product_used:
        (selectedHairCutDetails && selectedHairCutDetails.product_used) || "",
      barber_notes:
        (selectedHairCutDetails && selectedHairCutDetails.barber_notes) || "",
    } as CardData,
    validationSchema: Yup.object({
      customer_notes: Yup.string().required("Please Enter Your Customer Notes"),
      haircut_style: Yup.string().required("Please Enter Your Haircut Style"),
      product_used: Yup.string().required("Please Enter Your Product Used"),
      barber_notes: Yup.string().required("Please Enter your Barber Notes"),
    }),
    onSubmit: async (values: any) => {
      try {
        const newHaircutDetails = await addHaircutDetail({ ...values });
        haircutFormik.resetForm();
        haircutToggle();
        card?.haircutDetails.push(newHaircutDetails);
        showSuccessToast("Haircut details added successfully", {
          autoClose: 2000,
        });
      } catch (error: any) {
        setShowSpinner(false);
        // Check if the error has a response property (Axios errors usually have this)
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
        } else {
          // Fallback for other types of errors
          showErrorToast(error.message || "Something went wrong");
        }
      }
    },
  });
  const handlePrint = () => {
    printJS({
      printable: "printArea", // The ID of the element to print
      type: "html",
    });
  };
  const handleOpen = () => {
    setModall(!modall);
    setCardHead(null);
    setIsView(false);
  };
  const haircutToggle = () => {
    if (modall) {
      setModall(false);
      setCardHead(null);
    } else {
      setModall(true);
    }
  };
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
      id: (card && card.cardId) || "",
      title: (card && card.title) || "",
      text: (card && card.text) || "",
      haircutDetails: (card && card.haircutDetails) || [],
      Services: (card && card.Services) || [],
      userImages: (card && card.userImages) || [],
      botId: (card && card.botId) || "",
      eye: (card && card.eye) || "",
      que: (card && card.que) || "",
      clip: (card && card.clip) || "",
    } as CardData,

    onSubmit: (values: CardData) => {
      if (isEdit) {
        const updatedCards: CardData = {
          id: card ? card?.id : 0,
          kanId: kanbanTasksCards,
          cardId: values?.id,
          title: values.title,
          text: values.text,
          haircutDetails: values.haircutDetails,
          Services: values.Services,
          botId: values.botId,
          userImages: values.userImages,
        };

        // update Job
        // dispatch(onUpdateCardData(updatedCards))
        // validation.resetForm()
      } else {
        const newCardData: CardData = {
          id: (Math.floor(Math.random() * (30 - 20)) + 20).toString(),
          kanId: kanbanTasksCards,
          cardId: values["id"],
          title: values["title"],
          text: values["text"],
          haircutDetails: assignTag,
          botId: values["botId"],
          userImages: values["userImages"],
        };
        // dispatch(onAddCardData(newCardData))
        // validation.resetForm()
      }
      // toggle()
    },
  });

  const columns = useMemo(
    () => [
      {
        header: "Full Name",
        accessorKey: "fullname",
        enableColumnFilter: false,
      },
      // {
      //   header: "Barber",
      //   accessorKey: "Barber.name",
      //   enableColumnFilter: false,
      // },
      // {
      //   header: "Salon",
      //   accessorKey: "salon.name",
      //   enableColumnFilter: false,
      // },
      {
        header: "Services",
        accessorKey: "services",
        cell: ({ row }: any) =>
          row.original.Services.map((s: any) => s.name).join(", "),
        enableColumnFilter: false,
      },
      {
        header: "Appointment Date",
        accessorKey: "appointment_date", // useful for sorting
        enableColumnFilter: false,
        cell: ({ row }) => {
          const data = row.original;
          const isWalkIn = data.category === 2; // 2 means Walk In
          const rawDate = isWalkIn ? data.check_in_time : data.appointment_date;
          if (!rawDate) return "—";
          try {
            let dateObj;
            if (isWalkIn) {
              // check_in_time is full ISO, parse directly
              dateObj = new Date(rawDate);
            } else {
              // appointment_date is only YYYY-MM-DD, parse safely
              const [year, month, day] = rawDate.split("-").map(Number);
              dateObj = new Date(year, month - 1, day);
            }
            return format(dateObj, "dd MMM yyyy");
          } catch (err) {
            return "Invalid Date";
          }
        },
      },

      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell: any) => {
          return <Status {...cell} />;
        },
      },
      {
        header: "Actions",
        accessorKey: "id",
        enableColumnFilter: false,

        cell: (cell: { getValue: () => number; row: { original: any } }) => (
          <div>
            <button
              type="button"
              className="btn btn-sm btn-light me-2"
              onClick={() => handleDetails(cell.row.original)}
            >
              Details
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const columnss = useMemo(
    () => [
      {
        header: "Style",
        accessorKey: "haircut_style",
        enableColumnFilter: false,
      },
      {
        header: "Barber notes",
        accessorKey: "barber_notes", // Add SalonId column for "Salon Name"
        enableColumnFilter: false,
      },
      {
        header: "Product used",
        accessorKey: "product_used",
        enableColumnFilter: false,
      },
      {
        header: "Customer notes",
        accessorKey: "customer_notes",
        enableColumnFilter: false,
      },
      {
        header: "Actions",
        accessorKey: "id",
        enableColumnFilter: false,

        cell: (cell: { getValue: () => number; row: { original: any } }) => (
          <div>
            <button
              type="button"
              className="btn btn-sm btn-light me-2"
              onClick={() => handleDetailss(cell.row.original)}
            >
              Details
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Row className="g-3 mb-3">
        {/* <Col lg={6}>
          <label className="form-label">Select Barber:</label>
          <select
            className="form-select"
            value={selectedBarber || "all"}
            onChange={handleBarberSelect}
          >
            <option value="all">All Barbers</option>
            {salonNames?.barbers?.map((barbr: any, idx: number) => (
              <option key={`barber-option-${idx}`} value={barbr.barber.name}>
                {barbr.barber.name}
              </option>
            ))}
          </select>
        </Col> */}
      </Row>

      <Accordion open={openAccordion} toggle={() => {}}>
        {filteredData.map((barbr: any, idx: number) => (
          <AccordionItem key={`barber-${idx}`} id={`${idx}`}>
            <AccordionHeader
              targetId={`${idx}`}
              onClick={() => toggleAccordion(`${idx}`, barbr.barber.id)}
            >
              <div className="d-flex align-items-center justify-content-between w-100 pe-5">
                <h5 className="mb-0">{barbr.barber.name}</h5>
                <div className="d-flex align-items-center">
                  <div className="d-flex flex-md-column flex-lg-row gap-2 text-end">
                    <span className="me-2">
                      <b>Position:</b>{" "}
                      <span className="text-info">{barbr.barber.position}</span>
                    </span>
                    <span className="me-2">
                      <b>Category:</b>{" "}
                      <span className="text-warning">
                        {barbr.barber.category === 2
                          ? "Walk In"
                          : "Appointment"}
                      </span>
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      barbr.barber.availability_status === "available"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {barbr.barber.availability_status}
                  </span>
                </div>
              </div>
            </AccordionHeader>
            <AccordionBody accordionId={`${idx}`}>
              <div className="card-body pt-3">
                <h6 className="mb-3 text-black">Appointments</h6>
                {showLoader ? (
                  <Loader />
                ) : (
                  <TableContainer
                    columns={columns}
                    data={appointmentData || []}
                    isGlobalFilter={true}
                    customPageSize={limit}
                    totalPages={selectedTotalPages ?? 0}
                    totalItems={selectedTotalItems ?? 0}
                    currentPageIndex={selectedCurrentPage ?? 1} // ✅ Convert to 0-based index
                    selectedDateRange={[selectedStartDate, selectedEndDate]}
                    selectedStatus={selectedStatus}
                    divClass="table-responsive text-black table-card mb-3"
                    tableClass="align-middle table-nowrap mb-3"
                    theadClass="table-light text-black"
                    isStatusFilter={true}
                    appointmentType={
                      barbr.barber.category === 2 ? "check_in" : "appointment"
                    }
                    SearchPlaceholder="Search by name or service"
                    filterData={handleFilterData}
                    searchText={handleSearchText}
                    onChangeIndex={handlePageChange}
                  />
                )}
              </div>
            </AccordionBody>
          </AccordionItem>
        ))}
      </Accordion>

      <Modal
        id="modalForm"
        isOpen={modal}
        toggle={toggle}
        centered={true}
        backdrop="static"
        size="lg"
      >
        <ModalHeader toggle={toggle} className="w-100">
          Appointment Details
          <span
            style={{
              position: "absolute",
              right: window.innerWidth < 992 ? "8%" : "6%",
            }}
          >
            {card?.cardDate} (
            {card?.salon.open_time ? formatTime(card?.salon.open_time) : "N/A"}{" "}
            -{" "}
            {card?.salon.close_time
              ? formatTime(card?.salon.close_time)
              : "N/A"}
            )
            {/* {card?.cardDate} (
  {card?.cardStartTime ? formatTime(card?.cardStartTime) : "N/A"} - 
  {card?.cardEndTime ? subtractMinutes(formatTime(card?.cardEndTime), 15) : "N/A"}) */}
          </span>
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              return false;
            }}
          >
            <div className="row">
              {/* Left Section: Image */}
              <div className="col-lg-4 d-flex justify-content-center align-items-center">
                <div className="text-left">
                  <div className="position-relative d-inline-block">
                    <div className="avatar-lg">
                      <div
                        className="avatar-title bg-light rounded-circle"
                        style={{
                          width: "100px",
                          height: "100px",
                          overflow: "hidden",
                        }}
                      >
                        {card?.User?.profile_photo && (
                          <img
                            src={card.User.profile_photo}
                            alt="User"
                            className="rounded-circle img-fluid"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Fields and Labels */}
              <div className="col-lg-8">
                <div className="form-group py-2 border-bottom">
                  <b>Customer Name: </b>
                  {card?.User
                    ? `${card.User.firstname || ""} ${
                        card.User.lastname || ""
                      }`.trim() || "N/A"
                    : "N/A"}
                </div>
                <div className="form-group py-2 border-bottom">
                  <b>Salon Name: </b>
                  <span>{card?.salon.name || "N/A"}</span>
                </div>
                <div className="form-group py-2 border-bottom">
                  <b>Barber Name: </b>
                  <span>{card?.Barber?.name || "N/A"}</span>
                </div>
                <div className="form-group py-2 border-bottom">
                  <b>Mobile Number: </b>
                  <span>{card?.mobile_number || "N/A"}</span>
                </div>

                <div className="form-group py-2 border-bottom">
                  <b>Services: </b>
                  <span>
                    {card?.Services?.length > 0 ? (
                      card.Services?.map((element: any, idx: any) => (
                        <span key={idx}>
                          {idx > 0 && <span>, </span>}
                          {element.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">
                        <i>No data found</i>
                      </span>
                    )}
                  </span>
                </div>
                <div className="form-group py-2 border-bottom d-flex">
                  <div style={{ width: "50%" }}>
                    <b>Total Amount: </b>
                    <span>${card?.paymentDetails?.totalAmount || "N/A"}</span>
                  </div>
                  <div style={{ width: "50%" }}>
                    <b>Tip: </b>
                    <span>${card?.paymentDetails?.tip || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex-grow-1">
                <b>Payment:</b>
                <b
                  className="px-2 py-1"
                  style={{
                    color:
                      card?.paymentDetails?.paymentStatus?.toLowerCase() ===
                      "success"
                        ? "green"
                        : "red",
                  }}
                >
                  {card?.paymentStatus ?? "Pending"}
                </b>
                {card?.paymentStatus?.toLowerCase() === "success" &&
                  card?.paymentMode !== "Pay_In_Person" && (
                    <Link
                      to={card?.paymentDetails?.receiptUrl}
                      target="_blank"
                      className="btn btn-warning p-0 px-2"
                      data-tooltip-id="download-tooltip"
                      data-tooltip-content="Download Receipt"
                      // onClick={() => handlePrint()}
                    >
                      <i className="ri-download-line"></i> Receipt
                    </Link>
                  )}
              </div>
            </div>
            {/* Status Dropdown */}
            {/* Status Dropdown */}
            <div className="row my-4">
              {card ? (
                <div className="col-md-6 d-flex align-items-center justify-content-start mb-2">
                  <label htmlFor="statusSelect" className="mb-2 me-2">
                    Status
                  </label>

                  {/* COMPLETED or CANCELED - Show read-only badge */}
                  {["completed", "canceled"].includes(card.status) ? (
                    <div
                      className="form-select ms-2"
                      style={{
                        color:
                          card.status === "completed"
                            ? "green"
                            : card.status === "canceled"
                            ? "red"
                            : "orange",
                        fontWeight: "bold",
                        width: "auto",
                        backgroundColor: "#F8F9FA",
                        border: "1px solid #CED4DA",
                        pointerEvents: "none",
                      }}
                    >
                      {card.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (char: string) => char.toUpperCase())}
                    </div>
                  ) : card.category === 2 ? (
                    // ✅ WALK-IN CATEGORY DROPDOWN
                    <select
                      id="walkinStatusSelect"
                      className="form-select ms-2"
                      value={selectedStatuss}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{
                        color:
                          selectedStatuss === "check_in"
                            ? "blue"
                            : selectedStatuss === "in_salon"
                            ? "purple"
                            : selectedStatuss === "completed"
                            ? "green"
                            : selectedStatuss === "canceled"
                            ? "red"
                            : "black",
                        fontWeight: "bold",
                        width: "auto",
                      }}
                    >
                      <option
                        value="check_in"
                        disabled={
                          selectedStatuss === "check_in" ||
                          selectedStatuss === "in_salon" ||
                          selectedStatuss === "completed" ||
                          selectedStatuss === "canceled"
                        }
                        style={{ color: "blue", fontWeight: "bold" }}
                      >
                        Check In
                      </option>
                      <option
                        value="in_salon"
                        disabled={
                          selectedStatuss === "in_salon" ||
                          selectedStatuss === "completed" ||
                          selectedStatuss === "canceled"
                        }
                        style={{ color: "purple", fontWeight: "bold" }}
                      >
                        In Salon
                      </option>
                      <option
                        value="completed"
                        disabled={selectedStatuss === "completed"}
                        style={{ color: "green", fontWeight: "bold" }}
                      >
                        Completed
                      </option>
                      <option
                        value="canceled"
                        disabled={selectedStatuss === "canceled"}
                        style={{ color: "red", fontWeight: "bold" }}
                      >
                        Canceled
                      </option>
                    </select>
                  ) : (
                    // ✅ APPOINTMENT CATEGORY DROPDOWN
                    <select
                      id="statusSelect"
                      className="form-select ms-2"
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{
                        color:
                          selectedStatus === "appointment"
                            ? "orange"
                            : selectedStatus === "completed"
                            ? "green"
                            : selectedStatus === "canceled"
                            ? "red"
                            : "black",
                        fontWeight: "bold",
                        width: "auto",
                      }}
                    >
                      <option
                        value="appointment"
                        disabled={selectedStatus === "appointment"}
                        style={{ color: "orange", fontWeight: "bold" }}
                      >
                        Appointment
                      </option>
                      {!card?.isFeatureEvent && (
                        <option
                          value="completed"
                          disabled={selectedStatus === "completed"}
                          style={{ color: "green", fontWeight: "bold" }}
                        >
                          Completed
                        </option>
                      )}
                      {!card?.isPreviousEvent && (
                        <option
                          value="canceled"
                          disabled={selectedStatus === "canceled"}
                          style={{ color: "red", fontWeight: "bold" }}
                        >
                          Canceled
                        </option>
                      )}
                    </select>
                  )}

                  {/* Shared Confirmation Modal */}
                  <AppointmentConfirmationModal
                    isOpen={isModalOpen}
                    toggle={toggleModal}
                    onConfirm={confirmStatusChange}
                    status={selectedStatus}
                    isAppointment={false}
                    isTransferBarber={false}
                    isService={false}
                    appointmentId={appointmentId}
                    showSpinner={showSpinner}
                  />
                </div>
              ) : (
                <div className="col-md-6 d-flex align-items-center justify-content-start mb-2">
                  <label className="mb-2">Status</label>
                  <div className="ms-2 text-muted">Loading...</div>
                </div>
              )}

              {/* Shared Haircut + Tip Buttons */}
              <div className="d-flex align-items-center justify-content-end mt-2 gap-2">
                <div>
                  <button
                    className="btn btn-primary mb-4"
                    data-bs-toggle="modal"
                    data-bs-target="#createboardModal"
                    onClick={handleOpen}
                    disabled={
                      !isAppointmentToday(
                        card?.appointment_date || card?.check_in_time
                      ) ||
                      card?.status === "completed" ||
                      card?.status === "canceled"
                    }
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add
                    Haircut Details
                  </button>
                </div>

                <div>
                  <Button
                    className="btn btn-primary mb-4"
                    onClick={() => setTipModalOpen(true)}
                    disabled={
                      !isAppointmentToday(
                        card?.appointment_date || card?.check_in_time
                      ) ||
                      card?.status === "completed" ||
                      card?.status === "canceled"
                    }
                  >
                    <i className="ri-cash-line align-bottom me-1"></i> Add Tip
                  </Button>
                </div>
              </div>
            </div>

            {card?.haircutDetails?.length ? (
              <TableContainer
                columns={columnss}
                data={card.haircutDetails}
                isGlobalFilter={true}
                customPageSize={10}
                divClass="table-responsive table-card"
                SearchPlaceholder="Search..."
              />
            ) : (
              <div>No Haircut Data Available</div>
            )}
          </Form>
        </ModalBody>
      </Modal>

      <Modal
        id="tipModal"
        isOpen={tipModalOpen}
        toggle={() => setTipModalOpen(false)}
        centered={true}
        backdrop="static"
      >
        <ModalHeader toggle={() => setTipModalOpen(false)}>Add Tip</ModalHeader>
        <ModalBody>
          <Col lg={12}>
            <div className="mb-3">
              <Label className="form-label" htmlFor="customTipInput">
                Enter Tip Amount
              </Label>
              <Input
                type="number"
                id="customTipInput"
                placeholder="Enter tip amount"
                value={formData.tipAmount}
                min="0"
                onChange={(e) =>
                  setFormData({ ...formData, tipAmount: e.target.value })
                }
                className={`form-control ${
                  formData.tipAmount === "" || Number(formData.tipAmount) <= 0
                    ? "is-invalid"
                    : ""
                }`}
              />
            </div>
          </Col>

          <Col lg={12}>
            <div className="d-flex justify-content-between mt-2">
              <span>
                <b>Previous Tip:</b>
              </span>
              <span>
                ${parseFloat(card?.paymentDetails?.tip || "0").toFixed(2)}
              </span>
            </div>

            <div className="d-flex justify-content-between">
              <span>
                <b>Preious Total:</b>
              </span>
              <span>
                $
                {parseFloat(card?.paymentDetails?.totalAmount || "0").toFixed(
                  2
                )}
              </span>
            </div>

            <hr />

            <div className="d-flex justify-content-between">
              <span>
                <b>New Tip:</b>
              </span>
              <span>${parseFloat(formData.tipAmount || "0").toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>
                <b>New Total:</b>
              </span>
              <span>
                $
                {(
                  parseFloat(card?.paymentDetails?.totalAmount || "0") +
                  parseFloat(formData.tipAmount || "0")
                ).toFixed(2)}
              </span>
            </div>
          </Col>

          <div className="text-end mt-3">
            <Button
              color="success"
              onClick={() => handleTipSubmit(card?.id)}
              disabled={tipSubmitting}
            >
              {tipSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </ModalBody>
      </Modal>
      <Modal
        isOpen={modall}
        toggle={handleOpen}
        centered={true}
        backdrop="static"
        size="lg"
      >
        <div className="modal-content border-0">
          <ModalHeader toggle={handleOpen}>
            {isView ? "" : "Add Haircut Details"}
          </ModalHeader>
          <ModalBody>
            <Form
              onSubmit={(e) => {
                e.preventDefault(); // ✅ prevent full page reload
                haircutFormik.handleSubmit(); // ✅ trigger formik validation and submit
              }}
            >
              <Row>
                {!isView ? (
                  <>
                    <div className="form-group mb-3">
                      <Label htmlFor="haircut_style" className="col-form-label">
                        Haircut style
                      </Label>
                      <Col lg={12}>
                        <Input
                          id="haircut_style"
                          type="text"
                          placeholder="Enter Haircut Style"
                          onChange={haircutFormik.handleChange}
                          onBlur={haircutFormik.handleBlur}
                          value={haircutFormik.values?.haircut_style}
                          className={
                            haircutFormik.touched?.haircut_style &&
                            haircutFormik.errors?.haircut_style
                              ? "is-invalid"
                              : ""
                          }
                        />
                        {haircutFormik.touched?.haircut_style &&
                          haircutFormik.errors?.haircut_style && (
                            <div className="invalid-feedback">
                              {/* {typeof formik.errors.haircut_style === "string"
                              ? formik.errors.haircut_style
                              : ""} */}
                            </div>
                          )}
                      </Col>
                    </div>
                    <div className="form-group mb-3">
                      <label className="col-form-label">Customer Note</label>
                      <Col lg={12}>
                        <textarea
                          id="customer_notes"
                          className="form-control"
                          placeholder="Enter Task Description"
                          name="customer_notes"
                          onChange={haircutFormik.handleChange}
                          onBlur={haircutFormik.handleBlur}
                          value={haircutFormik.values?.customer_notes || ""}
                        ></textarea>
                        {haircutFormik.touched?.customer_notes &&
                        haircutFormik.errors?.customer_notes ? (
                          <FormFeedback type="invalid" className="d-block">
                            {haircutFormik.errors?.customer_notes}
                          </FormFeedback>
                        ) : null}
                      </Col>
                    </div>
                    <div className="form-group mb-3">
                      <label className="col-form-label">Barber Note</label>
                      <Col lg={12}>
                        <textarea
                          id="barber_notes"
                          className="form-control"
                          placeholder="Enter Task Description"
                          name="barber_notes"
                          onChange={haircutFormik.handleChange}
                          onBlur={haircutFormik.handleBlur}
                          value={haircutFormik.values?.barber_notes || ""}
                        ></textarea>
                        {haircutFormik.touched?.barber_notes &&
                        haircutFormik.errors?.barber_notes ? (
                          <FormFeedback type="invalid" className="d-block">
                            {haircutFormik.errors?.barber_notes}
                          </FormFeedback>
                        ) : null}
                      </Col>
                    </div>
                    <div className="form-group mb-3">
                      <Label htmlFor="product_used" className="col-form-label">
                        Product Used
                      </Label>
                      <Col lg={12}>
                        <Input
                          id="product_used"
                          type="text"
                          placeholder="Enter Product Used"
                          onChange={haircutFormik.handleChange}
                          onBlur={haircutFormik.handleBlur}
                          value={haircutFormik.values?.product_used}
                          className={
                            haircutFormik.touched?.product_used &&
                            haircutFormik.errors?.product_used
                              ? "is-invalid"
                              : ""
                          }
                        />
                        {haircutFormik.touched?.product_used &&
                          haircutFormik.errors?.product_used && (
                            <div className="invalid-feedback">
                              {/* {typeof formik.errors.product_used === "string"
                                ? formik.errors.product_used
                                : ""} */}
                            </div>
                          )}
                      </Col>
                    </div>
                  </>
                ) : (
                  <div id="printArea">
                    <table
                      style={{
                        border: "1px solid black",
                        width: "100%",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            colSpan={2}
                            style={{
                              border: "1px solid black",
                              backgroundColor: "#f8f9fa",
                              textAlign: "center",
                              padding: "8px",
                            }}
                          >
                            Haircut Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            Haircut Style
                          </th>
                          <td
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            {haircutFormik.values?.haircut_style}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            Customer Note
                          </th>
                          <td
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            {haircutFormik.values?.customer_notes}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            Barber Note
                          </th>
                          <td
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            {haircutFormik.values?.barber_notes}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            Product Used
                          </th>
                          <td
                            style={{
                              border: "1px solid black",
                              textAlign: "left",
                              padding: "8px",
                            }}
                          >
                            {haircutFormik.values?.product_used}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-4">
                  <div className="hstack gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-light"
                      data-bs-dismiss="modal"
                      onClick={handleOpen}
                    >
                      Close
                    </button>
                    {isView && (
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => handlePrint()}
                      >
                        <i className="ri-printer-line"></i> Print
                      </button>
                    )}
                    {!isView ? (
                      <button
                        type="submit"
                        className="btn btn-success"
                        id="addNewBoard"
                      >
                        Save
                      </button>
                    ) : null}
                  </div>
                </div>
              </Row>
            </Form>
          </ModalBody>
        </div>
      </Modal>
    </>
  );
};

export default BarberAppointmentList;
