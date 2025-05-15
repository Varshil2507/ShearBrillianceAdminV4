import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  DropdownToggle,
  Dropdown,
  Spinner,
} from "reactstrap";
//Import images
import logoDark from "../../../../assets/images/smallest.png";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import ca from "../../../../assets/images/flags/ca.svg";
import { fetchSalons } from "Services/SalonService";
import default_image from "../../../../assets/images/default_salon_img.png";
import { fetchServices } from "Services/Service";
import { fetchBarberBySalon } from "Services/barberService";
import { fetchTimeSlots } from "Services/AvailableTimeslot";
import { createAppointment } from "Services/AppointmentService";
import Loader from "Components/Common/Loader";
import { addDays, isAfter, isBefore, isSameDay, parse } from "date-fns";
import SelectBarberModal from "../../../../Components/Common/SelectedServiceModal"; // Import the modal
import config from "config";
import "./Scheduleappointment.css";
import { formatTime } from "Components/Common/DateUtil";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from "slices/layouts/toastService";
import { LAYOUT_MODE_TYPES } from "../../../../Components/constants/layout";
import { ROLES } from "common/data/Constants";
import { debug } from "console";

interface Service {
  id: number;
  name: string;
  price: number;
  default_service_time: number;
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

interface Service {
  id: number;
  name: string;
  price: number;
}

interface Barber {
  id: number; // or string, depending on your data structure
  name: string;
  services: { id: number; name: string; price: number }[]; // Example service structure
}

const Scheduleappointment = () => {
  // Stepper
  const [activeArrowTab, setactiveArrowTab] = useState(1);
  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);
  const [initialLoading, setInitialLoading] = useState(true);

  // select salon const
  const [salons, setSalons] = useState<any[]>([]);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "">(
    ""
  );
  const [selectedSalon, setSelectedSalon] = useState<number | null>(null);

  const { commonText } = config;
  // select services const
  // const [selectedService, setSelectedService] = useState(null);
  const [serviceCounters, setServiceCounters] = useState<any>({});
  const [services, setServices] = useState<Service[]>([]);
  const [isNextButtonActive, setIsNextButtonActive] = useState(false);
  const [selectedService, setSelectedService] = useState<string[]>([]);

