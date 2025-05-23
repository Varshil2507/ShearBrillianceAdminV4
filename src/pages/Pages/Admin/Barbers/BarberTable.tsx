import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ModalBody,
  Button,
  Row,
  Col,
  Form,
  Input,
  Label,
  ModalHeader,
  Spinner,
} from "reactstrap";
import TableContainer from "Components/Common/TableContainer";
import Profile from "../../../../assets/images/users/avatar-8.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteModal from "../../../../../src/Components/Common/DeleteModal";
import {
  fetchBarber,
  addBarber,
  deleteBarber,
  updateBarber,
} from "Services/barberService";

import Select from "react-select";
import Loader from "Components/Common/Loader";
import { fetchSalons } from "Services/SalonService";
import { fetchServices } from "Services/Service";
import { formatDate, formatTime } from "Components/Common/DateUtil";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";
import { ROLES } from "common/data/Constants";
import { strictNameValidation } from "Components/Common/Namevalidation";

// Define the User type based on your database structure
interface Barber {
  id: number;
  firstname: string;
  lastname: string;
  address: string;
  mobile_number: string; // Allow undefined if that's the case in the imported type
  email: string;
  password: string;
  availability_status: string; // Add this line
  photo: string;
  cutting_since?: string;
  background_color?: string;
  organization_join_date?: string;
  category?: string;
  position?: string;
  SalonId: number;
  salon: any;
  UserId: number;
  user: any;
  non_working_days: any[];
  weekly_schedule: any[];
  servicesWithPrices: any;
}

interface Salon {
  salon_id: number;
  salon_name: string;
  availability_status: string; // Field for availability status
  photos: number; // Field for default service time
  creappointment_countted_at: string;
  address: string; // Fixed typo here
  barbers?: object; // Add this line
  salon: any; // Using string for time format
}

interface Service {
  id: number;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  default_service_time: number;
  isActive: boolean;
}

interface BarberService {
  ServiceId: number;
  price: any | null;
  isChecked: boolean;
}

type OptionType = {
  value: number;
  label: string;
};

