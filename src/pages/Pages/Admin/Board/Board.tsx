import React, { useState, useEffect, useMemo } from "react";
import {
  CardBody,
  Col,
  Row,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
  Spinner,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { io } from "socket.io-client";

import Profile from "../../../../assets/images/users/avatar-8.jpg";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link, useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";
import DeleteModal from "Components/Common/DeleteModal";
import Select from "react-select";
import printJS from "print-js";
import {
  createAppointment,
  fetchBoardAppointments,
  updateAppointmentStatus,
  updateAppointmentWaitTime,
} from "Services/AppointmentService";
import { fetchHaircutDetails, addHaircutDetail } from "Services/HaircutDetails";
import { Barber, HaircutDetail, Service } from "Services/type";
import Loader from "Components/Common/Loader";
import TableContainer from "Components/Common/TableContainerReactTable";

import config from "config";
import ConfirmationModal from "Components/Common/ConfirmationModal";
import { fetchServices } from "Services/Service";
import {
  fetchBarberSession,
  getBarberSessionByBarber,
} from "Services/BarberSessionService";
import { fetchSalons } from "Services/SalonService";
import { deleteBarber, fetchBarber } from "Services/barberService";
import { formatDateHours, formatHours } from "Components/Common/DateUtil";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "slices/layouts/toastService";
import { ROLES } from "common/data/Constants";
import { strictNameValidation } from "Components/Common/Namevalidation";
import { updateTipAmount } from "Services/Tipservice";

//Import Breadcrumb
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

interface Salon {
  salon_id: number;
  salon_name: string;
  availability_status: string; // Field for availability status
  photos: number; // Field for default service time
  creappointment_countted_at: string;
  address: string; // Fixed typo here
  barbers?: object; // Add this line
}

interface KanbanColumn {
  id: string;
  name: string;
  nameAlias: string;
  badge?: number;
  color?: string;
  cards?: any;
}

const { api } = config;
const Board = () => {
  const dispatch = useDispatch<any>();
  const [kanbanTasksCards, setKanbanTasksCards] = useState<any>();
  const [haircutDetailData, setHaircutDetails] = useState<HaircutDetail[]>([]);
  const [selectedHairCutDetails, setSelectedHairCutDetails] = useState<any>();
  const [selectedCardNewStatus, setSelectedCardNewStatus] = useState<any>();
  const [selectedCardOldStatus, setSelectedCardOldStatus] = useState<any>();
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [salonData, setSalonData] = useState<Salon[]>([]);
  const [barberSessionsData, setBarberSessionsData] = useState<any>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [inSalonLoader, setInSalonLoader] = useState<boolean>(false);
  const [cancelLoader, setCancelLoader] = useState<boolean>(false);
  const [completedLoader, setCompletedLoader] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isAppointmentAvailable, setIsAppointmentAvailable] =
    useState<boolean>(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipSubmitting, setTipSubmitting] = useState(false);

  const [isBarberModalOpen, setIsBarberModalOpen] = useState(false);

  const [selectedBarber, setSelectedBarber] = useState<any | null>(null);
  const [selectedTotalServiceTime, setTotalServiceTime] = useState<
    number | null
  >(0);

  const [cards, setCards] = useState<any>([]);
  const [barberData, setBarberData] = useState<any>([]);
  const [tempAppointments, setTempAppointments] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isView, setIsView] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState(true);

  const getVisibleCount = () => {
    const width = window.innerWidth;
    if (width <= 576) return 3; // Mobile
    if (width <= 768) return 4; // Tablet
    if (width <= 992) return 6; // Tablet

    return 10; // Default (Desktop)
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount()); // Now, it's defined before use!
  // Number of barbers to show at a time
  const [startIndex, setStartIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeFilterBarber, setActiveFilterBarber] = useState<any>();
  const [tipPercentage, setTipPercentage] = useState<any>(null);
  const [customTip, setCustomTip] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const navigate = useNavigate();
  const [cardDetails, setCardDetails] = useState<any>(null); // Store card details fetched based on card.id

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [showAppointmentSpinner, setShowAppointmentSpinner] =
    useState<boolean>(false);
  const [showTipInput, setShowTipInput] = useState(false);

  const [showBarberSpinner, setShowBarberSpinner] = useState<boolean>(false);

  const selectLayoutState = (state: any) => state.Tasks;
  const TasksKanbanProperties = createSelector(
    selectLayoutState,
    (state: any) => ({
      tasks: state.tasks,
      loading: state.loading,
    })
  );

  const { tasks, loading } = useSelector(TasksKanbanProperties);
  const [formData, setFormData] = useState({
    tipAmount: "", // Add this if not already present
  });
  const { api } = config;
  const [isLoading, setLoading] = useState<boolean>(loading);
  const authTUser = localStorage.getItem("authUser");
  let storeUserInfo: any;
  let token: any;
  if (authTUser) {
    storeUserInfo = JSON.parse(authTUser);
    token = storeUserInfo.token;
  }
  let salonDetails = localStorage.getItem("salonDetails");
  let storesalonDetailInfo: any;
  if (salonDetails) {
    storesalonDetailInfo = JSON.parse(salonDetails);
  }
  const order = ["checked_in", "in_salon", "completed", "canceled"];
  const convertBase64ToBlobUrl = (base64: any) => {
    // Extract content type and data from Base64 string
    const [prefix, base64Data] = base64?.split(",");
    const contentType = prefix.match(/:(.*?);/)[1];
    const byteCharacters = atob(base64Data);

    // Create an ArrayBuffer and convert binary string to it
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // Create a Blob from the ArrayBuffer
    const blob = new Blob([byteNumbers], { type: contentType });

    // Generate a Blob URL
    return URL.createObjectURL(blob);
  };
  const groupAndSortData = (data: any, order: any) => {
    let index = 1;
    if (!data.message) {
      const grouped = data.reduce((acc: any, curr: any) => {
        const { status } = curr;
        if (!acc[status]) {
          acc[status] = {
            id: index.toString(),
            name: status,
            nameAlias:
              status === "checked_in"
                ? "Check In"
                : status === "in_salon"
                ? "In Salon"
                : status,
            badge: 0,
            color:
              status === "checked_in"
                ? "warning"
                : status === "completed"
                ? "success"
                : status === "canceled"
                ? "danger"
                : "secondary",
            index: index++,
            cards: [],
          };
        }
        // const url = curr.User.profile_photo ? convertBase64ToBlobUrl(curr.User.profile_photo) : Profile;
        const obj = {
          id: curr?.id?.toString(),
          title: curr.name,
          barber: curr.Barber.name,
          barber_bg_color: curr.Barber.background_color,
          salon: curr.salon.name,
          Services: curr.Services,
          queue_position: curr.queue_position,
          number_of_people: curr.number_of_people,
          mobile_number: curr.mobile_number,
          estimated_wait_time: curr.estimated_wait_time,
          text: "",
          userImages: [
            {
              id: curr.User?.id,
              img: curr.User.profile_photo ?? Profile,
            },
          ],
          // badge1: [
          //   "Mohican"
          // ],
          haircutDetails: curr.haircutDetails,
          botId:
            status === "checked_in"
              ? curr.check_in_time
              : status === "completed"
              ? curr.complete_time
              : status === "canceled"
              ? curr.cancel_time
              : curr.in_salon_time,
          paymentDetails: curr.paymentDetails,
          paymentStatus: curr.paymentStatus,
          paymentMode: curr.paymentMode,
        };
        acc[status].cards.push(obj);
        acc[status].badge = acc[status].cards?.length; // Update count
        return acc;
      }, {});
      // Sort items within each status by date (with time) in ascending order and apply the desired group order
      return order
        .map((status: string, idx: number) => {
          if (grouped[status]) {
            // grouped[status].cards.sort((a: any, b: any) => new Date(a.botId).getTime() - new Date(b.botId).getTime());
            switch (status) {
              case "in_salon":
                grouped[status].cards.sort(
                  (a: any, b: any) =>
                    new Date(b.botId).getTime() - new Date(a.botId).getTime()
                );
                break;
              case "canceled":
                grouped[status].cards.sort(
                  (a: any, b: any) =>
                    new Date(b.botId).getTime() - new Date(a.botId).getTime()
                );
                break;
              case "checked_in":
                grouped[status].cards.sort(
                  (a: any, b: any) =>
                    new Date(a.botId).getTime() - new Date(b.botId).getTime()
                );
                break;
              case "completed":
                grouped[status].cards.sort(
                  (a: any, b: any) =>
                    new Date(b.botId).getTime() - new Date(a.botId).getTime()
                );
                break;
            }
            grouped[status].cards = grouped[status].cards.map((item: any) => ({
              ...item,
              botId: formatDateHours(item.botId),
            }));
            return { ...grouped[status], index: idx };
          } else {
            return {
              id: index.toString(),
              name: status,
              nameAlias:
                status === "checked_in"
                  ? "Check In"
                  : status === "in_salon"
                  ? "In Salon"
                  : status,
              badge: 0,
              color:
                status === "checked_in"
                  ? "warning"
                  : status === "completed"
                  ? "success"
                  : status === "canceled"
                  ? "danger"
                  : "secondary",
              index: index++,
              cards: [],
            };
          }
        })
        .filter(Boolean);
      // return Object.values(grouped);
    } else {
      // Sort items within each status by date (with time) in ascending order and apply the desired group order
      return order
        .map((status: string, idx: number) => {
          const obj = {
            id: index.toString(),
            name: status,
            nameAlias:
              status === "checked_in"
                ? "Check In"
                : status === "in_salon"
                ? "In Salon"
                : status,
            badge: 0,
            color:
              status === "checked_in"
                ? "warning"
                : status === "completed"
                ? "success"
                : status === "canceled"
                ? "danger"
                : "secondary",
            index: index++,
            cards: [],
          };
          return { ...obj, index: idx };
          // if (grouped[status]) {
          //   // grouped[status].cards.sort((a: any, b: any) => new Date(a.botId).getTime() - new Date(b.botId).getTime());
          //   switch (status) {
          //     case "in_salon":
          //       grouped[status].cards.sort((a: any, b: any) => new Date(b.botId).getTime() - new Date(a.botId).getTime());
          //       break;
          //     case "canceled":
          //       grouped[status].cards.sort((a: any, b: any) => new Date(b.botId).getTime() - new Date(a.botId).getTime());
          //       break;
          //     case "checked_in":
          //       grouped[status].cards.sort((a: any, b: any) => new Date(a.botId).getTime() - new Date(b.botId).getTime());
          //       break;
          //     case "completed":
          //       grouped[status].cards.sort((a: any, b: any) => new Date(b.botId).getTime() - new Date(a.botId).getTime());
          //       break;
          //   }
          //   grouped[status].cards = grouped[status].cards.map((item: any) => ({
          //     ...item,
          //     botId: formatDateHours(item.botId)
          //   }));
          //   return { ...grouped[status], index: idx };
          // } else {
          //   return {
          //     id: index.toString(),
          //     name: status,
          //     nameAlias: status === "checked_in" ? "Check In" : status === "in_salon" ? "In Salon" : status,
          //     badge: 0,
          //     color: status === "checked_in" ? "warning" : status === "completed" ? "success" : status === "canceled" ? "danger" : "secondary",
          //     index: index++,
          //     cards: []
          //   };
          // }
        })
        .filter(Boolean);
      // return Object.values(grouped);
    }
  };

  useEffect(() => {
    if (!card?.paymentDetails || !card?.paymentDetails.amount) return;

    const base = parseFloat(card.paymentDetails.amount || "0");

    let calculatedTip = 0;

    if (tipPercentage === "custom") {
      calculatedTip = parseFloat(customTip || "0");
    } else {
      calculatedTip = (Number(tipPercentage) / 100) * base; // ✅ percentage of base
    }

    setTotalPrice(base);
    setFinalAmount(base + calculatedTip);
  }, [tipPercentage, customTip]);

  useEffect(() => {
    if (
      storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
      storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
      storesalonDetailInfo
    ) {
      formik.setFieldValue(
        "salon_id",
        storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
      );
      appointmentFormik.setFieldValue(
        "salon_id",
        storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
      );
      getBarberSessionsData(
        storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
      );
    }
    if (storeUserInfo?.berber) {
      appointmentFormik.setFieldValue("salon_id", storeUserInfo.berber.SalonId);
      appointmentFormik.setFieldValue("barber_id", storeUserInfo.berber.id);
      setIsAppointmentAvailable(true);
    }
    fetchAppointments();
    fetchBarbersList(1, null);
    const fetchHaircutDetailList = async () => {
      try {
        const response: any = await fetchHaircutDetails();
        setHaircutDetails(response);
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

    fetchHaircutDetailList();
    if (
      storeRoleInfo?.role_name !== ROLES.SALON_MANAGER &&
      storeRoleInfo?.role_name !== ROLES.SALON_OWNER &&
      !storesalonDetailInfo
    ) {
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
    }
    fetchServiceList();
    // setCards(tasks)
  }, []);

  const fetchBarbersList = async (page: any, search: any) => {
    try {
      const response: any = await fetchBarber(
        page === 0 ? 1 : page,
        null,
        search ?? null
      );

      const barbers = response.barbers
        .filter(
          (brbr: any) =>
            brbr.category === 2 && brbr.availability_status === "available"
        )
        .map((barber: any) => {
          return {
            ...barber,
            displayName: `${barber.name} (${barber.availability_status})`,
          };
        });
      setBarberData(barbers);

      if (barberData?.length === 0) {
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

  useEffect(() => {
    const socket = io(api.MAIN_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5, // Number of attempts before giving up
      reconnectionDelay: 3000, // Time between reconnections
    });

    socket.on("connect_error", (error) => {
      navigate("/dashboard");
    });

    // Listen for messages from the servers
    socket.on("updateBoard", (updatedAppointments) => {
      if (activeFilterBarber) {
        if (activeFilterBarber?.id === "all") {
          // Show all appointments if "All" is selected
          setTempAppointments(updatedAppointments);
          const groupedData = groupAndSortData(updatedAppointments, order);
          setCards(groupedData);
          setShowLoader(false);
        } else {
          const filterbarberAppointments = updatedAppointments?.filter(
            (appo: any) => appo.BarberId === activeFilterBarber?.id
          );
          const groupedData = groupAndSortData(filterbarberAppointments, order);
          setCards(groupedData);

          if (groupedData?.length === 0) {
            const timer = setTimeout(() => {
              setShowLoader(false);
            }, 5000); // Hide loader after 5 seconds
            return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
          } else {
            setShowLoader(false); // Immediately hide loader if data is available
          }
        }
      } else {
        const groupedData = groupAndSortData(updatedAppointments, order);
        setCards(groupedData);
      }

      // Update the UI with new appointments (you can update your state here)
    });
    // Cleanup function to avoid memory leaks
    return () => {
      socket.off("updateBoard"); // Clean up the socket event listener
      socket.disconnect();
    };
  }, [token, activeFilterBarber]); // Only depend on id and token

  const fetchAppointments = async () => {
    try {
      setShowLoader(true);
      setActiveFilter("All");
      setActiveFilterBarber(null);
      const response: any = await fetchBoardAppointments(null, null);
      if (!response?.success) {
        setTempAppointments(response);
      }
      const groupedData = groupAndSortData(response, order);
      setCards(groupedData);

      if (groupedData?.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 5000); // Hide loader after 5 seconds
        return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
      } else {
        setShowLoader(false); // Immediately hide loader if data is available
      }
      // setAppointmentData(response);
      // if (appointmentData?.length === 0) {
      //   const timer = setTimeout(() => {
      //     setShowLoader(false);
      //   }, 5000); // Hide loader after 5 seconds
      //   return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
      // } else {
      //   setShowLoader(false); // Immediately hide loader if data is available
      // }
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
          value: ser?.id?.toString(), // Example: "apple"
          label: `${ser.name} - $${ser.min_price} - $${ser.max_price} (${ser.default_service_time} min.)`,
          name: `${ser.name}`,
          min_price: `${ser.min_price}`,
          price: `$${ser.min_price} - $${ser.max_price}`,
          default_service_time: ser.default_service_time,
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

  // Set user data for editing
  const handleDetails = (details: any) => {
    handleOpen();
    setIsView(true); // Toggle edit mode
    setSelectedHairCutDetails(details);
    // setSelectedSalonId(barber.SalonId);
    // setSelectedImage(barber.photo ?? Profile); // Use user's profile image or default
    // setNewBarber(barber); // Set the user to be updated
    // toggleModal(); // Open the modal for editing
  };

  // Set user data for editing
  const handlePrint = () => {
    printJS({
      printable: "printArea", // The ID of the element to print
      type: "html",
    });
  };

  const columns = useMemo(
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
              onClick={() => handleDetails(cell.row.original)}
            >
              Details
            </button>
          </div>
        ),
      },
    ],
    [haircutDetailData]
  );
  // const formatDateHours = (dateString: string): string => {
  //   const date = new Date(dateString);

  //   const padZero = (num: number) => String(num).padStart(2, "0");

  //   if (isNaN(date.getTime())) return ""; // Return an empty string if date is invalid
  //   const year = date.getUTCFullYear();
  //   const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  //   const day = String(date.getUTCDate()).padStart(2, "0");

  //   let hours = date.getHours();
  //   const minutes = padZero(date.getMinutes());
  //   const ampm = hours >= 12 ? "PM" : "AM";

  //   hours = hours % 12 || 12; // Convert 0 hours to 12 for AM/PM
  //   const formattedHours = padZero(hours);

  //   return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  // };

  // const formatHours = (timeString: string) => {
  //   const padZero = (num: number) => String(num).padStart(2, "0");
  //   // Split the time string into hours, minutes, and seconds
  //   const [hoursStr, minutesStr] = timeString?.split(":");

  //   let hours = parseInt(hoursStr, 10);
  //   const minutes = padZero(parseInt(minutesStr, 10));
  //   const ampm = hours >= 12 ? "PM" : "AM";

  //   // Convert to 12-hour format
  //   hours = hours % 12 || 12;

  //   return `${padZero(hours)}:${minutes} ${ampm}`;
  // };

  const handleServiceChange = (selected: any) => {
    setSelectedOptions(selected);
    const totalServiceTime = selected?.reduce(
      (sum: any, item: any) => sum + item.default_service_time,
      0
    );
    setTimeout(() => {
      setTotalServiceTime(totalServiceTime);
      const valuesArray = selected.map((serv: any) => parseInt(serv.value, 10));
      appointmentFormik.setFieldValue("service_ids", valuesArray);
      if (totalServiceTime > 0) {
        getBarberScheduleData(selectedBarberId, totalServiceTime, selected);
      } else {
        showWarningToast("Please first select atleast one service!!!");
        setIsAppointmentAvailable(false);
      }
    }, 500);
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

  const userCategory = localStorage.getItem("userCategory");
  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  let salonUserInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  let authSalonUser: any = localStorage.getItem("authSalonUser");
  if (authSalonUser) {
    authSalonUser = JSON.parse(authSalonUser);
  }

  const handleDragEnd = async (result: any) => {
    if (
      !result.destination ||
      result.destination.droppableId === result.source.droppableId
    )
      return; // If dropped outside a valid drop area, do nothing
    setSelectedCard(result);
    setSelectedCardOldStatus(null);
    setSelectedCardNewStatus(null);
    setConfirmationModal(true);
  };

  const updateStatus = async (card: any, oldStatus: any, newStatus: any) => {
    setSelectedCard(card);
    setSelectedCardOldStatus(oldStatus);
    setSelectedCardNewStatus(newStatus);
    setConfirmationModal(true);
  };

  const updateNewCardStatus = async () => {
    try {
      if (selectedCardNewStatus === "canceled") {
        setCancelLoader(true);
      } else if (selectedCardNewStatus === "completed") {
        setCompletedLoader(true);
      } else if (selectedCardNewStatus === "in_salon") {
        setInSalonLoader(true);
      }

      setLoading(true);

      const statusData = { status: selectedCardNewStatus };

      // ✅ Update status + show toast immediately
      await updateAppointmentStatus(parseInt(selectedCard?.id), statusData);
      showSuccessToast("Appointment updated successfully");
      // Fetch updated data
      const response: any = await fetchBoardAppointments(null, null);

      if (activeFilterBarber) {
        const dataToUse =
          activeFilterBarber?.id === "all"
            ? response
            : response.filter(
                (appo: any) => appo.BarberId === activeFilterBarber.id
              );
        const groupedData = groupAndSortData(dataToUse, order);
        setCards(groupedData);
        if (groupedData?.length === 0) {
          const timer = setTimeout(() => {
            setShowLoader(false);
          }, 5000);
          return () => clearTimeout(timer);
        } else {
          setShowLoader(false);
        }
      } else {
        const groupedData = groupAndSortData(response, order);
        setCards(groupedData);
        if (groupedData?.length === 0) {
          const timer = setTimeout(() => {
            setShowLoader(false);
          }, 5000);
          return () => clearTimeout(timer);
        } else {
          setShowLoader(false);
        }
      }

      // Clear state
      setSelectedCard(null);
      setSelectedCardNewStatus(null);
      setSelectedCardOldStatus(null);
      setLoading(false);
    } catch (error: any) {
      // Try to extract dynamic error message from API response
      const messageFromAPI =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      showErrorToast(messageFromAPI);
    } finally {
      // Always clear loaders
      if (selectedCardNewStatus === "canceled") {
        setCancelLoader(false);
      } else if (selectedCardNewStatus === "completed") {
        setCompletedLoader(false);
      } else if (selectedCardNewStatus === "in_salon") {
        setInSalonLoader(false);
      }
    }
  };

  // create Modal
  const [modall, setModall] = useState<boolean>(false);
  const handleOpen = () => {
    setModall(!modall);
    setCardHead(null);
    setIsView(false);
  };

  const [cardhead, setCardHead] = useState<any>();

  const formik: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (cardhead && cardhead?.id) || "",
      name: (cardhead && cardhead.name) || "",
    } as KanbanColumn,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Card Title"),
    }),
    onSubmit: (values: KanbanColumn) => {
      const newCardheaderData: KanbanColumn = {
        id: (Math.floor(Math.random() * (30 - 20)) + 20).toString(),
        name: values["name"],
        nameAlias: values["name"],
        cards: [],
      };

      // dispatch(onAddCardData(newCardheaderData));
      formik.resetForm();

      handleOpen();
    },
  });

  // badges
  const [tag, setTag] = useState<any>();
  const [assignTag, setAssignTag] = useState<any>([]);

  const handlestag = (tags: any) => {
    setTag(tags);
    const assigned = tags.map((item: any) => item.value);
    setAssignTag(assigned);
  };

  const tags = [
    { label: ROLES.ADMIN, value: ROLES.ADMIN },
    { label: "Layout", value: "Layout" },
    { label: "Dashboard", value: "Dashboard" },
    { label: "Design", value: "Design" },
    { label: "Website", value: "Website" },
    { label: "Marketing", value: "Marketing" },
    { label: "Business", value: "Business" },
    { label: "Logo", value: "Logo" },
    { label: "UI/UX", value: "UI/UX" },
    { label: "Analysis", value: "Analysis" },
    { label: "Product", value: "Product" },
    { label: "Ecommerce", value: "Ecommerce" },
    { label: "Graphic", value: "Graphic" },
  ];

  // Add Modal
  const [modal, setModal] = useState<boolean>(false);
  const [waitTimeModal, setWaitTimeModal] = useState<boolean>(false);
  const toggle = () => {
    if (modal) {
      setModal(false);
      setImages([]);
      setCard(null);
    } else {
      setModal(true);
      setAssignTag([]);
    }
  };
  const waitTimeToggle = () => {
    if (waitTimeModal) {
      setWaitTimeModal(false);
      setCard(null);
    } else {
      setWaitTimeModal(true);
    }
  };
  // Add Modal
  const [appointmentModal, setappointmentModal] = useState<boolean>(false);
  const appointmentToggle = () => {
    if (appointmentModal) {
      setappointmentModal(false);
      setImages([]);
      setCard(null);
      setSelectedBarberId(null);
      setSelectedOptions([]);
      setBarberSessionsData([]);
      setIsAppointmentAvailable(false);
      appointmentFormik.resetForm();
      if (
        storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
        storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
        storesalonDetailInfo
      ) {
        appointmentFormik.setFieldValue(
          "salon_id",
          storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
        );
        getBarberSessionsData(
          storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
        );
      }
      if (storeUserInfo?.berber) {
        appointmentFormik.setFieldValue(
          "salon_id",
          storeUserInfo.berber.SalonId
        );
        appointmentFormik.setFieldValue("barber_id", storeUserInfo.berber.id);
        setIsAppointmentAvailable(true);
      }
    } else {
      setappointmentModal(true);
      setAssignTag([]);
    }
  };
  const haircutToggle = () => {
    if (modall) {
      setModall(false);
      setCardHead(null);
    } else {
      setModall(true);
    }
  };

  const handleSalonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      setShowBarberSpinner(true);
      const salonId = Number(event.target.value);
      setSelectedSalonId(salonId);
      appointmentFormik.setFieldValue("salon_id", salonId);
      getBarberSessionsData(salonId);
      // const selectedSalonData = salonData.find(
      //   (salon) => salon.salon_id === salonId
      // );
      // setSelectedSalon(selectedSalonData || null);
    }
  };

  const handleBarberChange = (event: any) => {
    const selectedBarbrId = Number(event.target.value);
    if (!selectedBarbrId) return;

    setSelectedBarberId(selectedBarbrId);

    const barberDetails = barberSessionsData.find(
      (barber: any) => barber.id === selectedBarbrId
    );

    setSelectedBarber(barberDetails?.barberInfo);
    toggleBarberModal();
  };

  const getBarberScheduleData = async (
    barberId: any,
    serviceTime: any,
    services?: any
  ) => {
    try {
      if (barberId && serviceTime) {
        const obj = {
          BarberId: barberId,
          service_time: serviceTime,
        };
        const sessionResponse = await getBarberSessionByBarber(obj);
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
          if (parseInt(sessionResponse) === 100) {
            appointmentFormik.setFieldValue("barber_id", "");
            showWarningToast("Fully Booked!!!", {
              autoClose: 3000,
            });
          } else if (parseInt(sessionResponse) === 101) {
            appointmentFormik.setFieldValue("barber_id", "");
            showWarningToast("Low Remaining Time!!!", {
              autoClose: 3000,
            });
          } else {
            appointmentFormik.setFieldValue("barber_id", "");
            showWarningToast("Barber not available for longer!!!", {
              autoClose: 3000,
            });
          }
        }
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
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [card, setCard] = useState<any>();
  // validation
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

  const waitTimValidation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      appointment_id: (card && parseInt(card?.id)) || null,
      additionalTime: null,
    } as CardData,
    validationSchema: Yup.object({
      additionalTime: Yup.number()
        .required("Please Enter Additional Time")
        .min(0),
    }),
    onSubmit: async (values: any) => {
      try {
        const timeData = { additionalTime: parseInt(values.additionalTime) };
        await updateAppointmentWaitTime(values.appointment_id, timeData);
        waitTimeToggle();
        showSuccessToast("Appointment updated successfully");
        const response: any = await fetchBoardAppointments(null, null);
        if (activeFilterBarber) {
          if (activeFilterBarber?.id === "all") {
            // Show all appointments if "All" is selected
            setTempAppointments(response);
            const groupedData = groupAndSortData(response, order);
            setCards(groupedData);
            if (groupedData?.length === 0) {
              const timer = setTimeout(() => {
                setShowLoader(false);
              }, 5000); // Hide loader after 5 seconds
              return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
            } else {
              setShowLoader(false); // Immediately hide loader if data is available
            }
          } else {
            const filterbarberAppointments = response?.filter(
              (appo: any) => appo.BarberId === activeFilterBarber?.id
            );
            const groupedData = groupAndSortData(
              filterbarberAppointments,
              order
            );
            setCards(groupedData);

            if (groupedData?.length === 0) {
              const timer = setTimeout(() => {
                setShowLoader(false);
              }, 5000); // Hide loader after 5 seconds
              return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
            } else {
              setShowLoader(false); // Immediately hide loader if data is available
            }
          }
        } else {
          const groupedData = groupAndSortData(response, order);
          setCards(groupedData);
          if (groupedData?.length === 0) {
            const timer = setTimeout(() => {
              setShowLoader(false);
            }, 5000); // Hide loader after 5 seconds
            return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
          } else {
            setShowLoader(false); // Immediately hide loader if data is available
          }
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
    },
  });

  const preventSpaceKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };
  const emailValidationRegex =
    /^(?=.{5,50}$)[a-z0-9._%+-]{3,}@[a-z0-9.-]{3,}\.[a-z]{2,}$/;

  // validation
  const appointmentFormik = useFormik({
    initialValues: {
      salon_id: 0,
      barber_id: 0,
      firstname: "",
      lastname: "",
      service_ids: [],
      number_of_people: 1,
      mobile_number: "",
      email: "",
      address: "",
    },
    validationSchema: Yup.object({
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
    onSubmit: (values) => {
      const formattedMobileNumber =
        "+1" + values.mobile_number.replace(/[()\s-]/g, "");

      setShowAppointmentSpinner(true);
      const processedValues = {
        ...values,
        mobile_number: formattedMobileNumber,
        payment_mode: "Pay_In_Person",
        tip: tipAmount,
      };

      values.firstname.trim();
      values.lastname.trim();
      values.email.trim();
      createAppointment(processedValues)
        .then((response) => {
          fetchAppointments();
          showSuccessToast("Appointment created successfully", {
            autoClose: 2000,
          });
          setShowAppointmentSpinner(false);
          setTotalPrice(0);
          setFinalAmount(0);
          setTipPercentage(null);
          setTipAmount(0);
          setCustomTip("");
          appointmentFormik.resetForm();
          if (
            storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
            storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
            storesalonDetailInfo
          ) {
            appointmentFormik.setFieldValue(
              "salon_id",
              storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
            );
            getBarberSessionsData(
              storesalonDetailInfo ? storesalonDetailInfo.id : salonUserInfo?.id
            );
          }
          if (storeUserInfo?.berber) {
            appointmentFormik.setFieldValue(
              "salon_id",
              storeUserInfo.berber.SalonId
            );
            appointmentFormik.setFieldValue(
              "barber_id",
              storeUserInfo.berber.id
            );
            setIsAppointmentAvailable(true);
          }
          appointmentToggle();
        })
        .catch((error) => {
          setShowAppointmentSpinner(false);
          // console.error("Error creating appointment:", error);
          // Check for the specific error code
          if (error.response && error.response.status === 400) {
            if (error.response.data.code === 400) {
              showErrorToast(error.response.data.message, {
                autoClose: 3000,
              });
            } else {
              showErrorToast("Failed to create an appointment.", {
                autoClose: 3000,
              });
            }
          } else {
            showErrorToast("Something went wrong. Please try again later.", {
              autoClose: 3000,
            });
          }
        });
    },
  });

  const haircutFormik: any = useFormik({
    enableReinitialize: true,

    initialValues: {
      appointment_id: (card && parseInt(card?.id)) || null,
      user_id:
        (card &&
          (card?.userImages?.length > 0 ? card?.userImages[0]?.id : null)) ||
        null,
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
        showSuccessToast("Haircut details added successfully", {
          autoClose: 2000,
        });
        card.haircutDetails.push(newHaircutDetails);
        haircutFormik.resetForm();
        haircutToggle();
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
    },
  });

  const handleCardEdit = (arg: any, line: any) => {
    setModal(true);
    setCard(arg);

    let card = arg;
    setCard({
      id: card.id,
      barber: card.barber,
      appointment_date: card.botId,
      haircutDetails: card.haircutDetails,
      Services: card.Services,
      salon: card.salon,
      userImages: card.userImages,
      title: card.title,
      text: card.text,
      paymentDetails: arg.paymentDetails || {
        amount: "0",
        tip: "0",
        totalAmount: "0",
      },
    });
    setKanbanTasksCards(line?.id);
    setIsEdit(true);

    toggle();
  };

  const handleWaitTime = (arg: any, line: any) => {
    setWaitTimeModal(true);

    let card = arg;
    setCard({
      id: card?.id,
      additionalTime: null,
    });

    waitTimeToggle();
  };

  const handleAddNewCard = (line: any) => {
    if (storeRoleInfo.role_name === ROLES.SALON_MANAGER) {
      appointmentFormik.setFieldValue("salon_id", authSalonUser?.id);
      getBarberSessionsData(authSalonUser?.id);
    }
    setCard("");
    setIsEdit(false);
    appointmentToggle();
    setKanbanTasksCards(line?.id);
  };

  const [images, setImages] = useState<any>([]);

  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const onClickDelete = (card: any) => {
    setCard(card);
    setDeleteModal(true);
  };

  const handleDeleteCard = () => {
    if (card) {
      // dispatch(OnDeleteKanban(card?.id));
      setDeleteModal(false);
    }
  };

  const handlePhoneChange = (e: any) => {
    // Remove non-digit characters and limit to 10 digits
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);

    // Format the phone number
    const formattedPhone = formatPhoneNumber(cleaned);

    // Update the form state with the formatted phone number
    appointmentFormik.setFieldValue("mobile_number", formattedPhone);
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

  const formatPaymentMode = (mode: string) => {
    switch (mode) {
      case "Pay_Online":
        return "Pay Online";
      case "Pay_In_Person":
        return "Pay in Person";
      default:
        return "Unknown";
    }
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
    if (value !== "custom") {
      setCustomTip("");
      calculateFinalAmount(totalPrice, value, "");
    } else {
      setCustomTip("");
      calculateFinalAmount(totalPrice, "custom", "");
    }
  };

  const [tipSubmitted, setTipSubmitted] = useState(false);
  const handleTipSubmit = async (appointmentId: any) => {
    setTipSubmitted(true);
    const newTip = Number(formData.tipAmount);

    if (!formData.tipAmount || isNaN(newTip) || newTip <= 0) {
      showErrorToast("Please enter a valid tip amount.");
      return;
    }

    try {
      setTipSubmitting(true);
      await updateTipAmount(appointmentId, newTip);

      // ✅ Update UI immediately without fetching
      setCards((prevCards: any[]) =>
        prevCards.map((column: any) => {
          return {
            ...column,
            cards: column.cards.map((c: any) => {
              if (c.id === appointmentId?.toString()) {
                const oldTip = parseFloat(c.paymentDetails?.tip || "0");
                const oldTotal = parseFloat(
                  c.paymentDetails?.totalAmount || "0"
                );
                const updatedTip = oldTip + newTip;
                const updatedTotal = oldTotal + newTip;

                return {
                  ...c,
                  paymentDetails: {
                    ...c.paymentDetails,
                    tip: updatedTip.toFixed(2),
                    totalAmount: updatedTotal.toFixed(2),
                  },
                };
              }
              return c;
            }),
          };
        })
      );

      showSuccessToast("Tip submitted successfully!");
      setTipModalOpen(false);
      setFormData({ ...formData, tipAmount: "" });
      setTipSubmitted(false);
    } catch (error) {
      showErrorToast("Failed to update tip.");
    } finally {
      setTipSubmitting(false);
    }
  };
  const handleAddTip = (card: any) => {
    setSelectedCard(card); // Store selected card details
    setTipModalOpen(true); // Open the tip modal
  };

  // Fetch the card details when the modal is opened
  useEffect(() => {
    if (selectedCard) {
      // Extract data from selected card (if needed, fetch from backend)
      setCardDetails(selectedCard); // Set card details to state
      setFormData({
        ...formData,
        tipAmount: selectedCard?.paymentDetails?.tip || "0", // Initialize tipAmount with the existing tip if available
      });
    }
  }, [selectedCard]);

  const handleCustomTipChange = (e: any) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    if (value.length <= 4) {
      setCustomTip(value);
      setIsInvalid(false);
      calculateFinalAmount(totalPrice, "custom", value);
    } else {
      setIsInvalid(true);
    }
  };
  const calculateFinalAmount = (total: number, tip: any, custom: any) => {
    // 'total' here is assumed to include tax.
    let calculatedTip = 0;

    if (tip === "custom") {
      calculatedTip = parseFloat(custom || "0");
    } else if (!isNaN(parseFloat(tip))) {
      // Calculate tip percentage over the full current total (which includes tax)
      calculatedTip = (total * parseFloat(tip)) / 100;
    }

    setTipAmount(calculatedTip);
    setFinalAmount(total + calculatedTip);
  };

  const handleConfirmationCard = async () => {
    setConfirmationModal(false);
    if (selectedCardNewStatus) {
      updateNewCardStatus();
    } else {
      if (selectedCard) {
        const { source, destination } = selectedCard;

        const sourceLine = cards.find(
          (line: any) => line.id === source.droppableId
        );
        const destinationLine = cards.find(
          (line: any) => line.id === destination.droppableId
        );

        // Check if it's the same list or different lists
        const isSameList = source.droppableId === destination.droppableId;

        // Get the moved card
        const movedCard = sourceLine.cards[source.index];

        const updatedSourceCards = Array.from(sourceLine.cards);
        const updatedDestinationCards = isSameList
          ? updatedSourceCards
          : Array.from(destinationLine.cards);

        // Remove from source and add to destination
        updatedSourceCards.splice(source.index, 1);
        updatedDestinationCards.splice(destination.index, 0, movedCard);
        if (updatedDestinationCards?.length === 0) {
          const timer = setTimeout(() => {
            setShowLoader(false);
          }, 5000); // Hide loader after 5 seconds
          return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
        } else {
          setShowLoader(false); // Immediately hide loader if data is available
        }
        // Optimistic update of the UI
        const updatedLines = cards.map((line: any) => {
          if (line.id === source.droppableId) {
            return {
              ...line,
              badge: updatedSourceCards.length,
              cards: updatedSourceCards,
            };
          } else if (line.id === destination.droppableId) {
            return {
              ...line,
              badge: updatedDestinationCards.length,
              cards: updatedDestinationCards,
            };
          }
          return line;
        });

        setCards(updatedLines);

        // Prepare API call for updating status
        // const newStatus = destinationLine.name === "Insalon" ? "insalon" : "pending";
        const newStatus = destinationLine.name;
        const statusData = { status: newStatus };
        try {
          await updateAppointmentStatus(movedCard.id, statusData);

          setShowLoader(true);
          showSuccessToast("Appointment updated successfully", {
            autoClose: 2000,
          });
          const response: any = await fetchBoardAppointments(null, null);
          if (activeFilterBarber) {
            if (activeFilterBarber.id === "all") {
              // Show all appointments if "All" is selected
              setTempAppointments(response);
              const groupedData = groupAndSortData(response, order);
              setCards(groupedData);
              if (groupedData?.length === 0) {
                const timer = setTimeout(() => {
                  setShowLoader(false);
                }, 5000); // Hide loader after 5 seconds
                return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
              } else {
                setShowLoader(false); // Immediately hide loader if data is available
              }
            } else {
              const filterbarberAppointments = response?.filter(
                (appo: any) => appo.BarberId === activeFilterBarber?.id
              );
              const groupedData = groupAndSortData(
                filterbarberAppointments,
                order
              );
              setCards(groupedData);

              if (groupedData?.length === 0) {
                const timer = setTimeout(() => {
                  setShowLoader(false);
                }, 5000); // Hide loader after 5 seconds
                return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
              } else {
                setShowLoader(false); // Immediately hide loader if data is available
              }
            }
          } else {
            const groupedData = groupAndSortData(response, order);
            setCards(groupedData);
            if (groupedData?.length === 0) {
              const timer = setTimeout(() => {
                setShowLoader(false);
              }, 5000); // Hide loader after 5 seconds
              return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
            } else {
              setShowLoader(false); // Immediately hide loader if data is available
            }
          }

          // const response = await fetch(`/api/appointments/status/${movedCard.id}`, {
          //   method: "PUT",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({ status: newStatus }),
          // });

          // if (!response.ok) {
          //   throw new Error("Failed to update status");
          // }
        } catch (error: any) {
          // Check if the error has a response property (Axios errors usually have this)
          if (error.response && error.response.data) {
            const apiMessage = error.response.data.message; // Extract the message from the response
            showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
          }
          // Revert the UI changes if API fails
          const revertedLines = cards.map((line: any) => {
            if (line.id === source.droppableId) {
              return {
                ...line,
                badge: sourceLine.cards.length,
                cards: sourceLine.cards,
              };
            } else if (line.id === destination.droppableId) {
              return {
                ...line,
                badge: destinationLine.cards.length,
                cards: destinationLine.cards,
              };
            }
            return line;
          });

          setCards(revertedLines);
        }
        setSelectedCard(null);
      }
    }
  };

  const handleImage = (image: any) => {
    const updatedImages = images.includes(image)
      ? images.filter((item: any) => item !== image)
      : [...images, image];

    setImages(updatedImages);
    validation.setFieldValue("userImages", updatedImages);
  };
  useEffect(() => {
    if (card && card?.userImages?.length > 0) {
      setImages([...card?.userImages]);
    }
  }, [card]);

  const allBarbers = [{ id: "all", name: "All" }, ...barberData];

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleFilterClick = (barber: any) => {
    setActiveFilter(barber.name);
    setActiveFilterBarber(barber);
    if (barber?.id === "all") {
      // Show all appointments if "All" is selected
      const groupedData = groupAndSortData(tempAppointments, order);
      setCards(groupedData);
      setShowLoader(false);
    } else {
      const filterbarberAppointments = tempAppointments?.filter(
        (appo: any) => appo.BarberId === barber?.id
      );
      const groupedData = groupAndSortData(filterbarberAppointments, order);
      setCards(groupedData);

      if (groupedData?.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 5000); // Hide loader after 5 seconds
        return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
      } else {
        setShowLoader(false); // Immediately hide loader if data is available
      }
    }
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(prev + 1, barberData.length - visibleCount)
    );
  };

  const toggleBarberModal = () => {
    setIsBarberModalOpen(!isBarberModalOpen);
  };

  const cancelBarberModal = () => {
    // if (isBarberModalOpen) {
    //   setSelectedBarber(null);
    //   setSelectedBarberId(null);
    // }
    toggleBarberModal();
  };

  const handleConfirm = () => {
    appointmentFormik.setFieldValue("barber_id", selectedBarberId);
    if (selectedTotalServiceTime) {
      getBarberScheduleData(selectedBarberId, selectedTotalServiceTime);
    } else {
      appointmentFormik.setFieldValue("barber_id", "");
      setIsAppointmentAvailable(false);
      showWarningToast("Please first select atleast one service!!!");
    }
    toggleBarberModal(); // Close modal after confirmation
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCard}
        onCloseClick={() => setDeleteModal(false)}
      />
      <ConfirmationModal
        show={confirmationModal}
        cardDetails={selectedCard}
        isButtonClick={selectedCardOldStatus ? true : false}
        oldStatus={selectedCardOldStatus}
        newStatus={selectedCardNewStatus}
        cardList={cards}
        onOkClick={handleConfirmationCard}
        onCloseClick={() => setConfirmationModal(false)}
      />

      <div className="d-flex justify-content-center align-items-center mb-3">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          className="btn btn-link btn-sm mx-1 custom-btn"
          // style={{
          //   cursor: startIndex === 0 ? "not-allowed" : "pointer",
          //   fontSize: "12px", // Inline for precise font control
          // }}
        >
          {"<"}
        </button>

        {/* Stepper */}
        <div className="d-flex gap-1">
          {allBarbers
            .slice(startIndex, startIndex + visibleCount)
            .map((barber: any, index: any) => (
              <div
                key={index}
                className={`px-2 py-1 text-center rounded ${
                  activeFilter === barber.name
                    ? "bg-primary text-white"
                    : "bg-light "
                }`}
                style={{
                  cursor: "pointer",
                  border: "1px solid #ddd",
                  fontSize: "12px", // Smaller font size for step items
                  minWidth: "70px", // Slightly smaller width
                }}
                onClick={() => handleFilterClick(barber)}
              >
                {barber.name}
              </div>
            ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={startIndex >= allBarbers.length - visibleCount}
          className="btn btn-link btn-sm mx-1 custom-btn "
          style={{
            cursor:
              startIndex >= allBarbers.length - visibleCount
                ? "not-allowed"
                : "pointer",
          }}
        >
          {">"}
        </button>
      </div>

      {/* <Card>
        <CardBody>
          <Row className="g-2">
            <div className="col-lg-auto">
              <div className="hstack gap-2">
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createboardModal" onClick={handleOpen}>
                  <i className="ri-add-line align-bottom me-1"></i> Create Board</button>
              </div>
            </div>
            <div className="col-lg-3 col-auto">
              <div className="search-box">
                <input type="text" className="form-control search" id="search-task-options" placeholder="Search for project, tasks..." />
                <i className="ri-search-line search-icon"></i>
              </div>
            </div>
            <div className="col-auto ms-sm-auto">
              <div className="avatar-group" id="newMembar">
                {(headData || []).map((item: any, key: any) => (<Link to="#" className="avatar-group-item" data-bs-toggle="tooltip" key={key} data-bs-trigger="hover" data-bs-placement="top" aria-label={item.name} data-bs-original-title={item.name}>
                  <img src={item.picture} alt="" className="rounded-circle avatar-xs" />
                </Link>))}
                <Link to="#addmemberModal" data-bs-toggle="modal" className="avatar-group-item" >
                  <div className="avatar-xs">
                    <div className="avatar-title rounded-circle">
                      +
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </Row>
        </CardBody>
      </Card> */}

      <div className="tasks-board mb-3 d-flex" id="kanbanboard">
        <DragDropContext onDragEnd={handleDragEnd}>
          {showLoader && (
            <Loader /> // Display a loader while data is loading
          )}
          {(cards || []).map((line: KanbanColumn) => {
            return (
              // header line
              <div className="tasks-list" key={line.id}>
                <div className="d-flex mb-3">
                  <div className="flex-grow-1">
                    <h6 className="fs-14 text-uppercase fw-semibold mb-0">
                      {line.nameAlias}{" "}
                      <small
                        className={`badge bg-${line.color} align-bottom ms-1 totaltask-badge`}
                      >
                        {line.badge}
                      </small>
                    </h6>
                  </div>
                  {/* <div className="flex-shrink-0">
                        <UncontrolledDropdown className="card-header-dropdown float-end">
                          <DropdownToggle
                            className="text-reset dropdown-btn"
                            tag="a"
                            color="white"
                          >
                            <span className="fw-medium text-muted fs-12">Priority<i className="mdi mdi-chevron-down ms-1"></i></span>
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem>Priority</DropdownItem>
                            <DropdownItem>Date Added</DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div> */}
                </div>
                {line.nameAlias === "Check In" && (
                  <div className="my-2 mt-0">
                    <button
                      className="btn btn-soft-info w-100"
                      data-bs-toggle="modal"
                      data-bs-target="#creatertaskModal"
                      onClick={() => handleAddNewCard(line)}
                    >
                      Add Appointment
                    </button>
                  </div>
                )}
                {/* data */}
                <SimpleBar className="tasks-wrapper px-3 mx-n3">
                  <div
                    id="unassigned-task"
                    className={
                      line.cards === "object" ? "tasks" : "tasks noTask"
                    }
                  >
                    <Droppable droppableId={line.id}>
                      {(provided: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {line.cards.length > 0 ? (
                            line.cards.map((card: any, index: any) => {
                              return (
                                <Draggable
                                  key={card?.id}
                                  draggableId={card?.id}
                                  index={index}
                                >
                                  {(provided: any) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      // className="card task-list"
                                      className="pb-1 task-list"
                                      id={line.name + "-task"}
                                    >
                                      <div
                                        className="card task-box"
                                        id="uptask-1"
                                      >
                                        <CardBody>
                                          <Link
                                            to="#"
                                            className="text-muted fw-medium fs-14 flex-grow-1 "
                                          >
                                            {card.cardId}
                                          </Link>
                                          <UncontrolledDropdown className="float-end">
                                            <DropdownToggle
                                              className="cursor-pointer"
                                              tag="a"
                                              color="white"
                                            >
                                              <i className="ri-more-fill"></i>
                                            </DropdownToggle>
                                            <DropdownMenu className="dropdown-menu-end">
                                              <DropdownItem
                                                className="edittask-details"
                                                onClick={() =>
                                                  handleCardEdit(card, line)
                                                }
                                              >
                                                <i className="ri-eye-line me-2"></i>
                                                View
                                              </DropdownItem>
                                              {line.nameAlias ===
                                                "In Salon" && (
                                                <DropdownItem
                                                  className="deletetask"
                                                  onClick={() =>
                                                    handleWaitTime(card, line)
                                                  }
                                                >
                                                  <i className="ri-time-line"></i>{" "}
                                                  Add Minutes
                                                </DropdownItem>
                                              )}
                                            </DropdownMenu>
                                          </UncontrolledDropdown>
                                          <div className="mb-3">
                                            <h6 className="fs-15 mb-0 flex-grow-1 text-truncate task-title">
                                              <Link
                                                to="#"
                                                className="d-block"
                                                id="task-name"
                                              >
                                                {card.title}
                                              </Link>
                                            </h6>
                                          </div>
                                          <div className="d-flex mb-1">
                                            <div className="flex-grow-1">
                                              <b>Services: </b>{" "}
                                              {card?.Services?.length > 0 ? (
                                                card.Services.map(
                                                  (element: any, idx: any) => (
                                                    <span>
                                                      {" "}
                                                      {idx > 0 && (
                                                        <span>,</span>
                                                      )}{" "}
                                                      {element.name}
                                                    </span>
                                                  )
                                                )
                                              ) : (
                                                <span className="text-muted">
                                                  <i>No data found</i>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-muted">
                                            {card.text}
                                          </p>

                                          {card.picture ? (
                                            <div
                                              className="tasks-img rounded mb-2"
                                              style={{
                                                backgroundImage: `url(${card.picture})`,
                                                height: "135px",
                                              }}
                                            ></div>
                                          ) : (
                                            ""
                                          )}
                                          <div className="flex-grow-1">
                                            <b>Mobile:</b>{" "}
                                            <span>{card.mobile_number}</span>
                                          </div>
                                          {/* badge & image */}
                                          {
                                            <div className="d-flex align-items-start justify-content-between">
                                              <div className="d-block">
                                                <div className="flex-grow-1">
                                                  <b>Queue Position: </b>{" "}
                                                  <span>
                                                    {card.queue_position}
                                                  </span>
                                                </div>
                                                <div className="flex-grow-1">
                                                  <b>
                                                    <i className="ri-user-line"></i>{" "}
                                                  </b>{" "}
                                                  <span>
                                                    {card.number_of_people}
                                                  </span>
                                                </div>
                                                <div className="flex-grow-1">
                                                  <b>
                                                    <i className="ri-time-line"></i>
                                                  </b>{" "}
                                                  <span>
                                                    {card.estimated_wait_time >
                                                    60
                                                      ? `${Math.floor(
                                                          card.estimated_wait_time /
                                                            60
                                                        )} hr ${
                                                          card.estimated_wait_time %
                                                          60
                                                        } min`
                                                      : `${card.estimated_wait_time} min`}
                                                  </span>
                                                </div>

                                                {(line.nameAlias ===
                                                  "Check In" ||
                                                  line.nameAlias ===
                                                    "In Salon" ||
                                                  line.name ===
                                                    "completed") && (
                                                  <div className="flex-grow-1 mt-2">
                                                    {/* Button for "In Salon" */}
                                                    {line.nameAlias ===
                                                      "Check In" && (
                                                      <Button
                                                        color="info"
                                                        type="button"
                                                        style={{
                                                          padding: "0px 5px",
                                                          margin: "0 5px 0 0",
                                                        }}
                                                        onClick={() =>
                                                          updateStatus(
                                                            card,
                                                            "check_in",
                                                            "in_salon"
                                                          )
                                                        }
                                                        disabled={inSalonLoader} // Disable button when loader is active
                                                      >
                                                        {inSalonLoader &&
                                                          selectedCard?.id ===
                                                            card?.id && (
                                                            <Spinner
                                                              size="sm"
                                                              className="me-2"
                                                            >
                                                              Loading...
                                                            </Spinner>
                                                          )}
                                                        In Salon
                                                      </Button>
                                                    )}

                                                    {/* Button for "Cancel" */}
                                                    {line.nameAlias ===
                                                      "Check In" && (
                                                      <Button
                                                        color="danger"
                                                        type="button"
                                                        disabled={cancelLoader} // Disable button when loader is active
                                                        style={{
                                                          padding: "0px 5px",
                                                        }}
                                                        onClick={() =>
                                                          updateStatus(
                                                            card,
                                                            "check_in",
                                                            "canceled"
                                                          )
                                                        }
                                                      >
                                                        {cancelLoader &&
                                                          selectedCard?.id ===
                                                            card?.id && (
                                                            <Spinner
                                                              size="sm"
                                                              className="me-2"
                                                            >
                                                              Loading...
                                                            </Spinner>
                                                          )}
                                                        Cancel
                                                      </Button>
                                                    )}

                                                    {/* Button for "Complete" */}
                                                    {line.nameAlias ===
                                                      "In Salon" && (
                                                      <Button
                                                        color="success"
                                                        type="button"
                                                        style={{
                                                          padding: "0px 5px",
                                                          margin: "0 5px 0 0",
                                                        }}
                                                        onClick={() =>
                                                          updateStatus(
                                                            card,
                                                            "in_salon",
                                                            "completed"
                                                          )
                                                        }
                                                        disabled={
                                                          completedLoader
                                                        } // Disable button when loader is active
                                                      >
                                                        {completedLoader &&
                                                          selectedCard?.id ===
                                                            card?.id && (
                                                            <Spinner
                                                              size="sm"
                                                              className="me-2"
                                                            >
                                                              Loading...
                                                            </Spinner>
                                                          )}
                                                        Complete
                                                      </Button>
                                                    )}
                                                    {line.name ===
                                                      "completed" &&
                                                      (!card?.paymentDetails
                                                        ?.tip ||
                                                        Number(
                                                          card.paymentDetails
                                                            .tip
                                                        ) === 0) &&
                                                      card?.paymentDetails
                                                        ?.paymentMode !==
                                                        "Pay_Online" && (
                                                        <Button
                                                          color="primary"
                                                          type="button"
                                                          style={{
                                                            padding: "0px 5px",
                                                          }}
                                                          onClick={() =>
                                                            handleAddTip(card)
                                                          }
                                                        >
                                                          Add Tip
                                                        </Button>
                                                      )}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex-shrink-0">
                                                <div className="avatar-group">
                                                  {card.userImages.map(
                                                    (
                                                      picturedata: any,
                                                      idx: any
                                                    ) => (
                                                      <Link
                                                        to="#"
                                                        className="avatar-group-item"
                                                        data-bs-toggle="tooltip"
                                                        data-bs-trigger="hover"
                                                        data-bs-placement="top"
                                                        title="Alexis"
                                                        key={idx}
                                                      >
                                                        <img
                                                          src={picturedata.img}
                                                          alt=""
                                                          className="rounded-circle avatar-xxs"
                                                        />
                                                      </Link>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          }
                                        </CardBody>
                                        {/* bottom */}
                                        <div className="card-footer border-top-dashed">
                                          <div>
                                            <div className="flex-grow-1">
                                              <b>Barber:</b>
                                              <b
                                                className="px-2 py-1"
                                                style={{
                                                  color: card.barber_bg_color,
                                                }}
                                              >
                                                {card.barber}
                                              </b>
                                            </div>
                                            <div className="flex-grow-1">
                                              <b>Salon: </b>{" "}
                                              <span>{card.salon}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="card-footer border-top-dashed cursor-auto">
                                          <div>
                                            <div className="flex-grow-1">
                                              <b>Payment Mode: </b>
                                              <span>
                                                {formatPaymentMode(
                                                  card.paymentMode
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex-grow-1">
                                              <b>Payment:</b>
                                              <b
                                                className="px-2 py-1"
                                                style={{
                                                  color:
                                                    card?.paymentStatus?.toLowerCase() ===
                                                    "success"
                                                      ? "green"
                                                      : "red",
                                                }}
                                              >
                                                {card?.paymentStatus ??
                                                  "Pending"}
                                              </b>
                                              {card?.paymentStatus?.toLowerCase() ===
                                                "success" &&
                                                card?.paymentMode !==
                                                  "Pay_In_Person" && (
                                                  <Link
                                                    to={
                                                      card.paymentDetails
                                                        ?.receiptUrl
                                                    }
                                                    target="_blank"
                                                    className="btn btn-warning p-0 px-2"
                                                    data-tooltip-id="download-tooltip"
                                                    data-tooltip-content="Download Receipt"
                                                    onClick={() =>
                                                      handlePrint()
                                                    }
                                                  >
                                                    <i className="ri-download-line"></i>{" "}
                                                    Receipt
                                                  </Link>
                                                )}
                                            </div>
                                            <div className="flex-grow-1">
                                              <b>Tip: </b>
                                              <span>
                                                ${card.paymentDetails?.tip ?? 0}
                                              </span>
                                            </div>
                                            <div className="flex-grow-1">
                                              <b>Total amount: </b>
                                              <span>
                                                $
                                                {card.paymentDetails
                                                  ?.totalAmount ?? 0}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="card-footer border-top-dashed">
                                          <div className="d-flex">
                                            <div className="flex-grow-2">
                                              <span className="text-muted">
                                                <i className="ri-time-line align-bottom"></i>
                                                &nbsp; {card.botId}
                                              </span>
                                            </div>
                                            {/* <div className="flex-shrink-0">
                                                <ul className="link-inline mb-0">
                                                  <li className="list-inline-item">
                                                    <Link to="#" className="text-muted"><i className="ri-eye-line align-bottom"></i> {card.eye}</Link>
                                                  </li>
                                                  <li className="list-inline-item">
                                                    <Link to="#" className="text-muted"><i className="ri-question-answer-line align-bottom"></i> {card.que}</Link>
                                                  </li>
                                                  <li className="list-inline-item">
                                                    <Link to="#" className="text-muted"><i className="ri-attachment-2 align-bottom"></i> {card.clip}</Link>
                                                  </li>
                                                </ul>
                                              </div> */}
                                          </div>
                                        </div>

                                        {card.botpro ? (
                                          <div className="progress progress-sm">
                                            <div
                                              className={`progress-bar bg-${card.botprocolor}`}
                                              role="progressbar"
                                              style={{
                                                width: `${card.botpro}`,
                                              }}
                                            ></div>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          ) : (
                            // Show empty message when no cards are available
                            <div className="text-center text-muted py-3">
                              No appointments available.
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </SimpleBar>
              </div>
            );
          })}
        </DragDropContext>
      </div>
      <Modal
        id="modalForm"
        isOpen={modal}
        toggle={toggle}
        centered={true}
        backdrop="static"
        size="lg"
      >
        <ModalHeader toggle={toggle}>Appointment Details</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
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
                        {card?.userImages?.map((picturedata: any, idx: any) => (
                          <img
                            key={idx}
                            src={picturedata.img}
                            alt="User"
                            className="rounded-circle img-fluid"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Fields and Labels */}
              <div className="col-lg-8">
                <div className="form-group py-2 border-bottom">
                  <b>Customer Name: </b>
                  <span>{card?.title || "N/A"}</span>
                </div>
                <div className="form-group py-2 border-bottom">
                  <b>Salon Name: </b>
                  <span> {card?.salon || "N/A"}</span>
                </div>
                <div className="form-group py-2 border-bottom">
                  <b>Barber Name: </b>
                  <span>{card?.barber || "N/A"}</span>
                </div>
                <div className="form-group py-2 border-bottom">
                  <b>Services: </b>
                  <span>
                    {card?.Services?.length > 0 ? (
                      card.Services.map((element: any, idx: any) => (
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
                    <span>{card?.paymentDetails?.totalAmount || "N/A"}</span>
                  </div>
                  <div style={{ width: "50%" }}>
                    <b>Tip: </b>
                    <span>{card?.paymentDetails?.tip || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Haircut Details Section */}
            <div className="d-flex align-items-center justify-content-end mt-2 gap-2">
              {/* Left: Add Haircut Details */}
              <div>
                <button
                  className="btn btn-primary mb-4"
                  data-bs-toggle="modal"
                  data-bs-target="#createboardModal"
                  onClick={handleOpen}
                >
                  <i className="ri-add-line align-bottom me-1"></i> Add Haircut
                  Details
                </button>
              </div>
              {/* 
              <div>
                <button
                  className="btn btn-primary mb-4"
                  onClick={() => setTipModalOpen(true)}
                >
                  <i className="ri-cash-line align-bottom me-1"></i> Add Tip
                </button>
              </div> */}
            </div>

            {card?.haircutDetails?.length ? (
              <TableContainer
                columns={columns}
                data={card?.haircutDetails}
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
          {cardDetails && (
            <>
              <Col lg={12}>
                {/* Previous Tip */}
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
                      tipSubmitted &&
                      (!formData.tipAmount || Number(formData.tipAmount) <= 0)
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                </div>
              </Col>

              <Col lg={12}>
                {/* Previous Tip and Total */}
                {/* <div className="d-flex justify-content-between mt-2">
                  <span>
                    <b>Previous Tip:</b>
                  </span>
                  <span>
                    $
                    {parseFloat(
                      cardDetails?.paymentDetails?.tip || "0"
                    ).toFixed(2)}
                  </span>
                </div> */}

                {/* <div className="d-flex justify-content-between">
                  <span>
                    <b>Previous Total:</b>
                  </span>
                  <span>
                    $
                    {parseFloat(
                      cardDetails?.paymentDetails?.totalAmount || "0"
                    ).toFixed(2)}
                  </span>
                </div> */}

                {/* <hr /> */}

                {/* New Tip and New Total */}
                <div className="d-flex justify-content-between">
                  <span>
                    <b>Tip:</b>
                  </span>
                  <span>
                    ${parseFloat(formData.tipAmount || "0").toFixed(2)}
                  </span>
                </div>

                <div className="d-flex justify-content-between">
                  <span>
                    <b>New Total:</b>
                  </span>
                  <span>
                    $
                    {(
                      parseFloat(
                        cardDetails?.paymentDetails?.totalAmount || "0"
                      ) + parseFloat(formData.tipAmount || "0")
                    ).toFixed(2)}
                  </span>
                </div>
              </Col>

              <div className="text-end mt-3">
                <Button
                  color="success"
                  onClick={() => handleTipSubmit(cardDetails?.id)} // Pass card ID to submit tip
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
            </>
          )}
        </ModalBody>
      </Modal>

      <Modal
        id="waitmodalForm"
        isOpen={waitTimeModal}
        toggle={waitTimeToggle}
        centered={true}
        backdrop="static" // Prevents closing on outside click
      >
        <ModalHeader toggle={waitTimeToggle}>Add Waiting Time</ModalHeader>
        <Form
          onSubmit={(event: any) => {
            event.preventDefault();
            waitTimValidation.handleSubmit();
            return false;
          }}
        >
          <ModalBody>
            <div className="form-group mb-3">
              <Label htmlFor="taskname" className="col-form-label">
                Additional Time
              </Label>
              <Col lg={12}>
                <Input
                  name="additionalTime"
                  id="additionalTime"
                  className="form-control"
                  placeholder="Enter Additional Time"
                  type="number"
                  onChange={waitTimValidation.handleChange}
                  onBlur={waitTimValidation.handleBlur}
                  value={waitTimValidation.values.additionalTime}
                  invalid={
                    waitTimValidation.touched.additionalTime &&
                    waitTimValidation.errors.additionalTime
                      ? true
                      : false
                  }
                />
                {waitTimValidation.touched.additionalTime &&
                waitTimValidation.errors.additionalTime ? (
                  <FormFeedback type="invalid">
                    {waitTimValidation.errors.additionalTime}
                  </FormFeedback>
                ) : null}
              </Col>
            </div>
          </ModalBody>
          <div className="modal-footer">
            <div className="hstack gap-2 justify-content-end">
              <Button
                type="button"
                onClick={() => {
                  setWaitTimeModal(false);
                }}
                className="btn-light"
              >
                Close
              </Button>
              <button
                type="submit"
                className="btn btn-success"
                id="add-btn"
                disabled={showSpinner} // Disable button when loader is active
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      </Modal>
      <Modal
        isOpen={appointmentModal}
        toggle={appointmentToggle}
        centered
        backdrop="static"
      >
        <ModalHeader toggle={appointmentToggle}>Add Appointment</ModalHeader>
        <Form
          className="tablelist-form"
          onSubmit={appointmentFormik.handleSubmit}
        >
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
                {/* <Input
                  name="number_of_people"
                  id="number_of_people"
                  className="form-control"
                  placeholder="Enter Number Of People"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.number_of_people || ""}
                  invalid={
                    formik.touched.number_of_people && formik.errors.number_of_people ? true : false
                  }
                /> */}
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
                        value={appointmentFormik.values.salon_id}
                        onChange={handleSalonChange}
                      >
                        <option value="">Select a salon</option>
                        {salonData.map((salon) => (
                          <option key={salon.salon_id} value={salon.salon_id}>
                            {salon.salon_name}
                          </option>
                        ))}
                      </select>
                      {appointmentFormik.touched.salon_id &&
                        appointmentFormik.errors.salon_id && (
                          <div className="invalid-feedback">
                            {appointmentFormik.errors.salon_id}
                          </div>
                        )}
                    </div>
                  </Col>
                )}
              {/* Barber ID */}
              {userCategory !== ROLES.WALKIN_BARBER && (
                <Col lg={12}>
                  <div>
                    <Label htmlFor="barber" className="form-label">
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
                      value={appointmentFormik.values.barber_id}
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

                    {appointmentFormik.touched.barber_id &&
                      appointmentFormik.errors.barber_id && (
                        <div className="invalid-feedback">
                          {appointmentFormik.errors.barber_id}
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
                  onChange={appointmentFormik.handleChange}
                  onBlur={appointmentFormik.handleBlur}
                  onKeyDown={(e) => {
                    preventSpaceKey(e); // Prevent spaces
                    if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                      e.preventDefault(); // Block non-alphabetic characters
                    }
                  }}
                  value={appointmentFormik.values.firstname || ""}
                  invalid={
                    appointmentFormik.touched.firstname &&
                    appointmentFormik.errors.firstname
                      ? true
                      : false
                  }
                />
                {appointmentFormik.touched.firstname &&
                appointmentFormik.errors.firstname ? (
                  <FormFeedback type="invalid">
                    {appointmentFormik.errors.firstname}
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
                  onChange={appointmentFormik.handleChange}
                  onBlur={appointmentFormik.handleBlur}
                  onKeyDown={(e) => {
                    preventSpaceKey(e); // Prevent spaces
                    if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                      e.preventDefault(); // Block non-alphabetic characters
                    }
                  }}
                  value={appointmentFormik.values.lastname || ""}
                  invalid={
                    appointmentFormik.touched.lastname &&
                    appointmentFormik.errors.lastname
                      ? true
                      : false
                  }
                />
                {appointmentFormik.touched.lastname &&
                appointmentFormik.errors.lastname ? (
                  <FormFeedback type="invalid">
                    {appointmentFormik.errors.lastname}
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
                  onChange={appointmentFormik.handleChange}
                  onBlur={appointmentFormik.handleBlur}
                  onKeyDown={preventSpaceKey}
                  value={appointmentFormik.values.email || ""}
                  invalid={
                    appointmentFormik.touched.email &&
                    appointmentFormik.errors.email
                      ? true
                      : false
                  }
                />
                {appointmentFormik.touched.email &&
                appointmentFormik.errors.email ? (
                  <FormFeedback type="invalid">
                    {appointmentFormik.errors.email}
                  </FormFeedback>
                ) : null}
              </Col>

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
                  onBlur={appointmentFormik.handleBlur}
                  value={appointmentFormik.values.mobile_number || ""}
                  invalid={
                    appointmentFormik.touched.mobile_number &&
                    appointmentFormik.errors.mobile_number
                      ? true
                      : false
                  }
                />
                {appointmentFormik.touched.mobile_number &&
                appointmentFormik.errors.mobile_number ? (
                  <FormFeedback type="invalid">
                    {appointmentFormik.errors.mobile_number}
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
                  appointmentToggle();
                }}
                className="btn-light"
              >
                Close
              </Button>
              <button
                type="submit"
                className="btn btn-success"
                id="add-btn"
                disabled={showAppointmentSpinner || !isAppointmentAvailable} // Disable button when loader is active
              >
                {showAppointmentSpinner && (
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

      {/* Create Modal */}
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
              onSubmit={(event: any) => {
                event.preventDefault();
                haircutFormik.handleSubmit();
                return false;
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
                          onKeyDown={preventSpaceKey}
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
                              {typeof formik.errors.haircut_style === "string"
                                ? formik.errors.haircut_style
                                : ""}
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
                          onKeyDown={preventSpaceKey}
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
                              {typeof formik.errors.product_used === "string"
                                ? formik.errors.product_used
                                : ""}
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
      <Modal
        isOpen={isBarberModalOpen}
        toggle={toggleBarberModal}
        centered
        backdrop="static"
      >
        <ModalHeader toggle={cancelBarberModal}>
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
                    ?.slice(-1)
                    ?.toString()
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

export default Board;