  // Select barber const
  const [selectBarber, setSelectedBarber] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedBarber, setSelectBarber] = useState<any | null>(null);

  // Select date & time slot const
  const [timeSlotData, setTimeSlotData] = useState<any[]>([]);
  const [timeSlotVisible, setTimeSlotVisible] = useState(false);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [tipPercentage, setTipPercentage] = useState<any>(0);
  const [customTip, setCustomTip] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [disabledLeaveDates, setDisabledLeaveDates] = useState<string[]>([]);

  // Confirmation const
  const [dropdownOpen5, setDropdownOpen5] = useState<boolean>(false);

  // Appointment Details page
  const [appointmentData, setAppointmentData] = useState<any | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<CategoryKey | null>(
    null
  );

  function toggleArrowTab(tab: any) {
    if (activeArrowTab !== tab) {
      var modifiedSteps = [...passedarrowSteps, tab];
      if (tab === 6) {
        let total;
        if (selectedBarber) {
          const totalPrice = appointmentData.selectedServices.reduce(
            (acc: any, service: any) => {
              const barberService = selectedBarber.servicesWithPrices.find(
                (serv: any) => serv.id === parseInt(service.serviceId)
              );

              const price = barberService
                ? parseFloat(barberService?.barber_price) ??
                  parseFloat(barberService?.min_price) ??
                  0
                : parseFloat(service.servicePrice);

              return acc + price;
            },
            0
          );
          total = totalPrice;
          // price = barberService.barber_price ? barberService.barber_price : barberService.min_price ? barberService.min_price : 0;
        }
        // const total = selectedOptions;
        setTotalPrice(total);
        calculateFinalAmount(total, tipPercentage, customTip);
      }
      if (tab >= 1 && tab <= 7) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }

  //   function toggleVerticalTab(tab : any) {
  //     if (activeVerticalTab !== tab) {
  //       var modifiedSteps = [...passedverticalSteps, tab];

  //       if (tab >= 7 && tab <= 11) {
  //         setactiveVerticalTab(tab);
  //         setPassedverticalSteps(modifiedSteps);
  //       }
  //     }
  //   }

  // Confirmation Page
  const [formData, setFormData] = useState<{
    selectedSalon: string | null;
    selectedServices: string[];
    grandtotalServiceTime: number;
    selectedBarber: string | null;
    selectedDate: string | null;
    selectedPeriod: CategoryKey | null;
    selectedSlot: string[]; // Explicitly typed as an array of strings
    selectedSlotId: number | null;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    // agreeTerms: boolean;
  }>({
    selectedSalon: null,
    selectedServices: [],
    grandtotalServiceTime: 0,
    selectedBarber: null,
    selectedDate: null,
    selectedPeriod: null,
    selectedSlot: [], // Initialize as empty string array
    selectedSlotId: null,
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    // agreeTerms: false,
  });

  const toggle5 = () => setDropdownOpen5((prevState) => !prevState);
  const [seletedCountry4, setseletedCountry4] = useState<any>({
    id: 1,
    flagImg: ca || null,
    countryName: "Canada",
    countryCode: "",
  });

  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");

  const isFormValid = () => {
    const { firstName, lastName, email, mobileNumber } = formData;
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.trim() !== "" &&
      validateEmail(email) && // Validate email format
      validateMobileNumber(mobileNumber) &&
      // agreeTerms &&
      selectedDate !== null &&
      selectedPeriod !== null &&
      selectedSlot !== null
    );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex
    return emailRegex.test(email);
  };

  const validateMobileNumber = (number: string) => {
    const regex = /^\(\d{3}\)-\d{3}-\d{4}$/; // Matches (XXX)-XXX-XXXX
    return regex.test(number);
  };

  const formatMobileNumber = (value: string) => {
    // Remove all non-numeric characters
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Update the form data
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    // Handle field-specific validations
    if (id === "mobileNumber") {
      const formattedValue = formatMobileNumber(value);

      setFormData((prevData) => ({
        ...prevData,
        [id]: formattedValue,
      }));

      if (!validateMobileNumber(formattedValue)) {
        setMobileError("Mobile number must follow the format (XXX)-XXX-XXXX.");
      } else {
        setMobileError("");
      }
    } else if (id === "email") {
      if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
  };

  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  // ---------------------------------

  // Fetch Appointment Detals
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      // Use the current state of formData dynamically
      setAppointmentData({ ...formData });
    };

    fetchAppointmentDetails();
  }, [formData]);
  // --------------------------------------

  // Confirm of Appointment Booked
  const mapAppointmentData = (appointmentData: any) => {
    const formattMobileNumber = (number: string): string => {
      // Remove all non-numeric characters
      const numericOnly = number.replace(/[^0-9]/g, "");
      // Add prefix '+1' to the cleaned number
      return `+1${numericOnly}`;
    };
    return {
      firstname: appointmentData.firstName,
      lastname: appointmentData.lastName,
      email: appointmentData.email,
      mobile_number: formattMobileNumber(appointmentData.mobileNumber),
      number_of_people: appointmentData.selectedServices.reduce(
        (acc: any, service: any) => acc + service.currentCount,
        0
      ), // Assuming 'currentCount' represents the number of people per service
      salon_id: appointmentData.selectedSalon, // Salon Id ID (Assuming `selectedSalon` is the salon's ID)
      barber_id: appointmentData.selectedBarber, // Barber ID (Assuming `selectedBarber` is the barber's ID)
      service_ids: appointmentData.selectedServices.flatMap(
        (service: { serviceId: any; currentCount: number }) =>
          Array(service.currentCount).fill(service.serviceId)
      ), // Repeat `serviceId` based on `currentCount`
      slot_id: appointmentData.selectedSlotId,
      payment_mode: "Pay_In_Person",
      tip: tipAmount,
    };
  };
  const handleSubmit = async () => {
    try {
      setShowSpinner(true);
      const mappedData = mapAppointmentData(appointmentData); // Map the data to match Swagger format
      const response = await createAppointment(mappedData); // Pass the mapped data to the API
      setShowSpinner(false);
      showSuccessToast("Appointment created successfully!");
      // Move to the next step
      toggleArrowTab(activeArrowTab + 1); // Increment the active tab to navigate to the next step
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
  const resetData = async () => {
    window.location.reload();
  };
  // --------------------------------------

  // Select Salon
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const response = await fetchSalons(1, 10, "");
        setSalons(response.salons);

        const isManagerOrOwner =
          storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
          storeRoleInfo?.role_name === ROLES.SALON_OWNER;
        const isSingleSalon = response.salons?.length === 1;

        if (isManagerOrOwner || isSingleSalon) {
          const selected = response.salons[0]?.salon;
          setSelectedSalon(selected.id);
          handleSalonSelect({
            salonId: selected.id,
            salonName: selected.name,
          });
          setIsNextButtonActive(true);
          setPassedarrowSteps((prev) => [...prev, 2]);
          setactiveArrowTab(2); // skip to "Select Services"
        }

        setShowLoader(false);
        setInitialLoading(false); // 👈 Hide full-loader and show the stepper
      } catch (error: any) {
        showErrorToast(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong"
        );
      }
    };

    loadSalons();
  }, []);

  const handleSalonSelect = (salon: { salonId: number; salonName: string }) => {
    setSelectedService([]); // Reset selected services
    setServiceCounters({});
    setFormData((prevData: any) => ({
      ...prevData,
      selectedSalon: salon.salonId, // Store selected salon id
      selectedSalonName: salon.salonName, // Store selected salon name
    }));
  };
  // -------------------------------

  const getDisabledLeaveDates = async (
    leaves: any[],
    nonWorkingDays: number[],
    barberId: number
  ) => {
    const disabledDates: string[] = [];

    // ✅ 1. Handle approved leaves (as-is)
    leaves.forEach((leave) => {
      const { start_date, end_date, status, availability_status } = leave;
      if (status === "approved" && availability_status === "unavailable") {
        const start = new Date(start_date);
        const end = new Date(end_date);
        let current = new Date(start);
        while (current <= end) {
          disabledDates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
      }
    });

    // ✅ 2. Override non-working days IF no available slots
    const convertedDays = nonWorkingDays.map((day) => (day === 7 ? 0 : day));

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    let current = new Date(today);
    while (current <= maxDate) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, ..., 6 = Saturday
      if (convertedDays.includes(dayOfWeek)) {
        const formattedDate = current.toISOString().split("T")[0];

        try {
          const res = await fetchTimeSlots(String(barberId), formattedDate);

          const slots = res?.[0]?.slots ?? [];

          const hasAvailable = slots.some((s: any) => !s.is_booked);

          if (!hasAvailable) {
            disabledDates.push(formattedDate);
          }
        } catch (error) {
          console.warn("Error fetching slots for", formattedDate, error);
          disabledDates.push(formattedDate); // fallback: disable
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return disabledDates;
  };

  // Select Barber
  useEffect(() => {
    const loadBarbers = async () => {
      if (formData.selectedSalon) {
        try {
          const response: any = await fetchBarberBySalon(
            formData.selectedSalon,
            1
          );

          if (response?.length > 0) {
            // Step 1: Filter only available barbers
            const availableBarbers = response.filter(
              (barber: any) => barber.availability_status === "available"
            );

            // Step 2: Set selected barber list
            setSelectedBarber(availableBarbers);

            // Step 3: If single barber is auto-selected, extract leave dates
            if (availableBarbers.length === 1) {
              const leaveDates = getDisabledLeaveDates(
                availableBarbers[0].leaves || [],
                availableBarbers[0].non_working_days || [],
                availableBarbers[0].id // ✅ Pass barber ID for slot check
              );
              setDisabledLeaveDates(await leaveDates); // ❗️ await the async call
            }

            // 👉 Optional: If multiple barbers are shown in the dropdown,
            // move the leave date logic to the dropdown's onChange handler
          }
        } catch (error: any) {
          if (error.response && error.response.data) {
            const apiMessage = error.response.data.message;
            showErrorToast(apiMessage || "An error occurred");
          } else {
            showErrorToast(error.message || "Something went wrong");
          }
        }
      }
    };

    loadBarbers();
  }, [formData.selectedSalon]);

  const handleBarberSelect = async (barber: {
    id: any;
    name: any;
    services: [];
    leaves?: any[];
    non_working_days?: number[];
  }) => {
    setSelectedBarberId(barber.id);
    formData.selectedBarber = barber.id;
    setSelectedService(selectedService);
    setIsNextButtonActive(true);
    setSelectBarber(barber); // Set barber details

    // ✅ Set form data
    setFormData((prevData: any) => ({
      ...prevData,
      selectedBarber: barber.id,
      selectBarbername: barber.name,
    }));

    appointmentData.selectBarbername = barber.name;

    // ✅ SET DISABLED LEAVE DATES
    const leaveDates = await getDisabledLeaveDates(
      barber.leaves || [],
      barber.non_working_days || [],
      barber.id
    );
    setDisabledLeaveDates(leaveDates);

    // ✅ Open modal
    setIsModalOpen(true);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const closeConfirmModal = () => {
    if (isModalOpen) {
      setSelectBarber(null);
      setSelectedBarberId(null);
      formData.selectedBarber = null;
    }
    toggleModal();
  };
  const handleConfirm = () => {
    // Do something when user confirms (e.g., proceed with booking)
    toggleModal(); // Close modal after confirmation
  };

  // const handleClose = () => {
  //   setSelectedBarber(null); // Deselect barber
  //   setSelectedServices([]); // Clear selected services
  //   toggleModal(); // Close modal
  // };

  useEffect(() => {
    if (activeArrowTab === 3) {
      // Assuming step 3 is the barber selection page
      setSelectedBarberId(null); // Clear selected barber
      setFormData((prevData: any) => ({
        ...prevData,
        selectedBarber: null,
        selectBarbername: null,
      }));
      setIsNextButtonActive(false); // Deactivate the Next button
    }
  }, [activeArrowTab]);

  const handlesBackClick = () => {
    if (activeArrowTab === 3) {
      // Assuming returning to service selection step
      setFormData((prevData: any) => ({
        ...prevData,
        selectedServices: [], // Clear services in formData if returning
        grandtotalServiceTime: 0,
      }));
      setSelectedService([]); // Reset selected services
      setServiceCounters({}); // Reset service counters
    }
  };
  // ----------------------------------

  // Select Services
  useEffect(() => {
    const getServices = async () => {
      // setShowLoader(true);
      try {
        const response = await fetchServices();
        const activeServices = response?.filter(
          (serv: any) => serv.isActive === true
        );
        setServices(activeServices); // Adjust based on response structure
        // if (activeServices?.length === 0) {
        //   const timer = setTimeout(() => {
        //     setShowLoader(false);
        //   }, 500); // Hide loader after 5 seconds
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
      } finally {
      }
    };
    getServices();
  }, []);

  useEffect(() => {
    const hasSelectedServiceWithCount = selectedService?.some(
      (service: any) => serviceCounters[service.serviceId] > 0
    );
    setIsNextButtonActive(hasSelectedServiceWithCount);
  }, [selectedService, serviceCounters]);

  const isServiceSelected = (serviceId: number) =>
    selectedService?.some((service: any) => service.serviceId === serviceId);

  useEffect(() => {
    // Recalculate grandtotalServiceTime whenever selectedService or serviceCounters changes
    if (selectedService?.length > 0) {
      const totalServiceTime = selectedService.reduce((sum, service: any) => {
        const count = serviceCounters[service.serviceId] || 1; // Default count to 1 if undefined
        const serviceTime =
          services.find((s: any) => s.id === service.serviceId)
            ?.default_service_time || 0;
        return sum + count * serviceTime;
      }, 0);

      setFormData((prevData) => ({
        ...prevData,
        grandtotalServiceTime: totalServiceTime, // Update grandtotalServiceTime dynamically
      }));
    }
  }, [selectedService, serviceCounters, services]);

  const handleCardClickservices = (
    serviceName: string,
    serviceId: number,
    currentCount: number,
    serviceTime: number,
    servicePrice: any
  ) => {
    setSelectedService((prevSelectedServices: any) => {
      const isAlreadySelected = prevSelectedServices.some(
        (service: any) => service.serviceId === serviceId
      );
      if (isAlreadySelected) {
        // Remove service from selected list
        handleServiceDeselect(serviceId); // Call to handle the removal in formData
        return prevSelectedServices.filter(
          (service: any) => service.serviceId !== serviceId
        );
      } else {
        handleServiceSelect(
          serviceId,
          serviceName,
          currentCount,
          serviceTime,
          servicePrice
        );
        setServiceCounters((prevCounters: any) => ({
          ...prevCounters,
          [serviceId]: prevCounters[serviceId] || 1,
        }));
        return [...prevSelectedServices, { serviceName, serviceId }];
      }
    });
  };

  const countDown = (
    serviceId: number,
    currentCount: number,
    serviceName: string,
    serviceTime: number,
    servicePrice: any
  ) => {
    if (currentCount > 0) {
      setServiceCounters((prev: any) => ({
        ...prev,
        [serviceId]: currentCount, // Update the service counter
      }));

      // Update the formData for the current service
      setFormData((prevData) => {
        const updatedServices = prevData.selectedServices.map(
          (service: any) => {
            if (service.serviceId === serviceId) {
              return {
                ...service,
                currentCount, // Update the currentCount in the service
                totalServiceTime: currentCount * serviceTime, // Update the totalServiceTime
                servicePrice,
              };
            }
            return service;
          }
        );

        // Recalculate the grand total service time
        const totalServiceTimeSum = updatedServices.reduce(
          (sum: number, service: any) => sum + service.totalServiceTime,
          0
        );

        return {
          ...prevData,
          selectedServices: updatedServices,
          grandtotalServiceTime: totalServiceTimeSum,
        };
      });
    } else {
      // If count is 0 or less, remove the service
      handleCardClickservices(
        "",
        serviceId,
        currentCount,
        serviceTime,
        servicePrice
      );
    }
  };

  const countUP = (serviceId: any, currentCount: number) => {
    if (currentCount < 6) {
      setServiceCounters((prev: any) => ({
        ...prev,
        [serviceId]: currentCount,
      }));
    }
  };
  const handleTipChange = (e: any) => {
    const appointm = appointmentData;
    const appointmd = selectedBarber;
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

  const handleServiceSelect = (
    serviceId: number,
    serviceName: string,
    currentCount: number,
    serviceTime: number,
    servicePrice: any
  ) => {
    const totalServiceTime = currentCount * serviceTime;

    setFormData((prevData: any) => {
      const existingServiceIndex = prevData.selectedServices.findIndex(
        (service: any) => service.serviceId === serviceId
      );

      // If the service exists, update its currentCount and totalServiceTime
      if (existingServiceIndex !== -1) {
        const updatedServices = [...prevData.selectedServices];
        updatedServices[existingServiceIndex].currentCount = currentCount;
        updatedServices[existingServiceIndex].totalServiceTime =
          totalServiceTime;

        // Sum all total service times
        const totalServiceTimeSum = updatedServices.reduce(
          (sum: number, service: any) => sum + service.totalServiceTime,
          0
        );

        return {
          ...prevData,
          selectedServices: updatedServices,
          grandtotalServiceTime: totalServiceTimeSum, // Store the sum in grandtotalServiceTime
        };
      } else {
        // If the service doesn't exist, add it to the array with totalServiceTime
        const updatedServices = [
          ...prevData.selectedServices,
          {
            serviceId,
            serviceName,
            currentCount,
            serviceTime,
            totalServiceTime,
            servicePrice,
          },
        ];

        // Sum all total service times
        const totalServiceTimeSum = updatedServices.reduce(
          (sum: number, service: any) => sum + service.totalServiceTime,
          0
        );

        return {
          ...prevData,
          selectedServices: updatedServices,
          grandtotalServiceTime: totalServiceTimeSum, // Store the sum in grandtotalServiceTime
        };
      }
    });
  };

  const handleServiceDeselect = (serviceId: number) => {
    setFormData((prevData: any) => {
      // Filter out the deselected service
      const updatedServices = prevData.selectedServices.filter(
        (service: any) => service.serviceId !== serviceId
      );

      // Recalculate the total service time
      const totalServiceTimeSum = updatedServices.reduce(
        (sum: number, service: any) => sum + service.totalServiceTime,
        0
      );

      return {
        ...prevData,
        selectedServices: updatedServices,
        grandtotalServiceTime: totalServiceTimeSum, // Update grandtotalServiceTime
      };
    });
  };
  // useEffect(() => {
  //   if (activeArrowTab === 2) {
  //     // Reset the button state when entering the "Select Services" page
  //     setIsNextButtonActive(false);
  //   }
  // }, [activeArrowTab]);

  // Move early returns after all hooks are declared
  // if (loading) return <p>Loading services...</p>;
  // if (error) return <p>{error}</p>;
  // ----------------------------------

  // Select Date & Time slot
  useEffect(() => {
    const fetchTimeSlotsForDate = async () => {
      const barberId = formData.selectedBarber; // Get barberId from formData
      if (!selectedDate || !barberId) return;
      try {
        const formattedDate = selectedDate.toLocaleDateString("en-CA"); // Format date as YYYY-MM-DD
        const response = await fetchTimeSlots(barberId, formattedDate);
        if (response?.length > 0) {
          const fetchedData = response[0].slots; // Assume this returns a structure { Morning: [], Afternoon: [], Evening: [] }
          const serviceTimeInMinutes = formData.grandtotalServiceTime; // e.g., 50 minutes
          const serviceTimeInSeconds = serviceTimeInMinutes * 60; // 90 minutes
          const timeSlotInfo = blockUnavailableSlots(
            fetchedData,
            serviceTimeInSeconds
          );

          setTimeSlotData(timeSlotInfo);
          if (timeSlotInfo.length > 0) {
            const firstSlotId = timeSlotInfo[0].id; // Replace with actual property name
            setFormData((prevData) => ({
              ...prevData,
              selectedSlotId: firstSlotId, // Save selected slot id in formData
            }));
          }
        } else {
          setTimeSlotData([]);
          setFormData((prevData) => ({
            ...prevData,
            selectedSlotId: null, // Save selected slot id in formData
          }));
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
    fetchTimeSlotsForDate();
  }, [selectedDate, formData.selectedBarber]); // Effect depends on selectedDate and selectedBarber

  const blockUnavailableSlots = (slots: any, serviceTimeInSeconds: any) => {
    let lastBookedIndex: number | null = null;

    slots.forEach((slot: any, i: number) => {
      if (slot.is_booked) {
        if (
          lastBookedIndex !== null &&
          slot.start_time_seconds - slots[lastBookedIndex].end_time_seconds <
            serviceTimeInSeconds
        ) {
          slots
            .slice(lastBookedIndex + 1, i)
            .forEach((s: any) => (s.is_booked = true));
        }
        lastBookedIndex = i;
      }
    });
    // for (let i = 0; i < slots.length; i++) {
    //   if (slots[i].is_booked) {
    //     if (lastBookedIndex !== null) {
    //       const timeGap =
    //         slots[i].start_time_seconds - slots[lastBookedIndex].end_time_seconds;

    //       if (timeGap < serviceTime) {
    //         // Block all slots between lastBookedIndex and i
    //         for (let j = lastBookedIndex + 1; j < i; j++) {
    //           slots[j].is_booked = true;
    //         }
    //       }
    //     }
    //     lastBookedIndex = i;
    //   }
    // }

    return slots;
  };
  const [currentTimeInSeconds, setCurrentTimeInSeconds] = useState(() => {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  });

  const [todayDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  });

  // Define the valid keys for categories
  type CategoryKey = "Morning" | "Afternoon" | "Evening" | "Night";
  // Categories with start and end times
  const categories: Record<CategoryKey, { start: string; end: string }> = {
    Morning: { start: "00:00", end: "12:00" },
    Afternoon: { start: "12:00", end: "17:00" },
    Evening: { start: "17:00", end: "21:00" },
    Night: { start: "21:00", end: "24:00" }, // Wraps to next day
  };

  // Filter slots by category
  const filterSlotsByCategory = (category: CategoryKey) => {
    setSelectedCategory(category);
    const { start, end } = categories[category];
    const formattedSlots = (timeSlotData || []).filter((slot: any) => {
      const startTime = slot.start_time_formatted;

      // Handle the wrap-around for "Night"
      if (category === "Night") {
        return (
          (startTime >= start && startTime <= "23:59") ||
          (startTime >= "21:00" && startTime < end)
        );
      }

      // Regular case: Match within the time range
      return startTime >= start && startTime < end;
    });
    // Return all slots in the category with their booking state
    return formattedSlots.map((slot: any) => ({
      id: slot.id,
      startTime: slot.start_time_formatted,
      isBooked: slot.is_booked,
      slotDate: slot.slot_date,
      startTimeSeconds: slot.start_time_seconds,
    }));
  };

  // Handle period change
  const handlePeriodChange = (period: any) => {
    setSelectedPeriod(period);
    if (period !== "") {
      const filteredSlots = filterSlotsByCategory(period); // Get filtered slots
      setTimeSlots(filteredSlots); // Update state
    }
  };
  const isCategoryDisabled = (category: CategoryKey, selectedDate: any) => {
    const currentTime = new Date();

    // Check if the selected date is today
    const isToday = isSameDay(currentTime, selectedDate);

    // Parse category start and end times
    const categoryStartTime = parse(
      categories[category].start,
      "HH:mm",
      selectedDate
    );
    const categoryEndTime = parse(
      categories[category].end,
      "HH:mm",
      selectedDate
    );

    // Handle wrapping for "Night" category
    if (category === "Night") {
      const nightEndTime = parse(
        categories[category].end,
        "HH:mm",
        addDays(selectedDate, 1)
      );
      if (isToday) {
        // For today, check if the current time is after 9 PM or before 6 AM
        return !(
          isAfter(currentTime, categoryStartTime) ||
          isBefore(currentTime, nightEndTime)
        );
      }
      return false; // Night is always available for non-today dates
    }

    // For other categories, check if the current time is within the range
    if (isToday) {
      return isAfter(currentTime, categoryEndTime); // Disable if current time is after the category's end time
    }

    return false; // Do not disable for non-today dates
  };

  const preventSpaceKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  // Handle slot selection
  const handleSlotSelection = (slot: any) => {
    if (!formData?.grandtotalServiceTime || !timeSlots?.length) {
      // console.error("Service time or time slots are not available.");
      return;
    }
    const serviceTimeInMinutes = formData.grandtotalServiceTime; // e.g., 50 minutes
    const slotDuration = 15; // Each slot is 15 minutes
    const slotsNeeded = Math.ceil(serviceTimeInMinutes / slotDuration); // Calculate the number of slots required

    // Find the index of the clicked slot
    let startIndex = timeSlots.findIndex((s) => s.startTime === slot);
    if (startIndex === -1) {
      // console.error("Selected slot not found in available slots.");
      return;
    }
    let filteredData = timeSlots;
    // Check if the required slots are more than available
    const remainingSlots = timeSlots.length - startIndex; // Calculate remaining slots from the selected one
    if (remainingSlots < slotsNeeded) {
      const startSlotData = timeSlots.find((s) => s.startTime === slot);
      const dd = timeSlotData;
      // Get all data after the selected index
      filteredData = dd.filter((info) => info.id >= startSlotData.id);

      // Return all slots in the category with their booking state
      filteredData = filteredData.map((slot: any) => ({
        id: slot.id,
        startTime: slot.start_time_formatted,
        isBooked: slot.is_booked,
        slotDate: slot.slot_date,
        startTimeSeconds: slot.start_time_seconds,
      }));
      // Find the index of the clicked slot
      startIndex = filteredData.findIndex((s) => s.startTime === slot);
      if (startIndex === -1) {
        // console.error("Selected slot not found in available slots.");
        return;
      }
      // remainingSlotsNew = filteredData.slice(startIndexNew, slotsNeeded + 1);
      const remainingSlotsNew = filteredData.length - startIndex; // Calculate remaining slots from the selected one
      if (remainingSlotsNew < slotsNeeded) {
        showWarningToast(
          "Insufficient consecutive slots for the service time."
        );
        return;
      }
    }

    // Get the range of consecutive slots
    const consecutiveSlots = filteredData.slice(
      startIndex,
      startIndex + slotsNeeded
    );

    // Check if all slots are available and not booked
    const areAllSlotsAvailable = consecutiveSlots.every((s) => !s.isBooked);

    if (!areAllSlotsAvailable) {
      // console.error("Some of the required slots are already booked.");
      showWarningToast("Some of the required slots are already booked.");
      return;
    }

    // Get the start times and IDs of the selected slots
    const selectedSlotTimes = consecutiveSlots.map((s) => s.startTime);
    const selectedSlotIds = consecutiveSlots.map((s) => s.id);

    // Update the state with the selected slots
    setSelectedSlot(selectedSlotTimes); // Update selectedSlot with multiple values
    setFormData((prevData: any) => ({
      ...prevData,
      selectedSlot: selectedSlotTimes, // Store selectedSlotTime (array of times)
      selectedSlotId: selectedSlotIds[0], // Store selectedSlotId (array of ids)
    }));
  };

  // Handle Date selection
  const handleDateSelection = (date: any) => {
    if (date && date.length > 0) {
      const selectedDate = date[0];
      const formattedDate = selectedDate.toLocaleDateString("en-CA"); // Format as "YYYY-MM-DD"
      setSelectedDate(selectedDate);
      setFormData((prevData: any) => ({
        ...prevData,
        selectedDate: null,
        selectedPeriod: "",
        selectedSlot: [],
      }));
      setTimeSlotVisible(false); // Hide period selection
      setSelectedPeriod(null);
      setTimeSlots([]); // Clear available time slots

      setSelectedCategory("");
      setFormData((prevData) => ({
        ...prevData,
        selectedDate: formattedDate,
      }));
    }
  };

  useEffect(() => {
    // Check if all required selections are made
    const isFormValid = selectedDate && selectedPeriod && selectedSlot;
    setIsNextButtonActive(isFormValid);

    if (isFormValid) {
      setFormData((prevData: any) => ({
        ...prevData,
        selectedDate: selectedDate.toLocaleDateString("en-CA"),
        selectedPeriod,
        selectedSlot,
      }));
    }
  }, [selectedDate, selectedPeriod, selectedSlot]);

  // const formatTime = (time: string) => {
  //   // Assumes input is "HH:mm:ss"
  //   return time.slice(0, 5); // Extract "HH:mm"
  // };
  const resetDateAndSlotSelection = () => {
    setSelectedDate(null);
    //  setSelectedPeriod(null);
    setTimeSlots([]);
    setFormData((prevData: any) => ({
      ...prevData,
      selectedDate: null,
      selectedPeriod: "",
      selectedSlot: [],
    }));
    setTimeSlotVisible(false); // Hide period selection
    setSelectedPeriod(null);
    setTimeSlots([]); // Clear available time slots

    showInfoToast("Selections have been reset. Please reselect the date.");
  };

  const handleBackClick = (currentPage: number) => {
    if (currentPage === 4) {
      resetDateAndSlotSelection();
      //  window.location.reload();
    }
    toggleArrowTab(currentPage - 1); // Move to the previous page
  };

  // ---------------------------------
  // function formatTime(time: string) {
  //   const [hours, minutes] = time.split(":").map(Number); // Split time and convert to number
  //   const date = new Date();
  //   date.setHours(hours);
  //   date.setMinutes(minutes);

  //   return date.toLocaleString("en-US", {
  //     hour: "numeric",
  //     minute: "numeric",
  //     hour12: true,
  //   });
  // }

  const timeSlot = (slot: any) => {
    if (Array.isArray(slot)) {
      return slot.map((time) => formatTime(time)).join(" • ");
    }
    return slot ? formatTime(slot) : "";
  };
  const savedTheme =
    localStorage.getItem("theme") || LAYOUT_MODE_TYPES.LIGHTMODE;
  const [layoutMode, setLayoutMode] = useState(savedTheme);

  useEffect(() => {
    document.body.className =
      layoutMode === LAYOUT_MODE_TYPES.DARKMODE ? "dark" : "";
  }, [layoutMode]);

  document.title = `${commonText.PROJECT_NAME}- Admin & Dashboard Template`;
  return (
    <React.Fragment>
      <Container fluid>
        {/* <BreadCrumb title="Book Appointment & Schedule" pageTitle="Appointment" /> */}
        <Row className="d-flex justify-content-center">
          <Col xl={12} className="justify-content-center">
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">Book Appointments</h4>
              </CardHeader>
              <CardBody>
                <Form className="form-steps">
                  <div className="text-center pt-3 pb-4 mb-1">
                    <img
                      src={
                        layoutMode === LAYOUT_MODE_TYPES.DARKMODE
                          ? logoDark
                          : logoDark
                      }
                      className="card-logo mx-auto"
                      alt="logo"
                      height="100"
                    />
                  </div>
                  {/* Loader OR Stepper */}
                  {initialLoading ? (
                    <div className="text-center my-5">
                      <Spinner />
                    </div>
                  ) : (
                    <>
                      <div className="step-arrow-nav mb-4">
                        <Nav
                          className="nav-pills custom-nav nav-justified"
                          role="tablist"
                        >
                          {/* Select Salon 1*/}
                          {!(
                            storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
                            storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
                            salons.length === 1
                          ) && (
                            <NavItem>
                              <NavLink
                                href="#"
                                className={classnames({
                                  active: activeArrowTab === 1,
                                  done:
                                    activeArrowTab <= 7 && activeArrowTab > 0,
                                })}
                                onClick={() => toggleArrowTab(1)}
                                style={{
                                  pointerEvents: "none",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Select Salon
                              </NavLink>
                            </NavItem>
                          )}

                          {/* Select Services 2*/}
                          <NavItem>
                            <NavLink
                              href="#"
                              id="steparrow-gen-info-tab"
                              className={classnames({
                                active: activeArrowTab === 2,
                                done: activeArrowTab <= 7 && activeArrowTab > 1,
                              })}
                              onClick={() => {
                                toggleArrowTab(2);
                              }}
                              style={{
                                pointerEvents: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Select Services
                            </NavLink>
                          </NavItem>
                          {/* Select Barber 3*/}
                          <NavItem>
                            <NavLink
                              href="#"
                              id="steparrow-gen-info-tab"
                              className={classnames({
                                active: activeArrowTab === 3,
                                done: activeArrowTab <= 7 && activeArrowTab > 2,
                              })}
                              onClick={() => {
                                toggleArrowTab(3);
                              }}
                              style={{
                                pointerEvents: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Select Barber
                            </NavLink>
                          </NavItem>
                          {/* Date & Time Slot 4*/}
                          <NavItem>
                            <NavLink
                              href="#"
                              id="steparrow-gen-info-tab"
                              className={classnames({
                                active: activeArrowTab === 4,
                                done: activeArrowTab <= 7 && activeArrowTab > 3,
                              })}
                              onClick={() => {
                                toggleArrowTab(4);
                              }}
                              style={{
                                pointerEvents: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Date & Time
                            </NavLink>
                          </NavItem>
                          {/* Confirmation Details */}
                          <NavItem>
                            <NavLink
                              href="#"
                              id="steparrow-gen-info-tab"
                              className={classnames({
                                active: activeArrowTab === 5,
                                done: activeArrowTab <= 7 && activeArrowTab > 4,
                              })}
                              onClick={() => {
                                toggleArrowTab(5);
                              }}
                              style={{
                                pointerEvents: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Confirmation Details
                            </NavLink>
                          </NavItem>
                          {/* Successfully Booked */}
                          <NavItem>
                            <NavLink
                              href="#"
                              id="steparrow-gen-info-tab"
                              className={classnames({
                                active: activeArrowTab === 6,
                                done: activeArrowTab <= 7 && activeArrowTab > 5,
                              })}
                              onClick={() => {
                                toggleArrowTab(6);
                              }}
                              style={{
                                pointerEvents: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Appointment Details
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              href="#"
                              id="steparrow-gen-info-tab"
                              className={classnames({
                                active: activeArrowTab === 7,
                                done: activeArrowTab <= 7 && activeArrowTab > 6,
                              })}
                              onClick={() => {
                                toggleArrowTab(7);
                              }}
                              style={{
                                pointerEvents: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              Booking
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>
                      {/* Tab Content  */}
                      <TabContent activeTab={activeArrowTab}>
                        {/* Select Salon 1 */}
                        {!(
                          storeRoleInfo?.role_name === ROLES.SALON_MANAGER ||
                          storeRoleInfo?.role_name === ROLES.SALON_OWNER ||
                          salons.length === 1
                        ) && (
                          <TabPane id="steparrow-description-info" tabId={1}>
                            <div className="d-flex align-items-start gap-3 mt-4">
                              <button
                                type="button"
                                className="btn btn-success btn-label right ms-auto nexttab nexttab"
                                disabled={!selectedSalon}
                                onClick={() => {
                                  if (selectedSalon) {
                                    toggleArrowTab(activeArrowTab + 1);
                                    setIsNextButtonActive(false);
                                  } else {
                                    showWarningToast(
                                      "Please select a salon before proceeding!"
                                    );
                                  }
                                }}
                              >
                                <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                Next
                              </button>
                            </div>
                            <Card>
                              <CardHeader>
                                <h5 className="card-title mb-0">
                                  Select Salon
                                </h5>
                              </CardHeader>
                              <div className="card-body">
                                {showLoader ? (
                                  <Loader />
                                ) : (
                                  <div className="row">
                                    {salons?.length ? (
                                      salons?.map((salon) => (
                                        <div
                                          key={salon.salon.id}
                                          className="col-lg-6 col-xl-6 col-md-12 col-xs-12 col-sm-12 mb-3 "
                                          style={{
                                            cursor: "pointer",
                                            border:
                                              salon.salon.id === selectedSalon
                                                ? "2px solid rgb(106, 114, 137)"
                                                : "2px solid transparent",
                                            borderRadius: "8px",
                                          }}
                                          onClick={() => {
                                            setSelectedSalon(salon.salon.id);
                                            handleSalonSelect({
                                              salonId: salon.salon.id,
                                              salonName: salon.salon.name,
                                            });
                                            setIsNextButtonActive(true);
                                          }}
                                        >
                                          <div className="d-flex align-items-center gap-3 border p-3 rounded min-h-md-180">
                                            {/* Image Section */}
                                            <img
                                              src={
                                                salon.salon.photos &&
                                                salon.salon.photos.length > 2
                                                  ? JSON.parse(
                                                      salon.salon.photos
                                                    )[0]
                                                  : default_image
                                              }
                                              alt={salon.salon.salon_name}
                                              className="rounded"
                                              style={{
                                                width: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                              }}
                                            />
                                            <div>
                                              <h5 className="mb-1">
                                                {salon.salon.name}
                                              </h5>
                                              <p className="mb-1 text-muted">
                                                Address: {salon.address}
                                              </p>
                                              <p className="card-text text-muted mb-1">
                                                Open:{" "}
                                                {formatTime(
                                                  salon.salon.open_time
                                                )}{" "}
                                                • Close:{" "}
                                                {formatTime(
                                                  salon.salon.close_time
                                                )}
                                              </p>
                                              <span
                                                className={`badge ${
                                                  salon.salon.status === "open"
                                                    ? "bg-success"
                                                    : "bg-danger"
                                                }`}
                                              >
                                                {salon.salon.status
                                                  ? salon.salon.status ===
                                                    "close"
                                                    ? "Closed for Today"
                                                    : "Open"
                                                  : "Open"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center my-3">
                                        No Salon available
                                      </div> // Optional: Show alternative content if no data
                                    )}
                                  </div>
                                )}
                              </div>
                            </Card>
                          </TabPane>
                        )}

                        {/* Select Services 2 */}
                        <TabPane id="steparrow-description-info" tabId={2}>
                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => {
                                toggleArrowTab(activeArrowTab - 1);
                              }}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                              Back
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab"
                              disabled={selectedService?.length === 0} // Disable button if no valid service is selected
                              onClick={() => {
                                if (selectedService.length > 0) {
                                  toggleArrowTab(activeArrowTab + 1);
                                  setIsNextButtonActive(false);
                                }
                              }}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Next
                            </button>
                          </div>
                          <Card>
                            <CardHeader>
                              <h5 className="card-title mb-0">
                                Select Services
                              </h5>
                            </CardHeader>
                            <div className="services-list-container mt-4">
                              <div className="row">
                                {services?.length ? (
                                  services?.map((service: any) => {
                                    const isSelected = isServiceSelected(
                                      service.id
                                    ); // Check if the service is selected
                                    const currentCount =
                                      serviceCounters[service.id] || 1;
                                    return (
                                      <div
                                        className="col-md-4 "
                                        key={service.id}
                                      >
                                        <div
                                          className="card service-card"
                                          style={{
                                            cursor: "pointer",
                                            border: isSelected
                                              ? "2px solid rgb(111, 118, 139)"
                                              : "none",
                                          }}
                                          onClick={() => {
                                            handleCardClickservices(
                                              service.name,
                                              service.id,
                                              currentCount,
                                              service.default_service_time,
                                              service.min_price
                                            );
                                          }}
                                        >
                                          <div
                                            className="card-body p-0 px-2 px-lg-3 py-3"
                                            style={{
                                              minHeight:
                                                window.innerWidth >= 768 &&
                                                window.innerWidth <= 772
                                                  ? "170px"
                                                  : "auto",
                                            }}
                                          >
                                            <h5 className="card-title">
                                              {service.name}
                                            </h5>
                                            <p className="card-text">
                                              <strong>Service Time:</strong>{" "}
                                              {service.default_service_time}min
                                            </p>
                                            <p className="card-text">
                                              <strong>Price:</strong> $
                                              {service.min_price} - $
                                              {service.max_price}
                                            </p>
                                            {isSelected && (
                                              <div>
                                                <div className="input-step mt-2 ">
                                                  <button
                                                    type="button"
                                                    className="minus material-shadow"
                                                    disabled={currentCount <= 1}
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      const newCount =
                                                        currentCount - 1;
                                                      countDown(
                                                        service.id,
                                                        newCount,
                                                        service.name,
                                                        service.default_service_time,
                                                        service.min_price
                                                      );
                                                    }}
                                                  >
                                                    -
                                                  </button>
                                                  <Input
                                                    type="number"
                                                    className="product-quantity"
                                                    value={currentCount}
                                                    min="1"
                                                    max="5"
                                                    readOnly
                                                  />
                                                  <button
                                                    type="button"
                                                    className="plus material-shadow"
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      if (currentCount < 5) {
                                                        const newCount =
                                                          currentCount + 1;
                                                        countUP(
                                                          service.id,
                                                          newCount
                                                        );
                                                        handleServiceSelect(
                                                          service.id,
                                                          service.name,
                                                          newCount,
                                                          service.default_service_time,
                                                          service.min_price
                                                        );
                                                      } else {
                                                        showWarningToast(
                                                          "You have reached the limit of 5!"
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center my-3">
                                    No service available
                                  </div> // Optional: Show alternative content if no data
                                )}
                              </div>
                            </div>
                          </Card>
                        </TabPane>

                        {/* Select Barber */}
                        <TabPane id="steparrow-description-info" tabId={3}>
                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => {
                                toggleArrowTab(activeArrowTab - 1);
                              }}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Back
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              disabled={!isNextButtonActive}
                              onClick={() => {
                                if (selectedBarberId) {
                                  toggleArrowTab(activeArrowTab + 1);
                                  // if (selectedDate) {
                                  //   setTimeSlotVisible(true);
                                  // }
                                  // setIsNextButtonActive(true);
                                }
                              }}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Next
                            </button>
                          </div>
                          <>
                            <Row>
                              <Col xl={12}>
                                <Card>
                                  <CardHeader>
                                    <h5 className="card-title mb-0">
                                      Select Barber
                                    </h5>
                                  </CardHeader>
                                  <div id="teamlist">
                                    <Row className="team-list grid-view-filter">
                                      <Col lg={12} className="mb-4">
                                        <Row>
                                          {selectBarber?.length ? (
                                            selectBarber.map(
                                              (barberData: any) => {
                                                const isAvailable =
                                                  barberData.availability_status ===
                                                  "available";
                                                return (
                                                  <Col
                                                    key={barberData.id}
                                                    sm={6}
                                                    md={4}
                                                    lg={2}
                                                  >
                                                    <Card
                                                      className="team-box text-center"
                                                      onClick={() => {
                                                        if (isAvailable) {
                                                          handleBarberSelect(
                                                            barberData
                                                          ); // Trigger modal
                                                        }
                                                      }}
                                                      style={{
                                                        cursor: isAvailable
                                                          ? "pointer"
                                                          : "not-allowed",
                                                        border:
                                                          barberData.id ===
                                                          selectedBarberId
                                                            ? "2px solid rgb(106, 114, 137)"
                                                            : "2px solid transparent",
                                                      }}
                                                    >
                                                      <CardBody
                                                        style={{
                                                          minHeight: "260px",
                                                        }}
                                                      >
                                                        <div className="team-profile-img mb-1">
                                                          <div className="avatar-lg img-thumbnail rounded-circle mx-auto">
                                                            {barberData.photo ? (
                                                              <img
                                                                src={
                                                                  barberData.photo
                                                                }
                                                                alt={
                                                                  barberData.name
                                                                }
                                                                className="img-fluid d-block rounded-circle"
                                                                style={{
                                                                  height:
                                                                    "85px",
                                                                  width: "6rem",
                                                                }}
                                                              />
                                                            ) : (
                                                              <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary d-flex justify-content-center align-items-center">
                                                                {barberData.name?.charAt(
                                                                  0
                                                                )}
                                                                {barberData.name
                                                                  ?.split(" ")
                                                                  .slice(-1)
                                                                  .toString()
                                                                  ?.charAt(0)}
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <h5 className="mt-2">
                                                          {barberData.name}
                                                        </h5>
                                                        <p className="text-muted mb-0">
                                                          {barberData.position}
                                                        </p>
                                                        <p className="text-muted mb-0">
                                                          {isAvailable
                                                            ? "Available"
                                                            : "Unavailable"}
                                                        </p>
                                                        {!isAvailable && (
                                                          <p className="text-danger mt-2">
                                                            Currently
                                                            unavailable
                                                          </p>
                                                        )}
                                                      </CardBody>
                                                    </Card>
                                                  </Col>
                                                );
                                              }
                                            )
                                          ) : (
                                            <div className="text-center my-3">
                                              No Barber available
                                            </div>
                                          )}
                                        </Row>
                                      </Col>
                                    </Row>
                                  </div>
                                </Card>
                              </Col>
                            </Row>
                            {/* Modal for showing selected barber and their services */}
                            <SelectBarberModal
                              isOpen={isModalOpen}
                              toggle={closeConfirmModal}
                              barberData={selectedBarber}
                              selectedServices={selectedService}
                              services={services}
                              onConfirm={handleConfirm}
                            />
                          </>
                        </TabPane>

                        {/* Date & Time */}
                        <TabPane id="steparrow-description-info" tabId={4}>
                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => handleBackClick(activeArrowTab)}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                              Back
                            </button>

                            <button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              disabled={!isNextButtonActive}
                              onClick={() => toggleArrowTab(activeArrowTab + 1)}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Next
                            </button>
                          </div>
                          <Row>
                            <Col lg={12}>
                              <Card>
                                <CardHeader>
                                  <h5 className="card-title mb-0">
                                    Select Date & Time Slot
                                  </h5>
                                </CardHeader>
                                <CardBody>
                                  <Form>
                                    <Row className="gy-3">
                                      {/* Date Picker */}
                                      <Col lg={12}>
                                        <div>
                                          <Label className="form-label mb-0">
                                            Select Date
                                          </Label>
                                          <Flatpickr
                                            key={disabledLeaveDates.join(",")} // 💡 Key forces Flatpickr to remount
                                            placeholder="Click Here to Select Date & Time slot"
                                            className={`form-control bg-light border-light  ${
                                              selectedDate
                                                ? "selected-date-highlight"
                                                : ""
                                            }`}
                                            options={{
                                              dateFormat: "Y-m-d",
                                              minDate: new Date(),
                                              maxDate: new Date(
                                                new Date().setDate(
                                                  new Date().getDate() + 30
                                                )
                                              ),
                                              defaultDate: new Date(),
                                              disable: disabledLeaveDates, // ✅ Now works
                                            }}
                                            onChange={(date: Date[]) => {
                                              handleDateSelection(date);
                                              setTimeSlotVisible(true);
                                            }}
                                          />
                                        </div>
                                      </Col>
                                      {/* Time Period Dropdown */}
                                      {timeSlotVisible && (
                                        <Col lg={12}>
                                          <div>
                                            <Label className="form-label mb-0">
                                              Select Time Period
                                            </Label>
                                            <select
                                              className="form-select mb-3"
                                              aria-label="Select Time Period"
                                              onChange={(e) =>
                                                handlePeriodChange(
                                                  e.target.value as CategoryKey
                                                )
                                              }
                                              value={selectedCategory}
                                            >
                                              <option value="">
                                                Select Time Period
                                              </option>
                                              {Object.keys(categories).map(
                                                (category) => {
                                                  const isDisabled =
                                                    isCategoryDisabled(
                                                      category as CategoryKey,
                                                      selectedDate
                                                    ); // Pass selectedDate
                                                  return (
                                                    <option
                                                      key={category}
                                                      value={category}
                                                      disabled={isDisabled}
                                                    >
                                                      {category}
                                                    </option>
                                                  );
                                                }
                                              )}
                                            </select>
                                          </div>
                                        </Col>
                                      )}

                                      {/* Time Slot Buttons */}
                                      {selectedPeriod && (
                                        <Col
                                          lg={12}
                                          style={{ marginTop: "0px" }}
                                        >
                                          <div>
                                            <Label className="form-label mb-1">
                                              Select Slot
                                            </Label>
                                            <div className="d-flex flex-wrap gap-2">
                                              {timeSlots.length > 0 ? (
                                                timeSlots.map(
                                                  (slot: any, index: any) => {
                                                    const isSelected =
                                                      formData.selectedSlot.includes(
                                                        slot.startTime
                                                      );
                                                    const isToday =
                                                      slot.slotDate ===
                                                      todayDate; // Check if the slot is for today
                                                    const isPastTime =
                                                      isToday &&
                                                      slot.startTimeSeconds <
                                                        currentTimeInSeconds; // Disable only past times for today
                                                    const isDisabled =
                                                      slot.isBooked ||
                                                      isPastTime;

                                                    return (
                                                      <button
                                                        key={index}
                                                        type="button"
                                                        className={`btn ${
                                                          isSelected
                                                            ? "btn-primary"
                                                            : "btn-outline-primary"
                                                        }`}
                                                        onClick={() =>
                                                          !slot.isBooked &&
                                                          handleSlotSelection(
                                                            slot.startTime
                                                          )
                                                        }
                                                        disabled={isDisabled}
                                                      >
                                                        {formatTime(
                                                          slot.startTime
                                                        )}
                                                      </button>
                                                    );
                                                  }
                                                )
                                              ) : (
                                                <div>
                                                  No slots available for this
                                                  time.
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </Col>
                                      )}
                                    </Row>
                                  </Form>
                                </CardBody>
                              </Card>
                            </Col>
                          </Row>
                        </TabPane>

                        {/* Confirmation Page */}
                        <TabPane id="steparrow-gen-info" tabId={5}>
                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => {
                                toggleArrowTab(activeArrowTab - 1);
                              }}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                              Back
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              disabled={!isFormValid()}
                              onClick={() => {
                                toggleArrowTab(activeArrowTab + 1);
                              }}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Next
                            </button>
                          </div>
                          <div className="py-3">
                            <Row>
                              <Col lg={6}>
                                <div className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="firstName"
                                  >
                                    First Name
                                  </Label>
                                  <Input
                                    type="text"
                                    className="form-control"
                                    id="firstName"
                                    placeholder="Enter First Name"
                                    maxLength={25} // ✅ Limit to 25 characters
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                      preventSpaceKey(e); // Prevent spaces
                                      if (
                                        !/[a-zA-Z]/.test(e.key) &&
                                        e.key !== "Backspace"
                                      ) {
                                        e.preventDefault(); // Block non-alphabetic characters
                                      }
                                    }}
                                  />
                                  {formData.firstName.length === 25 && (
                                    <small className="text-danger">
                                      Maximum 25 characters allowed
                                    </small>
                                  )}
                                </div>
                              </Col>
                              <Col lg={6}>
                                <div className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="lastName"
                                  >
                                    Last Name
                                  </Label>
                                  <Input
                                    type="text"
                                    className="form-control"
                                    id="lastName"
                                    placeholder="Enter Last Name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    maxLength={25} // ✅ Limit to 25 characters
                                    onKeyDown={(e) => {
                                      preventSpaceKey(e); // Prevent spaces
                                      if (
                                        !/[a-zA-Z]/.test(e.key) &&
                                        e.key !== "Backspace"
                                      ) {
                                        e.preventDefault(); // Block non-alphabetic characters
                                      }
                                    }}
                                  />
                                  {formData.lastName.length === 25 && (
                                    <small className="text-danger">
                                      Maximum 25 characters allowed
                                    </small>
                                  )}
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="mb-3">
                                  <Label className="form-label" htmlFor="email">
                                    Email
                                  </Label>
                                  <Input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Enter Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                  />
                                  {emailError && (
                                    <p className="text-danger mt-1">
                                      {emailError}
                                    </p>
                                  )}
                                </div>
                              </Col>
                              <Col lg={12}>
                                <div className="mt-2 mb-3">
                                  <Label>Mobile Number</Label>
                                  <Dropdown
                                    className="input-group"
                                    isOpen={dropdownOpen5}
                                    toggle={toggle5}
                                  >
                                    <DropdownToggle
                                      as="button"
                                      className="btn btn-light border arrow-none"
                                    >
                                      <img
                                        src={seletedCountry4.flagImg}
                                        alt="country flag"
                                        className="options-flagimg"
                                        height="20"
                                      />
                                    </DropdownToggle>
                                    <Input
                                      type="text"
                                      className="form-control rounded-end flag-input"
                                      placeholder="(XXX)-XXX-XXXX"
                                      id="mobileNumber"
                                      value={formData.mobileNumber}
                                      onChange={handleInputChange}
                                    />
                                  </Dropdown>
                                  {mobileError && (
                                    <p className="text-danger mt-1">
                                      {mobileError}
                                    </p>
                                  )}
                                </div>
                              </Col>
                            </Row>
                            {/* <div className="form-check mb-3">
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            id="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleInputChange}
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="agreeTerms"
                          >
                            To confirm your details
                          </Label>
                        </div> */}
                          </div>
                        </TabPane>

                        {/* Appointment Details */}
                        <TabPane id="steparrow-description-info" tabId={6}>
                          <div className="d-flex align-items-start gap-3 mt-4">
                            <button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => {
                                toggleArrowTab(activeArrowTab - 1);
                              }}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Back
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              onClick={handleSubmit} // Call handleSubmit when clicked
                              disabled={showSpinner} // Disable button when loader is active
                            >
                              {showSpinner && (
                                <Spinner size="sm" className="me-2">
                                  Loading...
                                </Spinner>
                              )}
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Submit
                            </button>
                          </div>
                          <Card>
                            <CardHeader>
                              <h5 className="card-title">
                                Appointment Details
                              </h5>
                            </CardHeader>
                            <CardBody>
                              <Row>
                                <Col sm={8}>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Selected Salon:</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {appointmentData?.selectedSalonName}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Selected Services:</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {appointmentData?.selectedServices?.map(
                                        (service: any, index: any) => (
                                          <div
                                            key={index}
                                            className="d-flex align-items-center mb-2"
                                          >
                                            <i className="ri-scissors-line  fs-5 me-2"></i>
                                            <div className="text-start">
                                              <span>{service.serviceName}</span>
                                              , &nbsp;
                                              <i className="ri-user-3-line  fs-5 me-1"></i>
                                              <span>
                                                {service.currentCount}
                                              </span>{" "}
                                              &nbsp; &nbsp;
                                              <i className="ri-time-line fs-5 me-1"></i>
                                              <span>
                                                {service.totalServiceTime} mins
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong className="justify-start">
                                        Selected Barber:
                                      </strong>
                                    </Col>
                                    <Col sm={8}>
                                      <i
                                        className="user ri-user-3-line"
                                        style={{
                                          marginRight: "3px",
                                          color: "grey",
                                          fontSize: "20px",
                                        }}
                                      ></i>
                                      {appointmentData?.selectBarbername}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Selected Date:</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {appointmentData?.selectedDate}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Selected Time :</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {timeSlot(appointmentData?.selectedSlot)}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>First Name:</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {appointmentData?.firstName}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Last Name:</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {appointmentData?.lastName}
                                    </Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Email ID:</strong>
                                    </Col>
                                    <Col sm={8}>{appointmentData?.email}</Col>
                                  </Row>
                                  <Row className="mb-3">
                                    <Col sm={4}>
                                      <strong>Mobile Number:</strong>
                                    </Col>
                                    <Col sm={8}>
                                      {appointmentData?.mobileNumber}
                                    </Col>
                                  </Row>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                  <Row>
                                    {/* Tip Selection Section */}
                                    <Col xs={12}>
                                      <Label className="form-label me-2">
                                        Tip
                                      </Label>
                                      <div className="btn-group d-flex flex-wrap">
                                        {/* None Option */}
                                        <Label
                                          className={`btn btn-outline-primary ${
                                            tipPercentage === 0 ? "active" : ""
                                          } flex-fill text-center`}
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

                                        {/* Percentage Options */}
                                        {[20, 25, 30, 40].map((percentage) => (
                                          <Label
                                            key={percentage}
                                            className={`btn btn-outline-primary ${
                                              tipPercentage == percentage
                                                ? "active"
                                                : ""
                                            } flex-fill text-center`}
                                          >
                                            <Input
                                              type="radio"
                                              name="tip"
                                              value={percentage}
                                              checked={
                                                tipPercentage == percentage
                                              }
                                              onChange={handleTipChange}
                                              className="d-none"
                                            />
                                            {percentage}%
                                          </Label>
                                        ))}

                                        {/* Custom Tip Option */}
                                        <Label
                                          className={`btn btn-outline-primary ${
                                            tipPercentage === "custom"
                                              ? "active"
                                              : ""
                                          } flex-fill text-center`}
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

                                      {/* Custom Tip Input Field */}
                                      {/* {tipPercentage === "custom" && (
                                    <Input
                                      type="number"
                                      placeholder="Enter custom tip"
                                      value={customTip}
                                      onChange={handleCustomTipChange}
                                      className="mt-2 form-control"
                                    />
                                  )} */}

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
                                    </Col>

                                    {/* Total and Final Amount */}
                                    <Col
                                      xs={12}
                                      className="d-flex justify-content-between align-items-center mt-3"
                                    >
                                      <h6 className="m-0">
                                        Total:{" "}
                                        <strong>
                                          ${totalPrice.toFixed(2)}
                                        </strong>
                                      </h6>
                                      <h6 className="m-0">
                                        Final Amount:{" "}
                                        <strong>
                                          ${finalAmount.toFixed(2)}
                                        </strong>
                                      </h6>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                        </TabPane>

                        {/* Succesfully Booking */}
                        <TabPane id="pills-experience" tabId={7}>
                          <div className="text-center">
                            <div className="avatar-md mt-5 mb-4 mx-auto">
                              <div className="avatar-title bg-light text-success display-4 rounded-circle">
                                <i className="ri-checkbox-circle-fill"></i>
                              </div>
                            </div>
                            <h5>Well Done !</h5>
                            <p className="text-muted">
                              Your appointment has been successfully
                              scheduled!!. If you need book another appointment
                              please click here
                            </p>
                            <button
                              type="button"
                              className="btn btn-success btn-label previestab"
                              style={{ marginLeft: "10px" }}
                              onClick={() => {
                                resetData();
                              }}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Book An Appointment
                            </button>
                          </div>
                        </TabPane>
                      </TabContent>
                    </>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default Scheduleappointment;
