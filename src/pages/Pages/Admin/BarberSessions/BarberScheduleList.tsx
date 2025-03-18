import React, { useState, useEffect, useMemo, useCallback } from "react";

//redux
import {
  Col,
  Modal,
  ModalBody,
  Row,
  Label,
  Input,
  Button,
  ModalHeader,
  Form,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  FormFeedback,
  FormGroup,
  Table,
} from "reactstrap";

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, startOfWeek, isSameWeek } from "date-fns";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import {
  addBarberSession,
  updateBarberSession,
} from "Services/BarberSessionService";
import {
  fetchAvailableBarber,
  saveTransferAppointments,
} from "Services/barberService";
import { cancelAppointment } from "Services/AppointmentService";
import AppointmentConfirmationModal from "Components/Common/AppointmentStatusChange";
const today = format(new Date(), "yyyy-MM-dd");

const BarberScheduleList = ({ salonNames, onReload, BarberId }: any) => {
  // States for filters
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>(
    salonNames?.barbers || []
  );
  const [openAccordion, setOpenAccordion] = useState<string | string[]>("");
  const [newBarberSession, setNewBarberSession] = useState<BarberSessions | null>(null);
  const [isAddNew, setIsAddNew] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showTransferSpinner, setShowTransferSpinner] =
    useState<boolean>(false);
  const [modalTransfer, setModalTransfer] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isAvailableSchedule, setIsAvailableSchedule] = useState(false);
  const [dateRange, setDateRange] = useState<Date[] | null>(null); // State for date range

  const [selectedBarberAppointment, setSelectedBarberAppointment] =
    useState<any>(null);
  const [appointmentId, setAppointmentId] = useState<any>();
  const [availableAppointmentBabrers, setAvailableAppointmentBabrers] =
    useState<any>();
  const [selectedAvailableBabrer, setSelectedAvailableBabrer] = useState<any>();
  const [selectedDate, setSelectedDate] = useState(
    newBarberSession?.session_date
      ? new Date(newBarberSession.session_date)
      : new Date()
  );

  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      formik.resetForm();
    } else {
      setModal(true);
    }
  }, [modal]);

  const closeTransferModal = () => {
    setModalTransfer(!modalTransfer);
    setSelectedAvailableBabrer(null);
  };

  interface BarberSessions {
    id: number;
    BarberId: number;
    SalonId: number;
    start_time: string; // Field for availability status
    availability_status: string; // Field for availability status
    end_time: string; // Field for default service time
    session_date: string;
    reason: string;
    appointments: any;
    barber?: any; // Add this line
    isGeneralSchedule?: boolean; // Add this line
    lastBarberScheduleDate?: string; // Add this line
  }

  const reasons = [
    "personal",
    "sick",
    "family_emergency",
    "vacation",
    "training",
    "child care",
    "maternity leave",
    "bereavement",
    "appointment",
    "other",
  ];
  const toggleAccordion = (id: string) => {
    setOpenAccordion((prevState) => (prevState === id ? "" : id));
  };

  // Utility: Group schedules by weeks
  const groupSchedulesByWeeks = (schedule: { date: Date | string }[]) => {
    if (!schedule || schedule.length === 0) return [];
    // Parse and sort the schedule by date in ascending order
    const parsedSchedule = schedule
      .map((day) => ({
        ...day,
        date: day.date instanceof Date ? day.date : parseISO(day.date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const weeks: { date: Date }[][] = [];
    let currentWeek: { date: Date }[] = [];

    // Ensure the week always starts with Monday
    let currentMonday = startOfWeek(parsedSchedule[0].date, {
      weekStartsOn: 1,
    });

    parsedSchedule.forEach((day) => {
      if (isSameWeek(day.date, currentMonday, { weekStartsOn: 1 })) {
        // Add the day to the current week if it's the same week
        currentWeek.push(day);
      } else {
        // Push the completed week to the weeks array
        weeks.push(currentWeek);

        // Start a new week
        currentWeek = [day];
        currentMonday = startOfWeek(day.date, { weekStartsOn: 1 });
      }
    });

    // Push the final week if it has any days
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  };

  // Extract all unique weeks from all barbers
  const allWeeks = (): { week: number; startDate: string; endDate: string }[] => {
    // const weeks: number[] = salonNames?.barbers?.flatMap((barbr: any) =>
    //   groupSchedulesByWeeks(barbr.barber.schedule).map((_: any, weekIdx: number) => weekIdx + 1)
    // ) || [];
    // return Array.from(new Set(weeks)).sort((a, b) => a - b); // Unique and sorted weeks
    const weeksMap = new Map();

    salonNames?.barbers?.forEach((barber: any) => {
      groupSchedulesByWeeks(barber.barber.schedule).forEach((weekData: any, weekIdx: number) => {
        const weekNumber = weekIdx + 1;
        const startDate = format(weekData[0].date, 'MMMM d, yyyy'); // First entry of the week
        const endDate = format(weekData[weekData.length - 1]?.date, 'MMMM d, yyyy'); // Last entry of the week

        if (!weeksMap.has(weekNumber)) {
          weeksMap.set(weekNumber, { week: weekNumber, startDate, endDate });
        }
      });
    });

    return Array.from(weeksMap.values()).sort((a, b) => a.week - b.week);
  };

  const handleBarberSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedBarber(value === "all" ? null : value);
  };

  const handleWeekSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedWeek(value === "all" ? null : parseInt(value, 10));
  };

  // Filter and group schedules based on selected week
  const filteredSchedules = useMemo(() => {
    let data = salonNames?.barbers || [];
    if (selectedBarber) {
      data = data.filter((barbr: any) => barbr.barber.name === selectedBarber);
    }

    if (selectedWeek !== null) {
      data = data.map((barbr: any) => ({
        ...barbr,
        barber: {
          ...barbr.barber,
          schedule:
            groupSchedulesByWeeks(barbr.barber.schedule)[selectedWeek - 1] ||
            [],
        },
      }));
    }

    return data;
  }, [selectedBarber, selectedWeek, salonNames]);

  // Filter data based on selected barber and week
  useEffect(() => {
    setFilteredData(filteredSchedules);
  }, [filteredSchedules]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDateShort = (date: string | Date): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    return parsedDate.toISOString().split("T")[0];
  };
  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const setScheduleData = (data: any, barberInfo: any, isAdd?: any) => {
    setIsAddNew(isAdd);
    setNewBarberSession({
      id: data?.id,
      BarberId: barberInfo?.barber?.id,
      SalonId: salonNames?.salon?.id,
      start_time: data?.startTime,
      end_time: data?.endTime,
      session_date: data?.date,
      appointments: data?.appointments,
      availability_status: data?.availability_status,
      reason: data?.reason,
      barber: barberInfo?.barber,
      isGeneralSchedule: data?.id ? false : true,
      lastBarberScheduleDate: barberInfo.barber.schedule[barberInfo.barber.schedule.length - 1]?.date
    });
    toggle(); // Open the modal
  };

  const handleTimeChange = (type: "start_time" | "end_time", value: string) => {
    formik.setFieldValue(type, value);

    if (type === "start_time") {
      const now = new Date();
      const selectedDate = formik.values?.session_date; // Ensure this holds the selected date
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      if (!selectedDate) {
        if (value >= currentTime) {
          formik.setFieldError("start_time", ""); // Clear error if valid
        }
      }
    }
    // const updatedSchedule = [...schedule];
    // updatedSchedule[index][type] = value;
    // setSchedule(updatedSchedule);
  };

  const validateStartTime = (startTime: any, endTime: any) => {
    const selectedDate = formik.values?.session_date; // Ensure this holds the selected date
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }); // Get current time in HH:mm format

    if (!startTime) return;
    if (!selectedDate) {
      if (startTime < currentTime) {
        toast.error(
          `Start time cannot be in the past. Please select a valid time.`,
          {
            autoClose: 3000,
          }
        );
        formik.setFieldValue("start_time", "");
        return;
      }
    }

    if (
      startTime &&
      (startTime < salonNames.salon.open_time_temp ||
        startTime > salonNames.salon.close_time_temp)
    ) {
      toast.error(
        `Start time must be later than ${salonNames.startTimeAMPM} and later than end time`,
        {
          autoClose: 3000,
        }
      );
      // Optionally reset invalid time back to a valid value
      formik.setFieldValue("start_time", "");
    }
  };

  const validateEndTime = (endTime: any, startTime: any) => {
    if (
      endTime &&
      (endTime > salonNames.salon.close_time_temp || endTime < startTime)
    ) {
      toast.error(
        `End time must be earlier than ${salonNames.closeTimeAMPM} and later than start time`,
        {
          autoClose: 3000,
        }
      );
      // Optionally reset invalid time back to a valid value
      // const updatedSchedule = [...schedule];
      // updatedSchedule[index].endTime = '';
      // setSchedule(updatedSchedule);

      formik.setFieldValue("end_time", "");
    }
  };

  const handleTimeBlur = (timeType: any) => {
    const dayItem = formik.values;
    if (timeType === "start_time") {
      validateStartTime(dayItem?.start_time, dayItem?.end_time);
    } else if (timeType === "end_time") {
      validateEndTime(dayItem?.end_time, dayItem?.start_time);
    }
  };

  const sessionDateFormatted = newBarberSession?.session_date
    ? format(new Date(newBarberSession?.session_date || ""), "yyyy-MM-dd")
    : null;

  // validation
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: newBarberSession?.id ? newBarberSession?.id : 0,
      SalonId: newBarberSession?.SalonId ? newBarberSession?.SalonId : 0,
      BarberId: newBarberSession?.BarberId ? newBarberSession?.BarberId : 0,
      start_time: newBarberSession?.start_time
        ? newBarberSession?.start_time
        : "",
      availability_status: newBarberSession?.availability_status
        ? newBarberSession?.availability_status
        : "available",
      reason: newBarberSession?.reason ? newBarberSession?.reason : "",
      end_time: newBarberSession?.end_time ? newBarberSession?.end_time : "",
      session_date: newBarberSession?.session_date
        ? newBarberSession?.session_date
        : "",
    },
    validationSchema: Yup.object().shape({
      availability_status: Yup.string().required(
        "Availability status is required"
      ),
      session_date: Yup.string(),
      // session_date: !newBarberSession?.isGeneralSchedule
      //   ? Yup.string()
      //   : Yup.string()
      //     .required("Date is required"), // Add this line
      // address: Yup.string().required("Address is required"), // Add this line
      start_time: Yup.string().when("availability_status", {
        is: "available",
        then: (schema) => schema.notRequired(), // No validation, not required
        otherwise: (schema) => schema.notRequired(), // No validation, not required
      }),
      end_time: Yup.string().when("availability_status", {
        is: "available",
        then: (schema) => schema.notRequired(), // No validation, not required
        otherwise: (schema) => schema.notRequired(), // No validation, not required
      }),
    }),

    onSubmit: (values) => {
      setShowSpinner(true);
      if (isAddNew && !newBarberSession?.session_date) {
        toast.error("First select date", {
          autoClose: 3000,
        });
        setShowSpinner(false);
        return;
      }
      // Validate start_time and end_time
      if (values.start_time >= values.end_time) {
        toast.error("Start time must be earlier than end time", {
          autoClose: 3000,
        });
        setShowSpinner(false);
        return;
      }

      if (values.availability_status === "unavailable") {
        values.start_time = "";
        values.end_time = "";
      }
      if (newBarberSession?.isGeneralSchedule) {
        values.session_date = newBarberSession?.session_date
          ? format(new Date(newBarberSession?.session_date), "yyyy-MM-dd")
          : today;
      }
      if (newBarberSession?.id) {
        updateBarberSession(values.id, values)
          .then((response) => {
            toast.success("Barber schedule updated successfully", {
              autoClose: 2000,
            });
            setShowSpinner(false);
            if (onReload) {
              onReload(); // Trigger parent reload function
            }
            toggle();
          })
          .catch((error: any) => {
            // Check if the error has a response property (Axios errors usually have this)
            if (error.response && error.response.data) {
              const apiMessage = error.response.data.message; // Extract the message from the response
              toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
            } else {
              // Fallback for other types of errors
              toast.error(error.message || "Something went wrong");
            }
            setShowSpinner(false);
          });
      } else {
        const obj = {
          BarberId: values.BarberId,
          SalonId: values.SalonId,
          availableDays: [
            {
              date: values.session_date
                ? formatDateShort(values.session_date)
                : formatDateShort(today),
              startTime: values.start_time,
              endTime: values.end_time,
            },
          ],
        };

        addBarberSession(obj)
          .then((response) => {
            toast.success("Barber schedule added successfully", {
              autoClose: 2000,
            });
            setShowSpinner(false);
            if (onReload) {
              onReload(); // Trigger parent reload function
            }
            toggle();
          })
          .catch((error: any) => {
            // Check if the error has a response property (Axios errors usually have this)
            if (error.response && error.response.data) {
              const apiMessage = error.response.data.message; // Extract the message from the response
              toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
            } else {
              // Fallback for other types of errors
              toast.error(error.message || "Something went wrong");
            }
            setShowSpinner(false);
          });
      }
    },
  });

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
  };

  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  };

  const confirmAppointmentChange = async () => {
    try {
      if (appointmentId) {
        await cancelAppointment(appointmentId); // API call with appointment ID
        toast.success("Cancel appointment successfully", { autoClose: 2000 });
        setAppointmentId(null);
        if (onReload) {
          onReload(); // Trigger parent reload function
        }
        toggleConfirmModal(); // Close modal
        // Ensure selectedLeave and barber exist before modifying appointments
        if (newBarberSession && newBarberSession?.appointments) {
          const updatedAppointments = newBarberSession?.appointments.filter(
            (appointment: any) => appointment.id !== appointmentId
          );

          // Create a new barber object with updated appointments
          const updatedappointmentArray = {
            ...newBarberSession,
            appointments: updatedAppointments,
          };

          // // Update the selectedLeave object with a new reference
          // const updatedSelectedLeave = {
          //   ...selectedLeave,
          //   barber: updatedBarber,
          // };
          setNewBarberSession(updatedappointmentArray); // Update state or wherever selectedLeave is stored
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAvailableBarberChange = (event: any) => {
    setSelectedAvailableBabrer(event.target.value);
  };

  const handleDateChange = (barberInfo: any, event: any) => {
    const selectedDate = event.target.value;
    if (!newBarberSession || !newBarberSession.lastBarberScheduleDate) {
      toast.error("No available schedule date.");
      return;
    }
    if (selectedDate > newBarberSession.lastBarberScheduleDate) {
      toast.error("Selected date cannot be later than " + newBarberSession.lastBarberScheduleDate);
      return;
    }
    // if(newBarberSession?.lastBarberScheduleDate )
    formik.setFieldValue("session_date", event.target.value);
    setNewBarberSession((prev: any) => ({
      ...prev,
      session_date: event.target.value,
    }));
    // const isAvailableSchedule = barberInfo.schedule?.find((info: any) => formatDate(info.date).toString() === formatDate(event.target.value).toString() && info.is_non_working_day == false && info.is_leave_day === false);
    // setIsAvailableSchedule(isAvailableSchedule ? true : false);
    // if (isAvailableSchedule) {
    //   toast.warning("Please select another date because this barber's schedule is already available on this date.");
    // } else {
    //   formik.setFieldValue("session_date", event.target.value);
    // }
  }

  const appointmentTransfer = async () => {
    try {
      setShowTransferSpinner(true);
      const obj = {
        appointmentId: selectedBarberAppointment.id,
        newBarberId: parseInt(selectedAvailableBabrer),
      };
      const data = await saveTransferAppointments(obj);
      setShowTransferSpinner(false);
      setModalTransfer(!modalTransfer);
      if (data) {
        toast.success("Transfer barber successfully", { autoClose: 2000 });
      }
      // Ensure selectedLeave and barber exist before modifying appointments
      if (newBarberSession && newBarberSession?.appointments) {
        const updatedAppointments = newBarberSession?.appointments.filter(
          (appointment: any) => appointment.id !== selectedBarberAppointment.id
        );

        // Create a new barber object with updated appointments
        const updatedappointmentArray = {
          ...newBarberSession,
          appointments: updatedAppointments,
        };

        // // Update the selectedLeave object with a new reference
        // const updatedSelectedLeave = {
        //   ...selectedLeave,
        //   barber: updatedBarber,
        // };
        setNewBarberSession(updatedappointmentArray); // Update state or wherever selectedLeave is stored
      }
    } catch (error: any) {
      setShowTransferSpinner(false);
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
//   const lastSchedule = barbers?.barber?.schedule?.length
//   ? barbers.barber.schedule[barbers.barber.schedule.length - 1]
//   : null;

// // Default start date = Next day after last scheduled date
// const defaultStartDate = lastSchedule ? new Date(lastSchedule.date) : new Date();
// defaultStartDate.setDate(defaultStartDate.getDate() + 1); // Move to the next day
useEffect(() => {
  
  if (BarberId?.schedule?.length) {
    const lastSchedule = BarberId.schedule[BarberId.schedule.length - 1];
    const defaultStartDate = new Date(lastSchedule.date);
    defaultStartDate.setDate(defaultStartDate.getDate() + 1); // Move to next day

    setDateRange([defaultStartDate]); // Set default start date
  }
}, [BarberId]);
  return (
    <React.Fragment>
      <Row className="g-3">
        <Col lg={6}>
          {/* Barber Filter */}
          <div className="mb-3">
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
          </div>
        </Col>
        <Col lg={6}>
          {/* Week Filter */}
          <div className="mb-3">
            <label className="form-label">Select Week:</label>
            <select
              className="form-select"
              value={selectedWeek || "all"}
              onChange={handleWeekSelect}
            >
              <option value="all">All Weeks</option>
              {allWeeks().map(({ week, startDate, endDate }) => (
                <option key={`week-option-${week}`} value={week}>
                  Week {week} ({startDate} - {endDate})
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>
      <div>
        <Accordion open={openAccordion} toggle={toggleAccordion}>
          {/* Filtered Data Display */}
          {filteredData.map((barbr: any, idx: any) => (
            <AccordionItem key={`barber-${idx}`} id={`${idx}`}>
              <AccordionHeader targetId={`${idx}`}>
                <div className="d-flex align-items-center justify-content-between w-100 pe-5">
                  <h5 className="mb-0">{barbr.barber.name}</h5>
                  <div className="d-flex align-items-center">
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
                  <div className="mb-4 d-flex flex-column flex-sm-row align-items-center justify-content-between">
                    <h6 className="mb-3 text-muted">Weekly Schedule:</h6>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setScheduleData(null, barbr, true);
                      }}
                    >
                      <i className="ri-add-circle-line me-1"></i> Add Schedule
                    </button>
                  </div>
                  {barbr.barber?.schedule?.length > 0 ? (
                    groupSchedulesByWeeks(barbr.barber.schedule).map(
                      (week: any[], weekIdx: number) => (
                        <div key={`week-${idx}-${weekIdx}`} className="mb-4">
                          {/* Week Heading */}
                          <div className="bg-primary text-white p-3 rounded shadow-sm mb-4 d-flex flex-column flex-sm-row align-items-center">
                            <h5 className="mb-2 mb-sm-0 me-sm-auto text-white">
                              {selectedWeek
                                ? selectedWeek === 1
                                  ? "Current Week"
                                  : `Week ${selectedWeek}`
                                : weekIdx === 0
                                ? "Current Week"
                                : `Week ${weekIdx + 1}`}
                            </h5>
                            <span className="badge bg-light text-dark">
                              Schedule Overview
                            </span>
                          </div>

                          {/* Week Days */}
                          <div className="row">
                            {week.map((day: any, dayIdx: number) => (
                              <div
                                key={`day-${idx}-${weekIdx}-${dayIdx}`}
                                className="col-md-6 col-lg-4 mb-3"
                              >
                                {day.id ? (
                                  // Existing day card
                                  <div
                                    className="border p-3 rounded bg-light shadow-sm position-relative"
                                    style={{ minHeight: "121px" }}
                                  >
                                    {/* Icon in the top-right corner */}
                                    <div
                                      className="position-absolute"
                                      style={{
                                        top: "10px",
                                        right: "10px",
                                        zIndex: 1,
                                      }}
                                      onClick={() => {
                                        setScheduleData(day, barbr);
                                      }}
                                    >
                                      <i
                                        className="ri-edit-box-line text-primary"
                                        style={{ fontSize: "22px" }}
                                      ></i>
                                    </div>
                                    {/* Day Content */}
                                    <h6 className="text-primary mb-2">
                                      {day.day}
                                    </h6>
                                    <p className="mb-1">
                                      <b>Date:</b>{" "}
                                      {format(day.date, "MMMM d, yyyy")}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="badge bg-success">
                                        {formatTime(day.startTime)}
                                      </span>
                                      <span className="badge bg-danger">
                                        {formatTime(day.endTime)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  // Missing day card with + button
                                  <div className="border p-3 rounded bg-light shadow-sm position-relative">
                                    <h6 className="text-secondary mb-2">
                                      {day.day}
                                    </h6>
                                    <p className="text-muted">
                                      <b>Date:</b>{" "}
                                      {format(day.date, "MMMM d, yyyy")}
                                    </p>
                                    <div
                                      className="position-absolute"
                                      style={{
                                        top: "10px",
                                        right: "10px",
                                        zIndex: 1,
                                      }}
                                    >
                                      <span
                                        className={`${
                                          day?.is_non_working_day
                                            ? "badge bg-primary"
                                            : "badge bg-info"
                                        }`}
                                      >
                                        {day?.is_non_working_day
                                          ? "Non working day"
                                          : "Leave Day"}
                                      </span>
                                    </div>
                                    <button
                                      className="btn btn-sm btn-outline-primary w-100"
                                      onClick={() => {
                                        setScheduleData(day, barbr);
                                      }}
                                    >
                                      <i className="ri-add-circle-line me-1"></i>{" "}
                                      Add Schedule
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center text-muted">No data found</div>
                  )}
                </div>
              </AccordionBody>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Modal
        isOpen={modal}
        toggle={toggle}
        centered
        backdrop="static"
        size="lg"
      >
        <ModalHeader toggle={toggle}>
          {newBarberSession?.id ? "Update" : "Add"} Barber Schedule
        </ModalHeader>
        <Form className="tablelist-form" onSubmit={formik.handleSubmit}>
          <ModalBody className="modal-body">
            <Row className="g-3">
              {(storeRoleInfo.role_name === "Admin" ||
                storeRoleInfo.role_name === "Salon Manager") && (
                <Col lg={4}>
                  <div>
                    <Label htmlFor="salon" className="form-label">
                      Salon
                    </Label>
                  </div>
                  <b className="text-muted"> {salonNames?.salon?.name}</b>
                </Col>
              )}
              {/* Barber ID */}
              {(storeRoleInfo.role_name === "Admin" ||
                storeRoleInfo.role_name === "Salon Manager") && (
                <Col lg={4}>
                  <div>
                    <Label htmlFor="salon" className="form-label">
                      Barber
                    </Label>
                  </div>
                  <b className="text-muted">
                    {" "}
                    {newBarberSession?.barber?.name}{" "}
                  </b>
                </Col>
              )}
              <Col lg={4}>
                {isAddNew ? (
                  <div className="mb-3">
                    <Label htmlFor="session_date" className="form-label">
                      Date
                    </Label>
                    <Input
                      type="date"
                      id="session_date"
                      name="session_date"
                      value={formik.values.session_date}
                      onChange={(event) => {
                        handleDateChange(newBarberSession?.barber, event);
                      }}
                      onBlur={formik.handleBlur}
                      min={today} // Disable future dates
                      className={
                        formik.touched.session_date &&
                          formik.errors.session_date
                          ? "is-invalid"
                          : ""
                      }
                    />
                    {formik.touched.session_date &&
                      formik.errors.session_date && (
                        <div className="invalid-feedback">
                          {typeof formik.errors.session_date === "string"
                            ? formik.errors.session_date
                            : ""}
                        </div>
                      )}
                  </div>
                ) : (
                  <><div>
                    <Label htmlFor="salon" className="form-label">
                      Date
                    </Label>
                  </div><b className="text-muted"> {newBarberSession?.session_date ? format(newBarberSession?.session_date, 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy')} </b></>
                )}

              </Col>
            </Row>
            {newBarberSession?.id && (
              <Row className="mt-3">
                {/* Availability Status */}
                <Col lg={12}>
                  <FormGroup>
                    <Label for="availability_status">Availability Status</Label>
                    <Input
                      type="select"
                      id="availability_status"
                      value={formik.values.availability_status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={
                        formik.touched.availability_status &&
                        !!formik.errors.availability_status
                      }
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </Input>
                    {formik.touched.availability_status &&
                      formik.errors.availability_status && (
                        <FormFeedback>
                          {formik.errors.availability_status}
                        </FormFeedback>
                      )}
                  </FormGroup>
                </Col>
              </Row>
            )}
            {/* Conditionally Render Start Time and End Time Fields */}
            {formik.values.availability_status === "available" && (
              <Row className={`${newBarberSession?.id ? "" : "mt-3"}`}>
                <Col lg={6}>
                  <FormGroup>
                    <Label for="start_time">Start Time</Label>
                    <Input
                      type="time"
                      id="start_time"
                      value={formik.values.start_time}
                      onChange={(e) =>
                        handleTimeChange("start_time", e.target.value)
                      }
                      onBlur={() => handleTimeBlur("start_time")} // Validate onBlur
                      invalid={
                        formik.touched.start_time && !!formik.errors.start_time
                      }
                    />
                    {formik.touched.start_time && formik.errors.start_time && (
                      <FormFeedback>{formik.errors.start_time}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col lg={6}>
                  <FormGroup>
                    <Label for="end_time">End Time</Label>
                    <Input
                      type="time"
                      id="end_time"
                      value={formik.values.end_time}
                      onChange={(e) =>
                        handleTimeChange("end_time", e.target.value)
                      }
                      onBlur={() => handleTimeBlur("end_time")} // Validate onBlur
                      invalid={
                        formik.touched.end_time && !!formik.errors.end_time
                      }
                    />
                    {formik.touched.end_time && formik.errors.end_time && (
                      <FormFeedback>{formik.errors.end_time}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              </Row>
            )}

            {/* Reason */}
            {sessionDateFormatted !== today && newBarberSession?.id && (
              <Row>
                <Col lg={12}>
                  <FormGroup>
                    <Label for="reason">Reason for Leave</Label>
                    <Input
                      type="select"
                      name="reason"
                      id="reason"
                      value={formik.values.reason}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={formik.touched.reason && !!formik.errors.reason}
                    >
                      <option value="">Select Reason</option>
                      {reasons.map((reason, index) => (
                        <option key={index} value={reason}>
                          {reason.replace(/_/g, " ").toUpperCase()}{" "}
                          {/* Format enum value */}
                        </option>
                      ))}
                    </Input>
                    {formik.touched.reason && formik.errors.reason && (
                      <FormFeedback>{formik.errors.reason}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              </Row>
            )}
            {newBarberSession?.id && (
              <div>
                <div className="mt-2">
                  <p>
                    <strong>Appointments</strong>
                  </p>
                  <div className="table-responsive table-card mb-3">
                    <Table hover className="align-middle table-nowrap mb-0">
                      <thead className="table-light text-muted">
                        <tr>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Services</th>
                          <th>Start Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newBarberSession?.appointments?.length > 0 ? (
                          newBarberSession?.appointments.map((row: any) => {
                            return (
                              <tr key={row.id}>
                                <td>{row.customer_name}</td>
                                <td>{row.mobile_number}</td>
                                <td>
                                  {row.services?.length > 0 ? (
                                    row.services.map(
                                      (element: any, idx: any) => (
                                        <span>
                                          {" "}
                                          {idx > 0 && <span>,</span>}{" "}
                                          {element.name}
                                        </span>
                                      )
                                    )
                                  ) : (
                                    <span className="text-muted">
                                      <i>No services found</i>
                                    </span>
                                  )}
                                </td>
                                <td>{formatTime(row.start_time)}</td>
                                <td>
                                  <Button
                                    color="btn btn-sm btn-primary me-2"
                                    size="sm"
                                    onClick={() =>
                                      handleAppointmentDetails(row)
                                    }
                                  >
                                    Transfer
                                  </Button>
                                  <Button
                                    color="btn btn-sm btn-danger"
                                    size="sm"
                                    onClick={() =>
                                      cancelAppointmentDetails(row)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-3">
                              No Data Available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <div className="modal-footer">
            <div className="gap-2 hstack justify-content-end w-100">
              <div className="hstack gap-2 justify-content-end">
                <Button
                  type="button"
                  onClick={() => {
                    toggle();
                  }}
                  className="btn-light"
                >
                  Close
                </Button>
                <button
                  type="submit"
                  className="btn btn-success"
                  id="add-btn"
                  disabled={showSpinner || isAvailableSchedule} // Disable button when loader is active
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
        </Form>
      </Modal>
      {modalTransfer && (
        <Modal
          isOpen={modalTransfer}
          toggle={closeTransferModal}
          centered
          backdrop="static"
          size="lg"
        >
          <ModalHeader toggle={closeTransferModal}>
            Transfer Appointment
          </ModalHeader>
          <ModalBody className="modal-body">
            <Row className="g-3">
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Salon:{" "}
                    <b className="text-muted"> {salonNames?.salon?.name}</b>
                  </Label>
                </div>
              </Col>
              {/* Barber ID */}
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Barber:{" "}
                    <b className="text-muted">
                      {" "}
                      {newBarberSession?.barber?.name}{" "}
                    </b>
                  </Label>
                </div>
              </Col>
            </Row>
            <Row className="g-3">
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Appointment Start Time:{" "}
                    <b className="text-muted">
                      {" "}
                      {formatTime(selectedBarberAppointment?.start_time)}
                    </b>
                  </Label>
                </div>
              </Col>
              {/* Barber ID */}
              <Col lg={6}>
                <div>
                  <Label htmlFor="salon" className="form-label">
                    Appointment End Time:{" "}
                    <b className="text-muted">
                      {" "}
                      {formatTime(selectedBarberAppointment?.end_time)}{" "}
                    </b>
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
                  <Input
                    type="select"
                    name="reason"
                    id="reason"
                    value={selectedAvailableBabrer}
                    onChange={handleAvailableBarberChange}
                  >
                    <option value="">Select Barber</option>
                    {availableAppointmentBabrers?.availableBarbers?.map(
                      (appointment: any, index: any) => (
                        <option key={index} value={appointment.id}>
                          {appointment.name} {/* Format enum value */}
                        </option>
                      )
                    )}
                  </Input>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <div className="modal-footer">
            <div className="gap-2 hstack justify-content-end w-100">
              <div className="hstack gap-2 justify-content-end">
                <Button
                  type="button"
                  onClick={closeTransferModal}
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
                  disabled={showTransferSpinner || !selectedAvailableBabrer} // Disable button when loader is active
                >
                  {showTransferSpinner && (
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
        onConfirm={confirmAppointmentChange} // Pass the confirm function with appointmentId
        status={""}
        isAppointment={true}
        isTransferBarber={false}
        isService={false}
        appointmentId={appointmentId} // Pass appointmentId to modal
      />
      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default BarberScheduleList;
