import React, { useState, useEffect, useMemo, useCallback } from "react";
import TableContainer from "../../../../Components/Common/TableContainer";
import Select from "react-select";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import {
  fetchAppointments,
  createAppointment,
  deleteAppointment,
} from "../../../../Services/AppointmentService";

//redux
import { useSelector, useDispatch } from "react-redux";
import {
  Col,
  Modal,
  ModalBody,
  Row,
  Label,
  Input,
  Button,
  ModalHeader,
  FormFeedback,
  Form,
  Spinner,
} from "reactstrap";
import { Status } from "./AppointmentListCol";

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

import Loader from "../../../../Components/Common/Loader";
import { createSelector } from "reselect";

import avatar1 from "../../../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../../../assets/images/users/avatar-3.jpg";
import avatar5 from "../../../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../../../assets/images/users/avatar-8.jpg";
import avatar10 from "../../../../assets/images/users/avatar-10.jpg";
import { fetchServices } from "Services/Service";
import { Service } from "Services/type";
import {
  fetchBarberSession,
  getBarberSessionByBarber,
} from "Services/BarberSessionService";
import { fetchSalons } from "Services/SalonService";
import {
  formatDate,
  formatHours,
  otherFormatDate,
} from "Components/Common/DateUtil";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "slices/layouts/toastService";
import { toast } from "react-toastify";
import { ROLES } from "common/data/Constants";
import { strictNameValidation } from "Components/Common/Namevalidation";

const Assigned = [
  { id: 1, imgId: "anna-adame", img: avatar1, name: "Anna Adame" },
  { id: 2, imgId: "frank-hook", img: avatar3, name: "Frank Hook" },
  { id: 3, imgId: "alexis-clarke", img: avatar6, name: "Alexis Clarke" },
  { id: 4, imgId: "herbert-stokes", img: avatar2, name: "Herbert Stokes" },
  { id: 5, imgId: "michael-morris", img: avatar7, name: "Michael Morris" },
  { id: 6, imgId: "nancy-martino", img: avatar5, name: "Nancy Martino" },
  { id: 7, imgId: "thomas-taylor", img: avatar8, name: "Thomas Taylor" },
  { id: 8, imgId: "tonya-noble", img: avatar10, name: "Tonya Noble" },
];