const BarberTable: React.FC = () => {
  const [barberData, setBarberData] = useState<Barber[]>([]);
  const [salonData, setSalonData] = useState<Salon[]>([]);
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [barberServices, setBarberServices] = useState<BarberService[]>([]);
  const [modal, setModal] = useState(false);
  const [newBarber, setNewBarber] = useState<Barber | null>(null);

  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null); // State for the user to delete
  const [selectedSalonOpenTime, setSalonOpenTime] = useState<any>(null); // State for the user to delete
  const [selectedSalonCloseTime, setSalonCloseTime] = useState<any>(null); // State for the user to delete
  const [selectedSalonOpenTimeAMPM, setSalonOpenTimeAMPM] = useState<any>(null); // State for the user to delete
  const [selectedSalonCloseTimeAMPM, setSalonCloseTimeAMPM] =
    useState<any>(null); // State for the user to delete

  const [selectedSalonId, setSelectedSalonId] = useState<number>();
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [selectedPositionOption, setSelectedPositionOption] = useState<
    any | null
  >(null);
  const [passwordShow, setPasswordShow] = useState(false);
  const selectedSalonOpenTimeRef = useRef<any>(null);
  const selectedSalonCloseTimeRef = useRef<any>(null);
  const selectedSalonOpenTimeAMPMRef = useRef<any>(null);
  const selectedSalonCloseTimeAMPMRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(0);
  const [selectedSearchText, selectedSearch] = useState<null>(null);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<OptionType[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({}); // To track errors for each service
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [schedule, setSchedule] = useState(
    daysOfWeek.map((day) => ({
      day,
      isChecked: false,
      startTime: "",
      endTime: "",
      isReadonly: false,
    }))
  );
  const authTUser = localStorage.getItem("authUser");
  let storeUserInfo: any;
  if (authTUser) {
    storeUserInfo = JSON.parse(authTUser);
  }
  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  let salonDetails = localStorage.getItem("salonDetails");
  let storesalonDetailInfo: any;
  if (salonDetails) {
    storesalonDetailInfo = JSON.parse(salonDetails);
  }
  const days = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
  ];

  // Get today's date in 'YYYY-MM-DD' format
  const today = new Date().toISOString().split("T")[0];

  const limit = 10; // Items per page

  // Toggle modal visibility
  const toggleModal = () => {
    setModal(!modal);
    formik.resetForm();
  };

  // Toggle modal visibility
  const closeModal = () => {
    setIsEditing(false);
    setShowSpinner(false);
    setSelectedDays([]);
    toggleModal();
  };

  useEffect(() => {
    const salonId = storesalonDetailInfo
      ? storesalonDetailInfo.id
      : storeUserInfo?.salon?.id;

    if (
      storeRoleInfo.role_name === ROLES.SALON_MANAGER ||
      storeRoleInfo.role_name === ROLES.SALON_OWNER ||
      storesalonDetailInfo
    ) {
      setSelectedSalonId(salonId);
      formik.setFieldValue("SalonId", salonId);

      // ✅ Always fetch barbers here
      fetchBarbersList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, null);
    } else {
      const fetchSalonsList = async () => {
        try {
          const response: any = await fetchSalons(1, null, null);
          setSalonData(response?.salons);

          // ✅ Fetch barbers even for Admin or Super Admin
          fetchBarbersList(
            selectedCurrentPage ? selectedCurrentPage + 1 : 1,
            null
          );
        } catch (error: any) {
          showErrorToast(error.response?.data?.message || error.message);
        }
      };
      fetchSalonsList();
    }

    fetchServiceList();
  }, []);

  const fetchBarbersList = async (page: any, search: any) => {
    try {
      const response: any = await fetchBarber(
        page === 0 ? 1 : page,
        limit,
        search ?? null
      );
      setTotalItems(response?.totalItems);
      setTotalPages(response?.totalPages);
      const barbers = response.barbers.map((barber: any) => {
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

  const fetchServiceList = async () => {
    try {
      const response: any = await fetchServices();
      const activeServiceData = response.filter(
        (serv: any) => serv.isActive === true
      );
      setServiceData(activeServiceData);
      if (activeServiceData?.length > 0) {
        // Initialize barberServices with default state
        const initialBarberServices = activeServiceData.map((service: any) => ({
          ServiceId: service.id,
          price: null,
          isChecked: false,
        }));
        setBarberServices(initialBarberServices);
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

  useEffect(() => {
    // if (scheduleData) {
    //   setSchedule(
    //     daysOfWeek.map(day => {
    //       const existingDay = scheduleData.find(item => item.day === day);
    //       return existingDay ? { ...existingDay } : { day, isChecked: false, startTime: '', endTime: '' };
    //     })
    //   );
    // }
  }, []);

  const handleWeekCheckboxChange = (index: any) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].isChecked = !updatedSchedule[index].isChecked;
    if (!updatedSchedule[index].isChecked) {
      updatedSchedule[index].startTime = "";
      updatedSchedule[index].endTime = "";
      updatedSchedule[index].isReadonly = false;
    }
    setSchedule(updatedSchedule);
  };

  // const formatTime = (time: string) => {
  //   const [hour, minute] = time.split(":").map(Number); // Assuming 'time' is in 'HH:mm' format
  //   const date = new Date();
  //   date.setHours(hour, minute);

  //   return new Intl.DateTimeFormat("en-US", {
  //     hour: "numeric",
  //     minute: "numeric",
  //     hour12: true,
  //   }).format(date); // Format as 'hh:mm AM/PM'
  // };
  const handleTimeChange = (
    index: number,
    type: "startTime" | "endTime",
    value: string
  ) => {
    const updatedSchedule = [...schedule];
    // Ensure only HH:mm is saved
    updatedSchedule[index][type] = value?.slice(0, 5);
    setSchedule(updatedSchedule);
  };

  const validateStartTime = (startTime: any, endTime: any, index: any) => {
    if (
      startTime &&
      (startTime < selectedSalonOpenTime || startTime > selectedSalonCloseTime)
    ) {
      showErrorToast(
        `Start time must be later than ${selectedSalonOpenTimeAMPM} and later than end time`,
        {
          autoClose: 3000,
        }
      );
      // Optionally reset invalid time back to a valid value
      const updatedSchedule = [...schedule];
      updatedSchedule[index].startTime = "";
      setSchedule(updatedSchedule);
    }
  };

  const validateEndTime = (endTime: any, startTime: any, index: any) => {
    if (endTime && (endTime > selectedSalonCloseTime || endTime < startTime)) {
      showErrorToast(
        `End time must be earlier than ${selectedSalonCloseTimeAMPM} and later than start time`,
        {
          autoClose: 3000,
        }
      );
      // Optionally reset invalid time back to a valid value
      const updatedSchedule = [...schedule];
      updatedSchedule[index].endTime = "";
      setSchedule(updatedSchedule);
    }
  };

  const handleTimeBlur = (index: any, timeType: any) => {
    const dayItem = schedule[index];
    if (timeType === "startTime") {
      validateStartTime(dayItem.startTime, dayItem.endTime, index);
    } else if (timeType === "endTime") {
      validateEndTime(dayItem.endTime, dayItem.startTime, index);
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

  const handleCheckboxChange = (serviceId: number) => {
    setBarberServices((prev) =>
      prev.map((service) =>
        service.ServiceId === serviceId
          ? { ...service, isChecked: !service.isChecked, price: null }
          : service
      )
    );
    setErrors((prev) => {
      const updatedErrors = { ...prev };
      delete updatedErrors[serviceId]; // Clear error when unchecked
      return updatedErrors;
    });
  };

  const handlepriceChange = (serviceId: number, value: string) => {
    const numericValue = parseFloat(value);
    const formattedValue = isNaN(numericValue) ? "" : numericValue.toFixed(2); // Ensure 2 decimal places
    setBarberServices((prev) =>
      prev.map((service) =>
        service.ServiceId === serviceId
          ? { ...service, price: formattedValue === "" ? null : formattedValue }
          : service
      )
    );
    const serviceInfo = serviceData.find((serv: any) => serv.id === serviceId);
    const serviceMinPrice = serviceInfo?.min_price ? serviceInfo?.min_price : 0;
    const serviceMaxPrice = serviceInfo?.max_price ? serviceInfo?.max_price : 0;

    // Validate price when value changes
    setErrors((prev) => {
      const updatedErrors = { ...prev };
      if (numericValue === null || numericValue <= 0) {
        updatedErrors[serviceId] =
          "Price is required and must be greater than 0";
      } else if (
        numericValue < serviceMinPrice ||
        numericValue > serviceMaxPrice
      ) {
        updatedErrors[serviceId] =
          "set price must be in between $" +
          serviceMinPrice +
          " - $" +
          serviceMaxPrice;
      } else {
        delete updatedErrors[serviceId];
      }
      return updatedErrors;
    });
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

  const handleDayChange = (selectedOptions: any) => {
    setSelectedDays(selectedOptions);
    let updatedSchedule = schedule.map((item) => ({
      ...item,
      isChecked: true, // Reset all checkboxes
      startTime: selectedSalonOpenTime,
      endTime: selectedSalonCloseTime,
      isReadonly: false,
    }));

    setSchedule(updatedSchedule); // Ensure to update the state
    updatedSchedule = updatedSchedule.map((item) => {
      // If the day is selected, set the startTime and endTime to null
      if (
        selectedOptions.some((selected: any) => selected.label === item.day)
      ) {
        return {
          ...item,
          isChecked: false,
          startTime: "",
          endTime: "",
          isReadonly: true,
        };
      } else {
        return { ...item, isReadonly: false };
      }
      return item;
    });
    // updatedSchedule[index].isChecked = !updatedSchedule[index].isChecked;
    // if (!updatedSchedule[index].isChecked) {
    //   updatedSchedule[index].startTime = '';
    //   updatedSchedule[index].endTime = '';
    // }
    setSchedule(updatedSchedule);
    // Update the schedule to set startTime and endTime to null for selected days
    // const updatedSchedule = schedule.map(item => {
    //   // If the day is selected, set the startTime and endTime to null
    //   if (selectedOptions.some((selected: any) => selected.value === item.day)) {
    //     return { ...item, isChecked: false, startTime: null, endTime: null };
    //   }
    //   return item;
    // });
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

  const handelColorChange = (e: any) => {
    formik.setFieldValue("background_color", e.target.value);
  };

  const preventSpaceKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };
  const emailValidationRegex =
    /^(?=.{5,50}$)[a-z0-9._%+-]{3,}@[a-z0-9.-]{3,}\.[a-z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const barberSchema = (isEdit = false) =>
    Yup.object().shape({
      firstname: strictNameValidation.required("First name is required"), // Add this line
      lastname: strictNameValidation.required("Last name is required"), // Add this line
      mobile_number: Yup.string()
        .matches(
          /^(?:\(\d{3}\)\s?|\d{3}-?)\d{3}-?\d{4}$/,
          "Mobile number must be 10 digits"
        ) // Validation for digits only
        .required("Mobile number is required"), // Add this line
      email: isEdit
        ? Yup.string()
        : Yup.string()
            .matches(emailValidationRegex, "Enter valid email!!")
            .email("Invalid email format")
            .required("Email is required"),
      password: isEdit
        ? Yup.string()
        : Yup.string()
            .matches(
              passwordRegex,
              "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.!!"
            )
            .required("Password is required"), // Add this line // Add this line
      // address: Yup.string().required("Address is required"), // Add this line
      availability_status: Yup.string().required("Status is required"),
      // created_at: Yup.date().required("Creation date is required"),
      cutting_since: Yup.date().required("Cutting since date is required"),
      organization_join_date: Yup.date().required(
        "Organization join date is required"
      ),
      SalonId: Yup.string().required("Salon is required"),
      category: Yup.string().required("Category is required"),
      position: Yup.string().required("Position is required"),
    });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: newBarber?.id || null,
      firstname: newBarber?.user?.firstname || "",
      lastname: newBarber?.user?.lastname || "",
      email: newBarber?.user?.email || "",
      mobile_number: newBarber?.user?.mobile_number || "",
      address: newBarber?.user?.address || "",
      password: newBarber?.user?.password ?? "",
      availability_status: newBarber?.availability_status || "",
      cutting_since: newBarber?.cutting_since
        ? new Date(newBarber.cutting_since).toISOString().split("T")[0]
        : "",
      organization_join_date: newBarber?.organization_join_date
        ? new Date(newBarber.organization_join_date).toISOString().split("T")[0]
        : "",
      photo: newBarber?.photo ?? Profile,
      SalonId: newBarber?.SalonId ?? "",
      category: newBarber?.category ?? "",
      position: newBarber?.position ?? "",
      background_color: newBarber?.background_color ?? "#000000",
      servicesWithPrices: newBarber?.servicesWithPrices,
    },
    validationSchema: barberSchema(newBarber?.id ? true : false),
    onSubmit: (values) => {
      setShowSpinner(true);
      // e.preventDefault();
      const valid = schedule.every((item) => {
        if (item.isChecked) {
          return (
            item.startTime && item.endTime && item.startTime < item.endTime
          );
        }
        return true;
      });

      // if (!valid) {
      //   alert(
      //     "Please ensure start time is before end time and both are selected."
      //   );
      //   return;
      // }

      values.firstname.trim();
      values.lastname.trim();
      values.email.trim();
      const newErrors: Record<number, string> = {};

      // Validate required fields before saving
      barberServices.forEach((service) => {
        const matchedService = serviceData.find(
          (s: any) => s.id === service.ServiceId
        );
        if (service.isChecked) {
          // Check for empty or invalid price
          if (!service.price || parseFloat(service.price) <= 0) {
            newErrors[service.ServiceId] =
              "Price is required and must be greater than 0";
            setShowSpinner(false);
          }
          // Check if price is below minPrice or above maxPrice
          else if (
            matchedService &&
            (parseFloat(service.price) < matchedService.min_price || // Compare directly with min_price
              parseFloat(service.price) > matchedService.max_price) // Compare directly with max_price
          ) {
            newErrors[
              service.ServiceId
            ] = `Price must be between ${matchedService.min_price} and ${matchedService.max_price}`;
            setShowSpinner(false);
          }
        }
      });

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        // Proceed with the appropriate action
        const assignedServices = barberServices.filter(
          (service) => service.isChecked
        );

        // Create new array with only ServiceId and Price properties
        const transformedServices = assignedServices.map((service) => ({
          ServiceId: service.ServiceId,
          price: service.price || 0, // Default to 0 if customPrice is null
        }));
        values.servicesWithPrices = transformedServices
          ? JSON.stringify(transformedServices)
          : "";
        if (values.id !== null) {
          handleUpdateBarber(values.id, values);
        } else {
          handleAddBarber(values);
        }
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setSelectedImage(file); // Save the file object directly
      } else {
        showErrorToast(
          "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."
        );
        e.target.value = ""; // Clear the file input
      }
    }
  };

  // Add new user function
  const handlePageChange = (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    fetchBarbersList(total, selectedSearchText);
    // Handle page change logic here
  };

  const handleSearchText = (search: any) => {
    selectedSearch(search);
    if (search) {
      fetchBarbersList(1, search);
    } else {
      fetchBarbersList(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        search
      );
    }
    // Handle page change logic here
  };

  const handleAddBarber = async (values: any) => {
    try {
      const formData = new FormData();
      // Transform data to expected JSON format
      const checkedSchedule = schedule.filter((item) => item.isChecked); // Only keep checked items
      const formattedSchedule = checkedSchedule.reduce(
        (acc: any, item: any) => {
          acc[item.day.toLowerCase()] = item.isChecked
            ? { start_time: item.startTime, end_time: item.endTime }
            : { start_time: null, end_time: null };
          return acc;
        },
        {}
      );
      // Prepare the selected days for form submission
      const selectedValues = selectedDays.map((option: any) => option.value);
      const selectedDaysString = selectedValues.join(","); // Convert array to comma-separated string
      // Append form values to FormData
      // formData.append("photo", selectedImage || Profile);
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      // formData.append("address", values.address);
      formData.append("email", values.email);
      formData.append("mobile_number", values.mobile_number);
      formData.append("password", values.password);
      formData.append("availability_status", values.availability_status);
      formData.append("cutting_since", values.cutting_since || "");
      formData.append(
        "organization_join_date",
        values.organization_join_date || ""
      );
      formData.append("background_color", values.background_color);
      formData.append("servicesWithPrices", values.servicesWithPrices);
      formData.append("weekly_schedule", JSON.stringify(formattedSchedule));
      formData.append("category", values.category);
      formData.append("position", values.position);
      formData.append("photo", selectedImage ?? Profile); // If a new image is selected
      formData.append("non_working_days", selectedDaysString ?? null); // If a new image is selected

      // if (selectedImage instanceof File) {
      //   formData.append("photo", selectedImage);
      // }
      formData.append("SalonId", values.SalonId.toString());

      // API call to add barber
      const newAdded = await addBarber(formData);
      if (newAdded) {
        // Fetch and update the salon list
        const message = "Barber added successfully.";
        showSuccessToast(message);
        setShowSpinner(false);
        fetchBarbersList(
          selectedCurrentPage ? selectedCurrentPage + 1 : 1,
          null
        );

        toggleModal();
        setSelectedDays([]);
        setIsEditing(false);
        formik.resetForm();
        const initialBarberServices = serviceData.map((service: any) => ({
          ServiceId: service.id,
          price: null,
          isChecked: false,
        }));
        setBarberServices(initialBarberServices);
      }
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

  const handleUpdateBarber = async (id: number, updatedBarberData: any) => {
    try {
      const formData = new FormData();
      // Prepare the selected days for form submission
      const checkedSchedule = schedule.filter((item) => item.isChecked); // Only keep checked items
      const formattedSchedule = checkedSchedule.reduce(
        (acc: any, item: any) => {
          acc[item.day.toLowerCase()] = item.isChecked
            ? { start_time: item.startTime, end_time: item.endTime }
            : { start_time: null, end_time: null };
          return acc;
        },
        {}
      );
      const selectedValues = selectedDays.map((option: any) => option.value);
      const selectedDaysString = selectedValues.join(","); // Convert array to comma-separated string
      formData.append("photo", selectedImage ?? Profile); // If a new image is selected
      formData.append("id", updatedBarberData.id.toString());
      formData.append("firstname", updatedBarberData.firstname);
      formData.append("lastname", updatedBarberData.lastname);
      // formData.append("address", updatedBarberData.address);
      formData.append("email", updatedBarberData.email);
      formData.append("mobile_number", updatedBarberData.mobile_number);
      formData.append("password", updatedBarberData.password);
      formData.append("category", updatedBarberData.category);
      formData.append("position", updatedBarberData.position);
      formData.append("background_color", updatedBarberData.background_color);
      formData.append(
        "servicesWithPrices",
        updatedBarberData.servicesWithPrices
      );
      formData.append(
        "availability_status",
        updatedBarberData.availability_status
      );
      formData.append(
        "cutting_since",
        formatDate(updatedBarberData.cutting_since)
      );
      formData.append(
        "organization_join_date",
        formatDate(updatedBarberData.organization_join_date)
      );
      formData.append("weekly_schedule", JSON.stringify(formattedSchedule));
      formData.append("SalonId", updatedBarberData.SalonId.toString());
      formData.append("non_working_days", selectedDaysString ?? null); // If a new image is selected

      await updateBarber(id, formData);

      showSuccessToast("Barber updated successfully");

      setShowSpinner(false);
      fetchBarbersList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, null);
      //
      toggleModal();
      setSelectedDays([]);
      setIsEditing(false);
      formik.resetForm();
      const initialBarberServices = serviceData.map((service: any) => ({
        ServiceId: service.id,
        price: null,
        isChecked: false,
      }));
      setBarberServices(initialBarberServices);
      // const barber = updatedBarber.map((usr: any) => {
      //   return {
      //     ...usr,
      //     fullname: ${usr.firstname} ${usr.lastname}, // Add fullname property
      //   };
      // });

      // setFilteredData(barber); // Update your barber state here
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
  };

  // Convert time string "HH:mm" to a Date object for proper comparison
  const parseTime = (time: any) => {
    if (!time) return null;
    const [hour, minute] = time.split(":").map(Number); // Assuming 'time' is in 'HH:mm' format
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Set user data for editing
  const handleEditBarber = (barber: Barber) => {
    const initialBarberServices = serviceData.map((service: any) => ({
      ServiceId: service.id,
      price: null,
      isChecked: false,
    }));
    setBarberServices(initialBarberServices);
    setSchedule(
      daysOfWeek.map((day) => ({
        day,
        isChecked: false,
        startTime: "",
        endTime: "",
        isReadonly: false,
      }))
    );
    setSalonOpenTime(null);
    setSalonCloseTime(null);
    setSalonOpenTimeAMPM(null);
    setSalonCloseTimeAMPM(null);
    setSelectedSalonId(barber.SalonId);
    formik.setFieldValue("SalonId", barber.SalonId);
    let salonInfo;
    let openTime = null;
    let closeTime = null;

    if (
      storeRoleInfo.role_name === ROLES.SALON_MANAGER ||
      storeRoleInfo.role_name === ROLES.SALON_OWNER ||
      storesalonDetailInfo
    ) {
      salonInfo = storesalonDetailInfo ?? storeUserInfo?.salon;
    } else if (salonData.length === 1) {
      salonInfo = salonData[0]?.salon;
    } else {
      salonInfo = salonData.find(
        (salon: any) => salon.salon_id === barber.SalonId
      )?.salon;
    }

    openTime = parseTime(salonInfo?.open_time);
    closeTime = parseTime(salonInfo?.close_time);

    setSalonOpenTime(openTime);
    setSalonCloseTime(closeTime);
    setSalonOpenTimeAMPM(formatTime(salonInfo?.open_time));
    setSalonCloseTimeAMPM(formatTime(salonInfo?.close_time));

    if (barber.weekly_schedule) {
      // Convert object to an array format
      const scheduleArray = Object.keys(barber.weekly_schedule).map(
        (day: any) => ({
          day,
          isChecked: true, // Assuming all days are checked, modify as needed
          startTime: barber.weekly_schedule[day].start_time,
          endTime: barber.weekly_schedule[day].end_time,
        })
      );
      // Use reduce to format as required

      let updatedSchedule = [...schedule];
      updatedSchedule = schedule.map((item) => {
        // If the day is selected, set the startTime and endTime to null
        if (
          scheduleArray.some(
            (selected: any) =>
              selected.day.toLowerCase() === item.day.toLowerCase()
          )
        ) {
          const info = scheduleArray.find(
            (selected: any) =>
              selected.day.toLowerCase() === item.day.toLowerCase()
          );

          // Filter days to get non-working days
          const nonWorkingDaysData = days.filter((day) =>
            barber.non_working_days.includes(day.value)
          );
          if (info) {
            if (
              nonWorkingDaysData.some(
                (selected: any) =>
                  selected.label.toLowerCase() !== info.day.toLowerCase()
              )
            ) {
              return {
                ...item,
                isChecked: true,
                startTime: info ? info.startTime : "",
                endTime: info ? info.endTime : "",
                isReadonly: false,
              };
            } else {
              return {
                ...item,
                isChecked: false,
                startTime: "",
                endTime: "",
                isReadonly: true,
              };
            }
          }
        } else {
          return { ...item, isReadonly: false };
        }
        return item;
      });

      setSchedule(updatedSchedule);
    }
    // const openTime: any = salonInfo ? parseTime(salonInfo.salon.open_time) : null;
    // const closeTime: any = salonInfo ? parseTime(salonInfo.salon.close_time) : null;
    // setSalonOpenTime(openTime);
    // setSalonCloseTime(closeTime);
    // setSalonOpenTimeAMPM(salonInfo ? formatTime(salonInfo.salon.open_time) : null);
    // setSalonCloseTimeAMPM(salonInfo ? formatTime(salonInfo.salon.close_time) : null);

    // updatedSchedule = schedule.map(item => {
    //   if ()
    //     return { ...item, isChecked: true, startTime: openTime, endTime: closeTime, isReadonly: false };
    // });
    setSelectedOption(barber.category);
    setSelectedPositionOption(barber.position);
    if (barber.servicesWithPrices?.length > 0) {
      barber.servicesWithPrices.map((serviceInfo: any) => {
        setBarberServices((prev) =>
          prev.map((service) =>
            service.ServiceId === serviceInfo.id
              ? { ...service, isChecked: true, price: serviceInfo.barber_price }
              : service
          )
        );
      });
    }
    if (barber.non_working_days && barber.non_working_days.length > 0) {
      const selectedDaysList = barber.non_working_days
        .map((day: any) => {
          const dayObj = days.find((d) => d.value === day);
          return dayObj ? { value: dayObj.value, label: dayObj.label } : null;
        })
        .filter(Boolean) as OptionType[]; // Filter out any null values
      setSelectedDays(selectedDaysList);
    }
    setSelectedImage(barber.photo ?? Profile); // Use user's profile image or default
    setNewBarber(barber); // Set the user to be updated
    setIsEditing(true); // Toggle edit mode
    toggleModal(); // Open the modal for editing
  };

  // Delete user function
  const handleDeleteBarber = async () => {
    setShowSpinner(true);
    if (selectedBarber !== null) {
      try {
        const deleteBabrer = await deleteBarber(selectedBarber.id);

        // Remove the deleted user from the local state
        // setBarberData((prevData) =>
        //   prevData.filter((barber) => barber.id !== selectedBarberId)
        // );

        showSuccessToast("Barber deleted successfully");
        setShowSpinner(false);
        fetchBarbersList(
          selectedCurrentPage ? selectedCurrentPage + 1 : 1,
          null
        );
        setDeleteModal(false); // Close the delete confirmation modal
        setSelectedBarber(null); // Reset selected user ID
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
    }
  };

  // const formatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid
  //   const date = new Date(dateString);
  //   // Get the user's current timezone
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
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
        header: "Photo",
        accessorKey: "photo",
        cell: (cell: { getValue: () => string }) => (
          <img
            src={cell.getValue() ? cell.getValue() : Profile}
            // src={Profile}
            alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        ),
        enableColumnFilter: false,
      },
      {
        header: "Full Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Salon",
        accessorKey: "salon.name", // Add SalonId column for "Salon Name"
        enableColumnFilter: false,
      },
      {
        header: "Status",
        accessorKey: "availability_status",
        enableColumnFilter: false,
        cell: (cell: { getValue: () => number; row: { original: Barber } }) =>
          cell.row.original.availability_status === "available" ? (
            <span
              className="btn btn-info cursor-auto"
              style={{
                padding: "0px 5px",
              }}
            >
              Available
            </span>
          ) : (
            <span
              className="btn btn-danger cursor-auto"
              style={{
                padding: "0px 5px",
              }}
            >
              Unavailable
            </span>
          ),
      },
      // {
      //   header: "Last Name",
      //   accessorKey: "lastname",
      //   enableColumnFilter: false,
      // },
      {
        header: "Category",
        accessorKey: "category",
        enableColumnFilter: false,
        cell: (cell: { getValue: () => number }) => (
          <span> {cell.getValue() === 2 ? "Walk-In" : "Appointment"} </span>
        ),
      },
      {
        header: "Position",
        accessorKey: "position",
        enableColumnFilter: false,
      },

      {
        header: "Actions",
        accessorKey: "id",
        enableColumnFilter: false,

        cell: (cell: { getValue: () => number; row: { original: Barber } }) => (
          <div>
            <i
              className="ri-edit-2-fill"
              style={{
                cursor: "pointer",
                marginRight: "20px",
                color: "grey",
                fontSize: "20px",
              }}
              onClick={() => handleEditBarber(cell.row.original)} // Pass the entire user object
            ></i>
            <i
              className=" ri-delete-bin-fill"
              style={{ cursor: "pointer", color: "grey", fontSize: "20px" }}
              onClick={() => onClickDelete(cell.row.original)} // Pass the user ID
            ></i>
          </div>
        ),
      },
    ],
    [barberData]
  );

  const handleAddButtonClick = () => {
    setNewBarber(null);
    setSchedule(
      daysOfWeek.map((day) => ({
        day,
        isChecked: false,
        startTime: "",
        endTime: "",
        isReadonly: false,
      }))
    );
    const initialBarberServices = serviceData.map((service: any) => ({
      ServiceId: service.id,
      price: null,
      isChecked: false,
    }));
    setBarberServices(initialBarberServices);
    setSalonOpenTime(null);
    setSalonCloseTime(null);
    setSalonOpenTimeAMPM(null);
    setSalonCloseTimeAMPM(null);
    setSalonInformation();
    setModal(true);
  };

  const setSalonInformation = () => {
    let salonId;
    let salonInfo;

    if (
      storeRoleInfo.role_name === ROLES.SALON_MANAGER ||
      storeRoleInfo.role_name === ROLES.SALON_OWNER ||
      storesalonDetailInfo
    ) {
      // ✅ Case 1: Salon Manager / Owner or salonDetails present in localStorage
      salonId = storesalonDetailInfo
        ? storesalonDetailInfo.id
        : storeUserInfo?.salon?.id;
      salonInfo = storesalonDetailInfo ?? storeUserInfo?.salon;
    } else if (salonData.length === 1) {
      // ✅ Case 2: Only one salon available (Admin or SuperAdmin)
      salonId = salonData[0].salon_id;
      salonInfo = salonData[0]?.salon;
    } else {
      return; // If multiple salons and none selected, skip
    }

    // Set salon ID
    setSelectedSalonId(salonId);
    formik.setFieldValue("SalonId", salonId);

    // Parse salon open and close time
    const openTime = parseTime(salonInfo?.open_time);
    const closeTime = parseTime(salonInfo?.close_time);

    selectedSalonOpenTimeRef.current = openTime;
    selectedSalonCloseTimeRef.current = closeTime;

    selectedSalonOpenTimeAMPMRef.current = formatTime(salonInfo?.open_time);
    selectedSalonCloseTimeAMPMRef.current = formatTime(salonInfo?.close_time);

    setSalonOpenTime(openTime);
    setSalonCloseTime(closeTime);
    setSalonOpenTimeAMPM(selectedSalonOpenTimeAMPMRef.current);
    setSalonCloseTimeAMPM(selectedSalonCloseTimeAMPMRef.current);

    // ✅ Apply timing to full week
    const updatedSchedule = daysOfWeek.map((day) => ({
      day,
      isChecked: true,
      startTime: openTime || "",
      endTime: closeTime || "",
      isReadonly: false,
    }));
    setSchedule(updatedSchedule);
  };
  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal); // Toggle the delete modal visibility
  };

  const onClickDelete = (user: Barber) => {
    setSelectedBarber(user); // Set the selected role ID for deletion
    setDeleteModal(true); // Open the delete modal
  };

  const handleSalonChange = (event: any) => {
    if (event.target.value) {
      const salonId = Number(event.target.value);
      formik.setFieldValue("SalonId", salonId);
      const salonInfo = salonData.find(
        (salon: any) => salon.salon_id === salonId
      );
      const openTime: any = salonInfo
        ? parseTime(salonInfo.salon.open_time)
        : null;
      const closeTime: any = salonInfo
        ? parseTime(salonInfo.salon.close_time)
        : null;
      setSalonOpenTime(openTime);
      setSalonCloseTime(closeTime);
      setSalonOpenTimeAMPM(
        salonInfo ? formatTime(salonInfo.salon.open_time) : null
      );
      setSalonCloseTimeAMPM(
        salonInfo ? formatTime(salonInfo.salon.close_time) : null
      );
      let updatedSchedule = [...schedule];
      updatedSchedule = schedule.map((item) => {
        return {
          ...item,
          isChecked: true,
          startTime: openTime,
          endTime: closeTime,
          isReadonly: false,
        };
      });
      setSchedule(updatedSchedule);
      // setSelectedSalonId(salonId);
      // // let selectedSalonData: Salon | null;
      // const selectedSalonData = salonData.find((salon) => salon.salon_id === salonId);
      // setSelectedSalon(selectedSalonData || null);
    }
    // Perform any additional logic here based on the selected option
  };

  const handleCategoryChange = (event: any) => {
    formik.setFieldValue("category", event.target.value);
    setSelectedOption(event.target.value);
  };

  const handlePositionChange = (event: any) => {
    formik.setFieldValue("position", event.target.value);
    setSelectedPositionOption(event.target.value);
  };
  //   const handleRoleChange = (event: any) => {
  //     if (event.target.value) {
  //       const roleId = Number(event.target.value);
  //       formik.setFieldValue('RoleId', roleId);
  //       // setSelectedRoleId(roleId);
  //       // // let selectedSalonData: Salon | null;
  //       // const selectedRoleData = roleData.find((role) => role.id === roleId);
  //       // setSelectedRole(selectedRoleData || null);
  //     }
  //     // Perform any additional logic here based on the selected option
  //   };

  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={4}>
          <div className="d-flex justify-content-between mb-4">
            <h5>Barber Management</h5>
          </div>
        </Col>
        <Col className="col-sm-auto ms-auto align-botto">
          <div className="list-grid-nav hstack gap-3">
            <Button color="success" onClick={handleAddButtonClick}>
              <i className="ri-add-fill me-1 align-bottom"></i> Add Barber
            </Button>
          </div>
        </Col>
      </Row>
      {showLoader ? (
        <Loader />
      ) : (
        <TableContainer
          columns={columns}
          data={barberData}
          isGlobalFilter={true}
          customPageSize={limit}
          totalPages={selectedTotalPages ?? 0}
          searchText={handleSearchText}
          totalItems={selectedTotalItems ?? 0}
          currentPageIndex={selectedCurrentPage ?? 0}
          divClass="table-responsive table-card"
          SearchPlaceholder="Search..."
          onChangeIndex={handlePageChange}
        />
      )}

      {/* Modal for adding/updating users */}
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        centered
        backdrop="static" // Prevents closing on outside click
        size="xl" // Prevents closing on outside click
      >
        <ModalHeader
          className="modal-title"
          id="myModalLabel"
          toggle={closeModal}
        >
          {isEditing ? "Update Barber" : "Add Barber"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={formik.handleSubmit}>
            <Row>
              <Col lg={12}>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div className="position-absolute bottom-0 end-0">
                      <Label htmlFor="profile-image-input" className="mb-0">
                        <div className="avatar-xs">
                          <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                            <i className="ri-image-fill"></i>
                          </div>
                        </div>
                      </Label>
                      <Input
                        type="file"
                        className="form-control d-none"
                        id="profile-image-input"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="avatar-lg">
                      <div
                        className="avatar-title bg-light rounded-circle"
                        style={{
                          width: "100px",
                          height: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={
                            selectedImage instanceof File
                              ? URL.createObjectURL(selectedImage)
                              : newBarber?.photo
                              ? newBarber?.photo
                              : Profile
                          }
                          alt="Profile"
                          className="img-fluid"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* First Name */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="firstname" className="form-label">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    placeholder="Enter First Name"
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={(e) => {
                      preventSpaceKey(e); // Prevent spaces
                      if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault(); // Block non-alphabetic characters
                      }
                    }}
                    className={
                      formik.touched.firstname && formik.errors.firstname
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.firstname && formik.errors.firstname && (
                    <div className="invalid-feedback">
                      {typeof formik.errors.firstname === "string"
                        ? formik.errors.firstname
                        : ""}
                    </div>
                  )}
                </div>
              </Col>

              {/* Last Name */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="lastname" className="form-label">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="lastname"
                    placeholder="Enter Last Name"
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={(e) => {
                      preventSpaceKey(e); // Prevent spaces
                      if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault(); // Block non-alphabetic characters
                      }
                    }}
                    className={
                      formik.touched.lastname && formik.errors.lastname
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.lastname && formik.errors.lastname && (
                    <div className="invalid-feedback">
                      {typeof formik.errors.lastname === "string"
                        ? formik.errors.lastname
                        : ""}
                    </div>
                  )}
                </div>
              </Col>

              {/* Salon ID */}
              {storeRoleInfo.role_name !== ROLES.SALON_MANAGER &&
                storeRoleInfo.role_name !== ROLES.SALON_OWNER &&
                !storesalonDetailInfo && (
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label htmlFor="salon" className="form-label">
                        Salon Name
                      </Label>
                      <select
                        className="form-select"
                        value={formik.values.SalonId}
                        onChange={handleSalonChange}
                      >
                        <option value="">Select a salon</option>
                        {salonData.map((salon) => (
                          <option key={salon.salon_id} value={salon.salon_id}>
                            {salon.salon_name}
                          </option>
                        ))}
                      </select>
                      {formik.touched.SalonId && formik.errors.SalonId && (
                        <div className="invalid-feedback">
                          {typeof formik.errors.SalonId === "string"
                            ? formik.errors.SalonId
                            : ""}
                        </div>
                      )}
                    </div>
                  </Col>
                )}

              {/* Email */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="email" className="form-label">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={preventSpaceKey}
                    autoComplete="off"
                    disabled={isEditing}
                    className={
                      formik.touched.email && formik.errors.email
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="invalid-feedback">
                      {typeof formik.errors.email === "string"
                        ? formik.errors.email
                        : ""}
                    </div>
                  )}
                </div>
              </Col>
              {/* Password */}

              {!newBarber?.id && (
                <Col lg={4}>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="password-input">
                      Password
                    </Label>
                    <div className="position-relative auth-pass-inputgroup mb-3">
                      <Input
                        type={passwordShow ? "text" : "password"}
                        className={`form-control pe-5${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        id="password"
                        placeholder="Enter your password"
                        value={formik.values.password}
                        autoComplete="new-password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        onKeyDown={preventSpaceKey}
                      />
                      <button
                        className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                        type="button"
                        onClick={() => setPasswordShow(!passwordShow)}
                      >
                        <i className="ri-eye-fill align-middle"></i>
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-danger">
                        {typeof formik.errors.password === "string"
                          ? formik.errors.password
                          : ""}
                      </div>
                    )}
                  </div>
                </Col>
              )}

              {/* Mobile Number */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="mobile_number" className="form-label">
                    Mobile Number
                  </Label>
                  <Input
                    type="tel"
                    id="mobile_number"
                    placeholder="Enter Mobile Number"
                    value={formik.values.mobile_number}
                    onChange={handlePhoneChange}
                    onKeyDown={handleKeyDown}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.mobile_number &&
                      formik.errors.mobile_number
                        ? "is-invalid"
                        : ""
                    }
                  />

                  <div className="invalid-feedback">
                    {typeof formik.errors.mobile_number === "string"
                      ? formik.errors.mobile_number
                      : ""}
                  </div>
                </div>
              </Col>

              <Col lg={4}>
                {/* Availability Status Field */}
                <div className="mb-3">
                  <Label htmlFor="availability_status" className="form-label">
                    Availability Status
                  </Label>
                  <Input
                    type="select"
                    id="availability_status"
                    value={formik.values.availability_status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.availability_status &&
                      formik.errors.availability_status
                        ? "is-invalid"
                        : ""
                    }
                  >
                    <option value="">Select Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </Input>
                  {formik.touched.availability_status &&
                    formik.errors.availability_status && (
                      <div className="invalid-feedback">
                        {typeof formik.errors.availability_status === "string"
                          ? formik.errors.availability_status
                          : ""}
                      </div>
                    )}
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="category" className="form-label">
                    Category
                  </Label>
                  <Input
                    type="select"
                    id="category"
                    value={formik.values.category}
                    onChange={handleCategoryChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.category && formik.errors.category
                        ? "is-invalid"
                        : ""
                    }
                  >
                    <option value="">Select Category</option>
                    <option value="1">Appointment</option>
                    <option value="2">Walk-In</option>
                  </Input>
                  {formik.touched.category && formik.errors.category && (
                    <div className="invalid-feedback">
                      {typeof formik.errors.category === "string"
                        ? formik.errors.category
                        : ""}
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="position" className="form-label">
                    Position
                  </Label>
                  <Input
                    type="select"
                    id="position"
                    value={formik.values.position}
                    onChange={handlePositionChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.position && formik.errors.position
                        ? "is-invalid"
                        : ""
                    }
                  >
                    <option value="">Select Position</option>
                    <option value="Executive">Executive</option>
                    <option value="Master">Master</option>
                    <option value="Senior">Senior</option>
                    <option value="Braider">Braider</option>
                    <option value="Junior">Junior</option>
                    <option value="Trainee">Trainee</option>
                    <option value="Student">Student</option>
                  </Input>
                  {formik.touched.position && formik.errors.position && (
                    <div className="invalid-feedback">
                      {typeof formik.errors.position === "string"
                        ? formik.errors.position
                        : ""}
                    </div>
                  )}
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="background_color" className="form-label">
                    Backgound Color
                  </Label>
                  <Input
                    type="color"
                    id="background_color"
                    name="background_color"
                    value={formik.values.background_color}
                    onChange={handelColorChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.background_color &&
                      formik.errors.background_color
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.background_color &&
                    formik.errors.background_color && (
                      <div className="invalid-feedback">
                        {typeof formik.errors.background_color === "string"
                          ? formik.errors.background_color
                          : ""}
                      </div>
                    )}
                </div>
              </Col>

              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="cutting_since" className="form-label">
                    Cutting Since
                  </Label>
                  <Input
                    type="date"
                    id="cutting_since"
                    name="cutting_since"
                    value={formik.values.cutting_since}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    max={today} // Disable future dates
                    className={
                      formik.touched.cutting_since &&
                      formik.errors.cutting_since
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.cutting_since &&
                    formik.errors.cutting_since && (
                      <div className="invalid-feedback">
                        {typeof formik.errors.cutting_since === "string"
                          ? formik.errors.cutting_since
                          : ""}
                      </div>
                    )}
                </div>
              </Col>

              <Col lg={4}>
                <div className="mb-3">
                  <Label
                    htmlFor="organization_join_date"
                    className="form-label"
                  >
                    Organization Join Date
                  </Label>
                  <Input
                    type="date"
                    id="organization_join_date"
                    name="organization_join_date"
                    value={formik.values.organization_join_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    max={today} // Disable future dates
                    className={
                      formik.touched.organization_join_date &&
                      formik.errors.organization_join_date
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.organization_join_date &&
                    formik.errors.organization_join_date && (
                      <div className="invalid-feedback">
                        {typeof formik.errors.organization_join_date ===
                        "string"
                          ? formik.errors.organization_join_date
                          : ""}
                      </div>
                    )}
                </div>
              </Col>

              <Col lg={4}>
                <div className="mb-3">
                  <Label
                    htmlFor="organization_join_date"
                    className="form-label"
                  >
                    Select Non-Working Days
                  </Label>
                  <Select
                    isMulti
                    name="non_working_days"
                    options={days}
                    value={selectedDays}
                    styles={customStyles} // Apply custom styles
                    onChange={handleDayChange}
                    getOptionLabel={(e: any) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedDays.some(
                            (day: any) => day.value === e.value
                          )}
                          readOnly
                        />
                        &nbsp; {e.label}
                      </div>
                    )}
                    closeMenuOnSelect={false}
                  />
                </div>
              </Col>

              {/* Role ID */}
              {/* <Col lg={6}>
                <div className="mb-3">
                  <Label htmlFor="role" className="form-label">
                    Role
                  </Label>
                  <select className="form-select"
                    value={formik.values.RoleId}
                    onChange={handleRoleChange}>
                    <option value="">Select a role</option>
                    {roleData.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.RoleId && formik.errors.RoleId && (
                    <div className="invalid-feedback">
                      {formik.errors.RoleId}
                    </div>
                  )}
                </div>
              </Col> */}
            </Row>
            <Row className="mt-4 align-items-center">
              <Col xs={6}>
                <h5 className="text-center">
                  Weekly Schedule{" "}
                  <span className="text-success">
                    {" "}
                    (Salon time:{" "}
                    {selectedSalonOpenTimeAMPMRef.current
                      ? selectedSalonOpenTimeAMPMRef.current
                      : selectedSalonOpenTimeAMPM}{" "}
                    -{" "}
                    {selectedSalonCloseTimeAMPMRef.current
                      ? selectedSalonCloseTimeAMPMRef.current
                      : selectedSalonCloseTimeAMPM}
                    )
                  </span>
                </h5>
              </Col>
              <Col xs={6}>
                <p
                  className="badge bg-warning text-wrap text-start"
                  style={{ lineHeight: "1.5", fontSize: "14px" }}
                >
                  <span style={{ fontSize: "16px", fontWeight: 800 }}>
                    Note:{" "}
                  </span>
                  If you change the non-working day from the below weekday list,
                  then you can select a day from the Non-Working Days dropdown.
                  Also, the changed weekly schedule will apply from next week.
                </p>
              </Col>
              {schedule.map((dayItem, index) => (
                <Col
                  lg={3}
                  md={4}
                  sm={6}
                  xs={12}
                  key={dayItem.day}
                  className="mb-4"
                >
                  <div className="d-flex flex-column align-items-start p-3 border rounded shadow-sm">
                    <div className="d-flex justify-content-between w-100">
                      <div className="d-flex align-items-center">
                        {/* <Input
                            type="checkbox"
                            checked={dayItem.isChecked}
                            disabled={dayItem.isReadonly}
                            onChange={() => handleWeekCheckboxChange(index)}
                          /> */}
                        <Label className="mb-0">{dayItem.day}</Label>
                      </div>
                    </div>
                    {dayItem.isChecked ? (
                      <div className="row g-2 mt-3 w-100">
                        <div className="col-12 col-xl-6">
                          <Input
                            type="time"
                            value={dayItem.startTime}
                            onChange={(e) =>
                              handleTimeChange(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                            onBlur={() => handleTimeBlur(index, "startTime")}
                            disabled={dayItem.isReadonly}
                            required
                            className="form-control form-control-sm"
                          />
                        </div>
                        <div className="col-12 col-xl-6">
                          <Input
                            type="time"
                            value={dayItem.endTime}
                            onChange={(e) =>
                              handleTimeChange(index, "endTime", e.target.value)
                            }
                            onBlur={() => handleTimeBlur(index, "endTime")}
                            disabled={dayItem.isReadonly}
                            required
                            className="form-control form-control-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      // <div className="d-flex flex-column gap-2 mt-3 w-100">
                      //   <div className="d-flex gap-2 flex-md-wrap flex-sm-wrap flex-lg-nowrap flex-xl-nowrap flex-xxl-nowrap w-100">
                      //     <Input
                      //       type="time"
                      //       value={dayItem.startTime}
                      //       onChange={e => handleTimeChange(index, 'startTime', e.target.value)}
                      //       onBlur={() => handleTimeBlur(index, 'startTime')}
                      //       disabled={dayItem.isReadonly}
                      //       required
                      //       className="form-control form-control-sm flex-grow-1"
                      //     />
                      //     <Input
                      //       type="time"
                      //       value={dayItem.endTime}
                      //       onChange={e => handleTimeChange(index, 'endTime', e.target.value)}
                      //       onBlur={() => handleTimeBlur(index, 'endTime')}
                      //       disabled={dayItem.isReadonly}
                      //       required
                      //       className="form-control form-control-sm flex-grow-1"
                      //     />
                      //   </div>
                      // </div>

                      <p className="text-muted text-center mb-0 mt-2">
                        Unavailable
                      </p>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
            <div className="mt-4">
              <h5>Assign Services</h5>
              {serviceData.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Assign</th>
                      <th>Service</th>
                      <th>Description</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceData.map((service: any) => {
                      const barberService = barberServices.find(
                        (bs) => bs.ServiceId === service.id
                      );

                      return (
                        <tr key={service.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={barberService?.isChecked || false}
                              onChange={() => handleCheckboxChange(service.id)}
                            />
                          </td>
                          <td>{service.name}</td>
                          <td>{service.description}</td>
                          <td>
                            <div className="flex flex-col items-end">
                              <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                  type="number"
                                  step="0.01" // Allows decimals
                                  className="form-control"
                                  value={barberService?.price || ""}
                                  onChange={(e) => {
                                    // Update the value as the user types but without validation
                                    const value = e.target.value;
                                    setBarberServices((prev) =>
                                      prev.map((barberService) =>
                                        barberService.ServiceId === service.id // Use serviceId instead of id
                                          ? {
                                              ...barberService,
                                              price: value
                                                ? parseFloat(value)
                                                : null,
                                            }
                                          : barberService
                                      )
                                    );
                                  }}
                                  onBlur={(e) =>
                                    handlepriceChange(
                                      service.id,
                                      e.target.value
                                    )
                                  } // Validation and formatting on blur
                                  disabled={!barberService?.isChecked}
                                  placeholder="Enter custom price"
                                />
                              </div>
                              {errors[service.id] && (
                                <span className="text-xs text-red-500 mt-1 text-danger">
                                  {errors[service.id]}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "grey",
                    marginTop: "20px",
                  }}
                >
                  No Data Found
                </p>
              )}
            </div>
            {/* Add/Update Buttons */}
            <div className="text-end">
              <Button color="light" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="success"
                className="ms-2"
                disabled={showSpinner || !formik.values.SalonId} // Disable button when loader is active
              >
                {showSpinner && (
                  <Spinner size="sm" className="me-2">
                    Loading...
                  </Spinner>
                )}
                Save
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
      <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={handleDeleteBarber}
        onCloseClick={toggleDeleteModal}
        title={
          selectedBarber !== null ? selectedBarber.name.toString() : undefined
        }
        subTitle="the barber"
        // Convert to string or undefined
      />
    </React.Fragment>
  );
};

export default BarberTable;