const AppointmentTable: React.FC = () => {
  const [appointmentData, setAppointmentData] = useState<[]>([]);
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);

  const [salonData, setSalonData] = useState<Salon[]>([]);
  const [selectedSearchText, selectedSearch] = useState<null>();
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [tipPercentage, setTipPercentage] = useState<any>(null);
  const [customTip, setCustomTip] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);

  const [showLoader, setShowLoader] = useState(true);
  const dispatch: any = useDispatch();
  const [selectedOptions, setSelectedOptions] = useState([]);

  // const selectLayoutState = (state: any) => state.Tasks;
  // const selectLayoutProperties = createSelector(selectLayoutState, (state) => ({
  //   taskList: state.taskList,
  //   isTaskSuccess: state.isTaskSuccess,
  //   error: state.error,
  //   isTaskAdd: state.isTaskAdd,
  //   isTaskAddFail: state.isTaskAddFail,
  //   isTaskDelete: state.isTaskDelete,
  //   isTaskDeleteFail: state.isTaskDeleteFail,
  //   isTaskUpdate: state.isTaskUpdate,
  //   isTaskUpdateFail: state.isTaskUpdateFail,
  // }));

  // // Inside your component
  // const { taskList, isTaskSuccess, error } = useSelector(
  //   selectLayoutProperties
  // );

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [appointment, setAppointment] = useState<any>([]);
  const [barberSessionsData, setBarberSessionsData] = useState<any>(null);

  // Delete Task
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
  const [isAppointmentAvailable, setIsAppointmentAvailable] =
    useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);
  const [selectedTotalServiceTime, setTotalServiceTime] = useState<
    number | null
  >(0);
  const [selectedStartDate, setStartDate] = useState<any>(new Date());
  const [selectedEndDate, setEndDate] = useState<any>(new Date());
  const [selectedStatus, setStatus] = useState<any>("");
  const [isBarberModalOpen, setIsBarberModalOpen] = useState(false);

  const [selectedBarber, setSelectedBarber] = useState<any | null>(null);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(0);

  const [showBarberSpinner, setShowBarberSpinner] = useState<boolean>(false);
  let salonDetails = localStorage.getItem("salonDetails");
  let storesalonDetailInfo: any;
  if (salonDetails) {
    storesalonDetailInfo = JSON.parse(salonDetails);
  }
  const limit = 10; // Items per page
  const userCategory = localStorage.getItem("userCategory");
  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  let salonUserInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  const authSalonUser: any = localStorage.getItem("authSalonUser");
  if (authSalonUser) {
    salonUserInfo = JSON.parse(authSalonUser);
  }

  const authTUser = localStorage.getItem("authUser");
  let storeUserInfo: any;
  if (authTUser) {
    storeUserInfo = JSON.parse(authTUser);
  }
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setAppointment(null);
      setSelectedOptions([]);
      setBarberSessionsData([]);
      formik.resetForm();
      if (
        storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
        storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
        storesalonDetailInfo
      ) {
        formik.setFieldValue(
          "salon_id",
          storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo.id
        );
        getBarberSessionsData(
          storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo.id
        );
      }
      if (userCategory === ROLES.WALKIN_BARBER) {
        if (storeUserInfo.berber) {
          formik.setFieldValue("salon_id", storeUserInfo.berber.SalonId);
          formik.setFieldValue("barber_id", storeUserInfo.berber.id);
          setIsAppointmentAvailable(true);
        }
      }
    } else {
      setModal(true);
    }
  }, [modal]);

  const handleServiceChange = (selected: any) => {
    setSelectedOptions(selected);
    const totalServiceTime = selected?.reduce(
      (sum: any, item: any) => sum + item.default_service_time,
      0
    );
    setTotalServiceTime(totalServiceTime);
    const valuesArray = selected.map((serv: any) => parseInt(serv.value, 10));
    formik.setFieldValue("service_ids", valuesArray);
    if (totalServiceTime > 0) {
      getBarberScheduleData(selectedBarberId, totalServiceTime, selected);
    } else {
      showWarningToast("Please first select atleast one service!!!");
      setIsAppointmentAvailable(false);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#cce5ff", // Change background color of selected options
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#0056b3", // Change text color of selected options
      fontWeight: "500",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#0056b3",
      ":hover": {
        backgroundColor: "#d1ecf1",
        color: "#004085",
      },
    }),
  };

  interface Salon {
    salon_id: number;
    salon_name: string;
    availability_status: string; // Field for availability status
    photos: number; // Field for default service time
    creappointment_countted_at: string;
    address: string; // Fixed typo here
    barbers?: object; // Add this line
  }

  interface BarberSessions {
    id: number;
    BarberId: number;
    SalonId: number;
    start_time: string; // Field for availability status
    end_time: string; // Field for default service time
    remaining_time: string;
    barber?: object; // Add this line
  }

  interface User {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    address: string;
    mobile_number?: string;
    email: string;
    google_token?: string;
    apple_token?: string;
    password?: string;
    RoleId: string;
    created_at: string;
    SalonId: number;
    profile_photo?: string;
  }

  // const formatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid
  //   const date = new Date(dateString);
  //   // Get the user's current timezone
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     day: '2-digit',
  //     month: '2-digit',
  //     timeZone: userTimeZone, // Automatically adapts to the user's location
  //   };

  //   // Get formatted date
  //   const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date); // en-CA ensures YYYY-MM-DD format

  //   // Replace slashes with dashes to ensure YYYY-MM-DD format
  //   return formattedDate.replace(/\//g, '-');
  // };
  // const otherFormatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid

  //   const date = new Date(dateString);
  //   if (isNaN(date.getTime())) return ""; // Return an empty string if date is invalid

  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");

  //   return `${year}-${month}-${day}`;
  // };
  // const formatHours = (timeString: string) => {
  //   const padZero = (num: number) => String(num).padStart(2, "0");

  //   // Split the time string into hours, minutes, and seconds
  //   const [hoursStr, minutesStr] = timeString.split(":");

  //   let hours = parseInt(hoursStr, 10);
  //   const minutes = padZero(parseInt(minutesStr, 10));
  //   const ampm = hours >= 12 ? "PM" : "AM";

  //   // Convert to 12-hour format
  //   hours = hours % 12 || 12;

  //   return `${padZero(hours)}:${minutes} ${ampm}`;
  // };

  useEffect(() => {
    if (
      storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
      storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
      storesalonDetailInfo
    ) {
      formik.setFieldValue(
        "salon_id",
        storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo.id
      );
      getBarberSessionsData(
        storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo.id
      );
    }
    if (userCategory === ROLES.WALKIN_BARBER) {
      if (storeUserInfo.berber) {
        formik.setFieldValue("salon_id", storeUserInfo.berber.SalonId);
        formik.setFieldValue("barber_id", storeUserInfo.berber.id);
        setIsAppointmentAvailable(true);
      }
    }
    fetchAppointmentList(
      1,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      2,
      ""
    );

    const fetchSalonsList = async () => {
      try {
        const response: any = await fetchSalons(1, null, null);
        setSalonData(response?.salons);
      } catch (error: any) {
        // Check if the error has a response property (Axios errors usually have this)
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
        } else {
          // Fallback for other types of errors
          showErrorToast(error.message || "Something went wrong");
        }
      }
    };

    fetchSalonsList();
    fetchServiceList();
  }, []);

  const getBarberSessionsData = async (salonId: any) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();

      const response = await fetchBarberSession(salonId);

      if (response?.length > 0) {
        const salon = response[0].salon;

        const openTime = new Date(`${today}T${salon.open_time}`);
        const closeTime = new Date(`${today}T${salon.close_time}`);

        // Check if salon is open 
        const isSalonOpen = now >= openTime && now < closeTime;

        if (!isSalonOpen) {
          setBarberSessionsData([]); // salon is closed
          setIsAppointmentAvailable(false);
          return;
        }

        const formattedBarbers = response[0].barbers
          .filter((brbr: any) => {
            return (
              brbr.barber.category === 2 &&
              brbr.barber.availability_status === "available" &&
              brbr.barber.schedule?.some((session: any) => {
                const sessionDate = session.date;
                if (
                  sessionDate !== today ||
                  !session.startTime ||
                  !session.endTime
                )
                  return false;

                const start = new Date(`${sessionDate}T${session.startTime}`);
                const end = new Date(`${sessionDate}T${session.endTime}`);

                // ✅ Ensure session is live AND within salon time
                return (
                  now >= start &&
                  now < end &&
                  start >= openTime &&
                  end <= closeTime
                );
              })
            );
          })
          .flatMap((brbr: any) =>
            brbr.barber.schedule
              .filter((session: any) => {
                const sessionDate = session.date;
                if (
                  sessionDate !== today ||
                  !session.startTime ||
                  !session.endTime
                )
                  return false;

                const start = new Date(`${sessionDate}T${session.startTime}`);
                const end = new Date(`${sessionDate}T${session.endTime}`);

                // ✅ Ensure session is live AND within salon time
                return (
                  now >= start &&
                  now < end &&
                  start >= openTime &&
                  end <= closeTime
                );
              })
              .map((session: any) => ({
                id: brbr.barber.id,
                name: brbr.barber.name,
                start_time: session.startTime,
                end_time: session.endTime,
                availability_status: brbr.barber.availability_status,
                estimated_wait_time: brbr.barber.estimated_wait_time,
                services: brbr.barber.servicesWithPrices || [],
                barberInfo: brbr.barber,
              }))
          );

        setBarberSessionsData(formattedBarbers);
      } else {
        setBarberSessionsData([]);
        setIsAppointmentAvailable(false);
      }
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      showErrorToast(apiMessage || error.message || "Something went wrong");
    } finally {
      setShowBarberSpinner(false);
      setShowLoader(false);
    }
  };

  const fetchAppointmentList = async (
    page: any,
    startDate: any,
    endDate: any,
    status: any,
    category: any,
    search: any
  ) => {
    try {
      const response: any = await fetchAppointments(
        page === 0 ? 1 : page,
        limit,
        otherFormatDate(startDate),
        otherFormatDate(endDate),
        status ? status : "",
        category,
        search
      );
      // setCurrentPage(response?.currentPage ? parseInt(response?.currentPage) : 1);
      const appointments = response.appointments.map((usr: any) => {
        usr.fullname = usr.User.firstname + " " + usr.User.lastname;
        return usr;
      });
      const sortedAppointents = appointments.sort(
        (a: any, b: any) =>
          new Date(a.check_in_time).getTime() -
          new Date(b.check_in_time).getTime()
      );

      setTotalItems(response?.totalItems);
      setTotalPages(response?.totalPages);
      setAppointmentData(sortedAppointents);
      if (appointmentData?.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 500); // Hide loader after 5 seconds
        return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
      } else {
        setShowLoader(false); // Immediately hide loader if data is available
      }
    } catch (error: any) {
      // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        showErrorToast(error.message || "Something went wrong");
      }
    }
  };

  const fetchServiceList = async () => {
    try {
      const response: any = await fetchServices();
      const activeServices = response?.filter(
        (serv: any) => serv.isActive === true
      );
      setServiceData(activeServices);
      if (activeServices?.length > 0) {
        const info = activeServices.map((ser: any) => ({
          value: ser.id.toString(), // Example: "apple"
          label: `${ser.name} - $${ser.min_price} - $${ser.max_price} (${ser.default_service_time} min.)`,
          name: `${ser.name}`,
          min_price: `${ser.min_price}`,
          price: ser.price,
          default_service_time: ser.default_service_time,
          // Example: "Apple"
        }));
        setServiceOptions(info);
      }
    } catch (error: any) {
      // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        showErrorToast(error.message || "Something went wrong");
      }
    }
  };

  // Delete Data
  const handleDeleteTask = () => {
    if (appointment) {
      dispatch(deleteAppointment(appointment.id));
      setDeleteModal(false);
    }
  };

  const handlePhoneChange = (e: any) => {
    // Remove non-digit characters and limit to 10 digits
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);

    // Format the phone number
    const formattedPhone = formatPhoneNumber(cleaned);

    // Update the form state with the formatted phone number
    formik.setFieldValue("mobile_number", formattedPhone);
  };

  const formatPhoneNumber = (value: string): string => {
    // Match groups for the USA phone number pattern
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    // If incomplete, return unformatted
    return value;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digit keys, backspace, delete, and navigation keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };
  const handleTipChange = (e: any) => {
    const value = e.target.value;
    setTipPercentage(value);
    setCustomTip("");
    calculateFinalAmount(totalPrice, value !== "custom" ? value : "", "");
  };

  // const handleCustomTipChange = (e: any) => {
  //   const value = e.target.value;
  //   setCustomTip(value);
  //   calculateFinalAmount(totalPrice, "custom", value);
  // };

  const handleCustomTipChange = (e: any) => {
    // const value = e.target.value;
    // setCustomTip(value);
    // calculateFinalAmount(totalPrice, "custom", value);

    const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters

    if (value.length <= 4) {
      setCustomTip(value);
      setIsInvalid(false);
      calculateFinalAmount(totalPrice, "custom", value);
    } else {
      setIsInvalid(true);
    }
  };

  const calculateFinalAmount = (total: any, tip: any, custom: any) => {
    if (!tip || tip === null) {
      setFinalAmount(total); // No tip, just use total
      return;
    }

    let tipAmount =
      tip === "custom"
        ? parseFloat(custom || 0)
        : (total * parseFloat(tip)) / 100;
    setTipAmount(tipAmount);
    setFinalAmount(total + tipAmount);
  };

  const preventSpaceKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };
const emailValidationRegex = /^(?=.{5,50}$)[a-z0-9._%+-]{3,}@[a-z0-9.-]{3,}\.[a-z]{2,}$/;
  // validation
  const formik = useFormik({
    initialValues: {
      salon_id: 0,
      service_ids: [],
      barber_id: 0,
      firstname: "",
      lastname: "",
      number_of_people: 1,
      email: "",
      mobile_number: "",
      address: "",
    },
    validationSchema: Yup.object({
      salon_id:
        storeRoleInfo?.role_name === ROLES.ADMIN
          ? Yup.number()
          : Yup.number().required("Salon is required"), // Add this line
      barber_id:
        userCategory === ROLES.WALKIN_BARBER
          ? Yup.number()
          : Yup.number().required("Barber is required"), // Add this line
      firstname: strictNameValidation.required("First name is required"),
      lastname: strictNameValidation.required("Last name is required"),
      email: Yup.string()
        .matches(emailValidationRegex, "Enter valid email!!")
        .email("Invalid email")
        .required("Email is required"),
      mobile_number: Yup.string()
        .matches(
          /^(?:\(\d{3}\)\s?|\d{3}-?)\d{3}-?\d{4}$/,
          "Mobile number must be a valid 10-digit format"
        )
        .required("Mobile number is required"),
    }),
    onSubmit: async (values) => {
      setShowSpinner(true);
      try {
        // Convert mobile number to Indian format
        const rawMobileNumber = values.mobile_number.replace(/[^\d]/g, ""); // Remove non-numeric characters
        const indianMobileNumber = `+91${rawMobileNumber.slice(-10)}`; // Format as +91XXXXXXXXXX

        const processedValues = {
          ...values,
          mobile_number: indianMobileNumber, // Replace the original mobile number with the Indian format
          payment_mode: "Pay_In_Person",
          tip: tipAmount,
        };
        const response = await createAppointment(processedValues);
        showSuccessToast("Appointment created successfully", {
          autoClose: 2000,
        });
        setTotalPrice(0);
        setFinalAmount(0);
        setTipPercentage(null);
        setTipAmount(0);
        setCustomTip("");
        toggle(); // Close the form/modal
      } catch (error: any) {
        // Error handling
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message;
          showErrorToast(apiMessage || "An error occurred");
        } else {
          showErrorToast(error.message || "Something went wrong");
        }
      } finally {
        setShowSpinner(false);
      }
    },
  });

  // Update Data
  const handleCustomerClick = useCallback(
    (arg: any) => {
      const appointment = arg;

      setAppointment({
        id: appointment.id,
        firstname: appointment.firstname,
        lastname: appointment.lastname,
        number_of_people: appointment.number_of_people,
        email: appointment.email,
        mobile_number: appointment.mobile_number,
        address: appointment.address,
      });

      setIsEdit(true);
      toggle();
    },
    [toggle]
  );

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".taskCheckBox");

    if (checkall.checked) {
      ele.forEach((ele: any) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele: any) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

  const deleteMultiple = () => {
    const checkall: any = document.getElementById("checkBoxAll");
    selectedCheckBoxDelete.forEach((element: any) => {
      dispatch(deleteAppointment(element.value));
      setTimeout(() => {
        toast.clearWaitingQueue();
      }, 3000);
    });
    setIsMultiDeleteButton(false);
    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".taskCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const columns = useMemo(
    () => [
      {
        header: "Full Name",
        accessorKey: "name",
        cell: (cell: any) => {
          return cell.getValue() ? cell.getValue() : "Unknown"; // Fallback if the barber is not found
        },
        enableColumnFilter: false,
      },
      {
        header: "Barber Name",
        accessorKey: "Barber.name",
        cell: (cell: any) => {
          return cell.getValue() ? cell.getValue() : "Unknown"; // Fallback if the barber is not found
        },
        enableColumnFilter: false,
      },
      {
        header: "Salon Name",
        accessorKey: "salon.name",
        enableColumnFilter: false,
      },
      {
        header: "Services",
        accessorKey: "services",
        enableColumnFilter: false,
        cell: ({ row }: any) => {
          return row.original.Services?.map(
            (service: any) =>
              `${service.name} (${service.default_service_time} min.)`
          ).join(", ");
        },
      },
      {
        header: "Available Time",
        accessorKey: "availabe_time",
        enableColumnFilter: false,
        cell: ({ row }: { row: { original: { Barber: any } } }) => {
          const date = new Date(); // Current date and time
          const options: Intl.DateTimeFormatOptions = { weekday: "long" };
          const dayName = date.toLocaleDateString("en-US", options);
          const scheduleArray = Object.keys(
            row.original.Barber?.weekly_schedule
          ).map((day: any) => ({
            day,
            startTime: row.original.Barber.weekly_schedule[day].start_time,
            endTime: row.original.Barber.weekly_schedule[day].end_time,
          }));
          const todayScheduleInfo = scheduleArray.find(
            (info: any) => info.day === dayName.toLowerCase()
          );
          return `${
            todayScheduleInfo &&
            todayScheduleInfo.startTime &&
            todayScheduleInfo.endTime
              ? `${formatHours(todayScheduleInfo.startTime)} to ${formatHours(
                  todayScheduleInfo.endTime
                )}`
              : "Unavailable"
          }`; // Combine and display
        },
      },
      {
        header: "Check In ",
        accessorKey: "check_in_time",
        cell: (cell: { getValue: () => string }) => formatDate(cell.getValue()),
        enableColumnFilter: false,
      },
      // {
      //   header: "Number Of People",
      //   accessorKey: "number_of_people",
      //   cell: (cell: any) => {
      //     return <NumberOfPeople {...cell} />;
      //   },
      //   enableColumnFilter: false,
      // },

      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: any) => {
          return <Status {...cell} />;
        },
        enableColumnFilter: false,
      },

      // {
      //   header: "Queue Position",
      //   accessorKey: "queue_position",
      //   cell: (cell: any) => {
      //     return <Position {...cell} />;
      //   },
      //   enableColumnFilter: false,
      // },
    ],
    [handleCustomerClick, checkedAll]
  );

  const handleSalonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      setShowBarberSpinner(true);
      const salonId = Number(event.target.value);
      setSelectedSalonId(salonId);
      formik.setFieldValue("salon_id", salonId);
      getBarberSessionsData(salonId);
    }
  };
  const handleBarberChange = async (event: any) => {
    if (event.target.value) {
      const selectedBarbrId = Number(event.target.value);
      setSelectedBarberId(selectedBarbrId);
      const barberDetails = barberSessionsData.find(
        (barber: any) => barber.id === selectedBarbrId
      );
      setSelectedBarber(barberDetails?.barberInfo);
      toggleBarberModal();
    }
  };

  const getBarberScheduleData = async (
    barberId: any,
    serviceTime: any,
    services?: any
  ) => {
    if (barberId && serviceTime) {
      const obj = {
        BarberId: barberId,
        service_time: serviceTime,
      };
      const sessionResponse = await getBarberSessionByBarber(obj);
      if (sessionResponse) {
        if (parseInt(sessionResponse) === 102) {
          setIsAppointmentAvailable(true);
          let total;
          if (selectedBarber) {
            if (services) {
              const totalPrice = services.reduce((acc: any, service: any) => {
                const barberService = selectedBarber.servicesWithPrices.find(
                  (serv: any) => serv.id === parseInt(service.value)
                );

                const price = barberService
                  ? parseFloat(barberService?.barber_price) ??
                    parseFloat(barberService?.min_price) ??
                    0
                  : parseFloat(service.min_price);

                return acc + price;
              }, 0);
              total = totalPrice;
            } else {
              const totalPrice = selectedOptions.reduce(
                (acc: any, service: any) => {
                  const barberService = selectedBarber.servicesWithPrices.find(
                    (serv: any) => serv.id === parseInt(service.value)
                  );

                  const price = barberService
                    ? parseFloat(barberService?.barber_price) ??
                      parseFloat(barberService?.min_price) ??
                      0
                    : parseFloat(service.min_price);

                  return acc + price;
                },
                0
              );
              total = totalPrice;
            }
            // price = barberService.barber_price ? barberService.barber_price : barberService.min_price ? barberService.min_price : 0;
          }
          // const total = selectedOptions;
          setTotalPrice(total);
          calculateFinalAmount(total, tipPercentage, customTip);
        } else {
          setIsAppointmentAvailable(false);
          // appointmentFormik.setFieldValue("barber_id", "")
          if (parseInt(sessionResponse) === 100) {
            formik.setFieldValue("barber_id", "");
            showWarningToast("Fully Booked!!!", {
              autoClose: 3000,
            });
          } else if (parseInt(sessionResponse) === 101) {
            formik.setFieldValue("barber_id", "");
            showWarningToast("Low Remaining Time!!!", {
              autoClose: 3000,
            });
          } else {
            formik.setFieldValue("barber_id", "");
            showWarningToast("Barber not available for longer!!!", {
              autoClose: 3000,
            });
          }
        }
      }
    }
  };

  const handleFilterData = (data: any) => {
    if (data) {
      setStartDate(data.dateRange[0]);
      setEndDate(data.dateRange[1]);
      setStatus(data.status);
    }
    fetchAppointmentList(
      selectedCurrentPage === 0 ? 1 : selectedCurrentPage,
      data?.dateRange[0],
      data?.dateRange[1],
      data?.status === "All" ? "" : data?.status,
      2,
      selectedSearchText ?? ""
    );
    // Handle page change logic here
  };
  const handlePageChange = (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    fetchAppointmentList(
      total,
      selectedStartDate,
      selectedEndDate,
      selectedStatus,
      2,
      selectedSearchText ?? ""
    );
    // Handle page change logic here
  };

  const handleSearchText = (search: any) => {
    selectedSearch(search);
    if (search) {
      fetchAppointmentList(
        1,
        selectedStartDate,
        selectedEndDate,
        selectedStatus,
        2,
        search
      );
    } else {
      fetchAppointmentList(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        selectedStartDate,
        selectedEndDate,
        selectedStatus,
        2,
        search
      );
    }

    // Handle page change logic here
  };

  const toggleBarberModal = () => {
    // if (isBarberModalOpen) {
    //   setSelectedBarber(null);
    //   setSelectedBarberId(null);
    // }
    setIsBarberModalOpen(!isBarberModalOpen);
  };

  const cancelBarberModal = () => {
    toggleBarberModal();
  };

  const handleConfirm = () => {
    formik.setFieldValue("barber_id", selectedBarberId);
    if (selectedTotalServiceTime) {
      getBarberScheduleData(selectedBarberId, selectedTotalServiceTime);
    } else {
      formik.setFieldValue("barber_id", "");
      setIsAppointmentAvailable(false);
      showWarningToast("Please first select atleast one service!!!");
    }
    toggleBarberModal(); // Close modal after confirmation
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={handleDeleteTask}
        onCloseClick={() => setDeleteModal(false)}
      />
      <DeleteModal
        show={deleteModalMulti}
        onDeleteClick={() => {
          deleteMultiple();
          setDeleteModalMulti(false);
        }}
        onCloseClick={() => setDeleteModalMulti(false)}
      />
      <div className="row">
        <Col lg={12}>
          <div className="card" id="tasksList">
            <div className="card-header border-0">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">Appointments</h5>
                <div className="flex-shrink-0">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-primary add-btn me-1"
                      onClick={() => {
                        setIsEdit(false);
                        toggle();
                      }}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Create
                      Appointment
                    </button>
                    {isMultiDeleteButton && (
                      <button
                        className="btn btn-soft-danger"
                        onClick={() => setDeleteModalMulti(true)}
                      >
                        <i className="ri-delete-bin-2-line"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body pt-0">
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
                  currentPageIndex={selectedCurrentPage ?? 0}
                  selectedDateRange={[
                    selectedStartDate ?? new Date(),
                    selectedEndDate ?? new Date(),
                  ]}
                  selectedStatus={selectedStatus ?? ""}
                  divClass="table-responsive table-card mb-3"
                  tableClass="align-middle table-nowrap mb-3"
                  theadClass="table-light text-muted"
                  isTaskListFilter={true}
                  SearchPlaceholder="Search by barber, salon or name"
                  filterData={handleFilterData}
                  searchText={handleSearchText}
                  onChangeIndex={handlePageChange}
                />
              )}
            </div>
          </div>
        </Col>
      </div>

      <Modal isOpen={modal} toggle={toggle} centered backdrop="static">
        <ModalHeader toggle={toggle}>Add Appointment</ModalHeader>
        <Form className="tablelist-form" onSubmit={formik.handleSubmit}>
          <ModalBody className="modal-body">
            <Row className="g-3">
              <Col lg={12}>
                <Label for="number_of_people-field" className="form-label">
                  Services
                </Label>
                <Select
                  isMulti
                  options={serviceOptions}
                  value={selectedOptions}
                  onChange={handleServiceChange}
                  styles={customStyles} // Apply custom styles
                  placeholder="Select services..."
                />
              </Col>

              {storeRoleInfo.role_name === ROLES.ADMIN &&
                !storesalonDetailInfo && (
                  <Col lg={12}>
                    <div>
                      <Label htmlFor="salon" className="form-label">
                        Salon Name
                      </Label>
                      <select
                        className="form-select"
                        value={formik.values.salon_id}
                        onChange={handleSalonChange}
                      >
                        <option value="">Select a salon</option>
                        {salonData.map((salon) => (
                          <option key={salon.salon_id} value={salon.salon_id}>
                            {salon.salon_name}
                          </option>
                        ))}
                      </select>
                      {formik.touched.salon_id && formik.errors.salon_id && (
                        <div className="invalid-feedback">
                          {formik.errors.salon_id}
                        </div>
                      )}
                    </div>
                  </Col>
                )}
              {/* Barber ID */}
              {userCategory !== ROLES.WALKIN_BARBER && (
                <Col lg={12}>
                  <div>
                    <Label htmlFor="salon" className="form-label">
                      Barber Name
                      {showBarberSpinner && (
                        <Spinner size="sm" className="mx-2">
                          Loading...
                        </Spinner>
                      )}
                    </Label>
                    <select
                      className="form-select"
                      id="barber"
                      value={formik.values.barber_id}
                      onChange={handleBarberChange}
                      disabled={
                        selectedOptions.length === 0 ||
                        barberSessionsData?.length === 0
                      }
                    >
                      {barberSessionsData?.length === 0 ? (
                        <option disabled selected>
                          No barbers available
                        </option>
                      ) : (
                        <>
                          <option value="">Select a barber</option>
                          {barberSessionsData?.map((barber: any) => (
                            <option
                              key={barber.id}
                              value={barber.id}
                              disabled={
                                barber.availability_status !== "available" ||
                                !barber.start_time ||
                                !barber.end_time
                              }
                            >
                              {`${barber.name} - ${
                                barber.start_time && barber.end_time
                                  ? `${formatHours(
                                      barber.start_time
                                    )} to ${formatHours(
                                      barber.end_time
                                    )} (Wait: ${
                                      barber.estimated_wait_time
                                    } min)`
                                  : "Unavailable"
                              }`}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {formik.touched.barber_id && formik.errors.barber_id && (
                      <div className="invalid-feedback">
                        {formik.errors.barber_id}
                      </div>
                    )}
                  </div>
                </Col>
              )}

              {/* First Name */}
              <Col lg={12}>
                <Label for="firstname-field" className="form-label">
                  First Name
                </Label>
                <Input
                  name="firstname"
                  id="firstname"
                  className="form-control"
                  placeholder="Enter First Name"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onKeyDown={(e) => {
                    preventSpaceKey(e); // Prevent spaces
                    if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                      e.preventDefault(); // Block non-alphabetic characters
                    }
                  }}
                  value={formik.values.firstname || ""}
                  invalid={
                    formik.touched.firstname && formik.errors.firstname
                      ? true
                      : false
                  }
                />
                {formik.touched.firstname && formik.errors.firstname ? (
                  <FormFeedback type="invalid">
                    {formik.errors.firstname}
                  </FormFeedback>
                ) : null}
              </Col>

              {/* Last Name */}
              <Col lg={12}>
                <Label for="lastname-field" className="form-label">
                  Last Name
                </Label>
                <Input
                  name="lastname"
                  id="lastname"
                  className="form-control"
                  placeholder="Enter Last Name"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onKeyDown={(e) => {
                    preventSpaceKey(e); // Prevent spaces
                    if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                      e.preventDefault(); // Block non-alphabetic characters
                    }
                  }}
                  value={formik.values.lastname || ""}
                  invalid={
                    formik.touched.lastname && formik.errors.lastname
                      ? true
                      : false
                  }
                />
                {formik.touched.lastname && formik.errors.lastname ? (
                  <FormFeedback type="invalid">
                    {formik.errors.lastname}
                  </FormFeedback>
                ) : null}
              </Col>

              <Col lg={12}>
                <Label for="email-field" className="form-label">
                  Email
                </Label>
                <Input
                  name="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter Email"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onKeyDown={preventSpaceKey}
                  value={formik.values.email || ""}
                  invalid={
                    formik.touched.email && formik.errors.email ? true : false
                  }
                />
                {formik.touched.email && formik.errors.email ? (
                  <FormFeedback type="invalid">
                    {formik.errors.email}
                  </FormFeedback>
                ) : null}
              </Col>

              {/* <Col lg={12}>
                <Label for="address-field" className="form-label">
                  Address
                </Label>
                <Input
                  name="address"
                  id="address"
                  className="form-control"
                  placeholder="Enter address"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address || ""}
                  invalid={
                    formik.touched.address && formik.errors.address
                      ? true
                      : false
                  }
                />
                {formik.touched.address && formik.errors.address ? (
                  <FormFeedback type="invalid">
                    {formik.errors.address}
                  </FormFeedback>
                ) : null}
              </Col> */}

              {/* Mobile Number */}
              <Col lg={12}>
                <Label for="mobile_number-field" className="form-label">
                  Mobile Number
                </Label>
                <Input
                  name="mobile_number"
                  id="mobile_number"
                  className="form-control"
                  placeholder="Enter Mobile Number"
                  type="text"
                  onChange={handlePhoneChange}
                  onKeyDown={handleKeyDown}
                  onBlur={formik.handleBlur}
                  value={formik.values.mobile_number || ""}
                  invalid={
                    formik.touched.mobile_number && formik.errors.mobile_number
                      ? true
                      : false
                  }
                />
                {formik.touched.mobile_number && formik.errors.mobile_number ? (
                  <FormFeedback type="invalid">
                    {formik.errors.mobile_number}
                  </FormFeedback>
                ) : null}
              </Col>
              {/* <Col lg={12}>
                <Label className="form-label me-1">Tip</Label>
                <div className="btn-group btn-group d-flex flex-wrap">
                  <Label
                    className={`btn btn-outline-primary ${
                      tipPercentage === 0 ? "active" : ""
                    }`}
                  >
                    <Input
                      type="radio"
                      name="tip"
                      value={0}
                      checked={tipPercentage === 0}
                      onChange={handleTipChange}
                      className="d-none"
                    />
                    None
                  </Label>
                  {[20, 25, 30, 40].map((percentage) => (
                    <Label
                      key={percentage}
                      className={`btn btn-outline-primary ${
                        tipPercentage == percentage ? "active" : ""
                      }`}
                    >
                      <Input
                        type="radio"
                        name="tip"
                        value={percentage}
                        checked={tipPercentage == percentage}
                        onChange={handleTipChange}
                        className="d-none"
                      />
                      {percentage}%
                    </Label>
                  ))}
                  <Label
                    className={`btn btn-outline-primary ${
                      tipPercentage === "custom" ? "active" : ""
                    }`}
                  >
                    <Input
                      type="radio"
                      name="tip"
                      value="custom"
                      checked={tipPercentage === "custom"}
                      onChange={handleTipChange}
                      className="d-none"
                    />
                    Custom
                  </Label>
                </div>

          

                {tipPercentage === "custom" && (
                  <Input
                    type="text"
                    placeholder="Enter custom tip"
                    value={customTip}
                    onChange={handleCustomTipChange}
                    className="mt-2"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    invalid={isInvalid}
                  />
                )}
              </Col> */}

              <Col
                lg={12}
                className="d-flex justify-content-end align-item-center"
              >
                {/* <h5>Total: ${totalPrice.toFixed(2)}</h5> */}
                <h5>Final Amount: ${finalAmount.toFixed(2)}</h5>
              </Col>
            </Row>
          </ModalBody>
          <div className="modal-footer">
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
              {isAppointmentAvailable}
              <button
                type="submit"
                className="btn btn-success"
                id="add-btn"
                disabled={showSpinner || !isAppointmentAvailable} // Disable button when loader is active
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
        </Form>
      </Modal>
      <Modal
        isOpen={isBarberModalOpen}
        toggle={toggleBarberModal}
        centered
        backdrop="static"
      >
        <ModalHeader toggle={toggleBarberModal}>
          {selectedBarber?.name} - {selectedBarber?.position}
        </ModalHeader>
        <ModalBody>
          <div className="team-profile-img mb-3">
            <div className="avatar-lg img-thumbnail rounded-circle mx-auto">
              {selectedBarber?.photo ? (
                <img
                  src={selectedBarber?.photo}
                  alt={selectedBarber?.name}
                  className="img-fluid d-block rounded-circle"
                  style={{
                    height: "85px",
                    width: "6rem",
                  }}
                />
              ) : (
                <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary d-flex justify-content-center align-items-center">
                  {selectedBarber?.name?.charAt(0)}
                  {selectedBarber?.name
                    ?.split(" ")
                    .slice(-1)
                    .toString()
                    ?.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <h5>Services </h5>
          <ul>
            {selectedOptions?.length > 0 ? (
              selectedOptions.map((service: any, index: any) => {
                // Find the corresponding service in barberData.services
                const barberService = selectedBarber?.servicesWithPrices?.find(
                  (barberService: any) => barberService.name === service.name
                );
                let price = 0;
                if (barberService) {
                  price = barberService.barber_price
                    ? barberService.barber_price
                    : barberService.min_price
                    ? barberService.min_price
                    : 0;
                }
                return (
                  <li key={index}>
                    {service.name}
                    {barberService ? (
                      <span>
                        <strong> - ${price}</strong>
                      </span>
                    ) : (
                      <span>
                        <strong> - ${service.min_price}</strong>
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <p>No services available for this barber</p>
            )}
          </ul>

          <div className="d-flex gap-2 justify-content-end mt-4 mb-2">
            <Button color="primary" onClick={() => handleConfirm()}>
              Confirm
            </Button>
            <Button color="secondary" onClick={() => cancelBarberModal()}>
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default AppointmentTable;
