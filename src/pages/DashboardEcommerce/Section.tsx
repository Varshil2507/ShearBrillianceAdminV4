import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // Flatpickr theme
import { generatereport } from "Services/Insalonappointment";
import "./section.css";
import { fetchSalons } from "Services/SalonService";
import { fetchBarber, fetchBarberBySalon } from "Services/barberService";
import TodaysBarber from "./TodaysBarber";
import { formatDate } from "Components/Common/DateUtil";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "slices/layouts/toastService";
import { ROLES } from "common/data/Constants";

const Section = (props: any) => {
  const [greeting, setGreeting] = useState("");
  const [selectedStartDate, setStartDate] = useState<any>(new Date());
  const [selectedEndDate, setEndDate] = useState<any>(new Date());
  const [showLoader, setShowLoader] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isShowBarberModal, setIsShowBarberModal] = useState<boolean>(false);
  const [selectedSalonInfo, setSelectedSalonInfo] = useState<any | null>(null); // Selected salon

  const [salonData, setSalonData] = useState<any[]>([]); // List of all barbers
  const [salonBarberData, setSalonBarberData] = useState<any[]>([]); // Barbers filtered by selected salon
  const [selectedSalonId, setSelectedSalonId] = useState<any | null>(null); // Selected salon
  const [selectedBarberId, setSelectedBarberId] = useState<any | null>(null); // Selected barber
  const [barberDisabled, setBarberDisabled] = useState(true);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };
  const [rightColumn, setRightColumn] = useState<boolean>(true);

  let authUser = localStorage.getItem("authUser");
  let userRole: any;
  let storeUserInfo: any;
  if (authUser) {
    storeUserInfo = JSON.parse(authUser);
    userRole = storeUserInfo.user.role;
  }

  let salonDetails = localStorage.getItem("salonDetails");
  let storesalonDetailInfo: any;
  if (salonDetails) {
    storesalonDetailInfo = JSON.parse(salonDetails);
  }
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good Morning");
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting("Good Afternoon");
      } else if (currentHour >= 17 && currentHour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const applyDateFilter = async () => {
    setShowSpinner(true);
    setShowLoader(true);

    try {
      const response = await generatereport(
        formatDate(selectedStartDate),
        formatDate(selectedEndDate),
        selectedSalonId === "all" ? undefined : selectedSalonId, // Pass undefined for "All" salons
        selectedBarberId === "all" ? undefined : selectedBarberId || undefined // Pass undefined for "All" barbers
      );

      if (response && response.downloadLink) {
        showSuccessToast("PDF sales report generated successfully!");
        window.open(response.downloadLink, "_blank");
      } else {
        showErrorToast("Failed to generate PDF report.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        showErrorToast(error.response.data.message);
      } else {
        showErrorToast(error.message || "Something went wrong");
      }
    } finally {
      setShowSpinner(false);
      setShowLoader(false);
      setShowDatePicker(false);
    }
  };

  const showBarber = async () => {
    setIsShowBarberModal(true);
  };
  const showToast = (message: string) => {
    showWarningToast(message); // Display warning toast message
  };
  useEffect(() => {
    if (!storesalonDetailInfo) {
    if (
      userRole?.role_name !== ROLES.SALON_MANAGER &&
      userRole?.role_name !== ROLES.SALON_OWNER && !storesalonDetailInfo
    ) {
      const fetchAllData = async () => {
        try {
          // Fetch both salons and barbers data in parallel
          const [salonsResponse] = await Promise.all([
            fetchSalons(1, null, null),
          ]);
          // Set the fetched data to the respective states
          setSalonData(salonsResponse?.salons || []);
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

      fetchAllData();
    }
  }
  }, []);

  // const formatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid
  //   const date = new Date(dateString);
  //   // Get the user's current timezone
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //   const options: Intl.DateTimeFormatOptions = {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     timeZone: userTimeZone, // Automatically adapts to the user's location
  //   };

  //   // Get formatted date
  //   const formattedDate = new Intl.DateTimeFormat("en-CA", options).format(
  //     date
  //   ); // en-CA ensures YYYY-MM-DD format

  //   // Replace slashes with dashes to ensure YYYY-MM-DD format
  //   return formattedDate.replace(/\//g, "-");
  // };
  const getSalonBabrer = async (salonId: any) => {
    try {
      // Fetch barbers for the selected salon
      const barberResponse = await fetchBarberBySalon(salonId, null);
      // Check if the barberResponse itself has data or is not empty
      if (barberResponse && barberResponse.length > 0) {
        const barbers = barberResponse; // Assuming the response is directly the list of barbers
        setSalonBarberData(barbers); // Update barber data
      } else {
        setSalonBarberData([]); // No barbers found, clear barber data
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
      setSalonBarberData([]); // Clear barber data in case of error
    }
  };

  useEffect(() => {
    if ((storeUserInfo.salon && userRole?.role_name === ROLES.SALON_MANAGER) || storesalonDetailInfo) {
        setSelectedSalonId(storesalonDetailInfo ? storesalonDetailInfo.id : storeUserInfo.salon.id);
        setSelectedSalonInfo(storesalonDetailInfo ? storesalonDetailInfo.id : storeUserInfo.salon);
        getSalonBabrer(storesalonDetailInfo ? storesalonDetailInfo.id : storeUserInfo.salon.id);
    }
}, [])

  const handleSalonChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    const salonId =
      selectedValue === "all"
        ? "all"
        : selectedValue
        ? Number(selectedValue)
        : null;

    setSelectedSalonId(salonId);

    if (salonId === "all") {
      // If "All" salons selected, set barber dropdown to "All" and disable it
      setSalonBarberData([]); // Clear barbers list
      setSelectedBarberId("all"); // Auto-select "All"
      setBarberDisabled(true); // Disable barber dropdown
      setIsLoadingBarbers(false); // No loading for "All"
    } else if (salonId !== null) {
      // Fetch barbers for the selected salon
      setBarberDisabled(false); // Enable barber dropdown
      setSelectedBarberId(""); // Reset to "Select Barber"
      setIsLoadingBarbers(true); // Show spinner while loading barbers
      try {
        await getSalonBabrer(salonId); // Fetch barbers
      } catch (error) {
        // console.error("Error fetching barbers:", error);
        showErrorToast("Failed to fetch barbers.");
      } finally {
        setIsLoadingBarbers(false); // Hide spinner after fetching
      }
    } else {
      // If no salon is selected, reset barber dropdown
      setSalonBarberData([]);
      setSelectedBarberId(""); // Ensure it shows "Select Barber"
      setBarberDisabled(false);
      setIsLoadingBarbers(false); // No loading
    }
  };

  const handleBarberChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const barberId = event.target.value;
    setSelectedBarberId(barberId);
  };
  return (
    <React.Fragment>
      <Row className="mb-3 pb-1">
        <Col xs={12}>
          <div className="d-flex align-items-lg-center flex-lg-row flex-column">
            <div className="flex-grow-1">
              <h4 className="fs-16 mb-1">
                {greeting}, {userRole?.role_name}!
              </h4>
              <p className="text-muted mb-0">
                Tracking your salon’s story from day one!
              </p>
            </div>
            {(userRole?.role_name === ROLES.ADMIN ||
              userRole?.role_name === ROLES.SALON_MANAGER) && (
              <div className="mt-3 mt-lg-0 d-flex flex-wrap align-items-center justify-center gap-2">
                {userRole?.role_name === ROLES.SALON_MANAGER && (
                  <div className="d-flex flex-wrap justify-content-between align-items-center col-auto p-2 bg-light">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0 me-2">
                      Today's Available Barber
                    </p>
                    <button
                      type="button"
                      className="btn btn-soft-info btn-icon waves-effect waves-light"
                      onClick={() => showBarber()}
                      title="Select Date Range"
                      aria-label="Select Date Range"
                    >
                      <i className="ri-file-list-line"></i>
                    </button>
                  </div>
                )}

                {/* Show Generate Report only for ADMIN and SALON_MANAGER */}
                <div className="d-flex justify-content-between align-items-center col-auto p-2 bg-light">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0 me-2">
                    Generate Report
                  </p>
                  <button
                    type="button"
                    className="btn btn-soft-info btn-icon waves-effect waves-light"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    title="Select Date Range"
                    aria-label="Select Date Range"
                  >
                    <i className="ri-download-line"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {showDatePicker && (
            <div className="row align-items-center mt-3 g-2">
              {/* Salon Dropdown */}
              {!storesalonDetailInfo && !storeUserInfo.barber && !storeUserInfo.salon && (

                <div className="col-lg-3 col-md-6 col-sm-6">
                  <select
                    id="salonSelect"
                    className="form-select"
                    value={
                      selectedSalonId === "all"
                        ? "all"
                        : selectedSalonId !== null
                        ? selectedSalonId
                        : ""
                    }
                    onChange={handleSalonChange}
                  >
                    <option value="" disabled>
                      Select Salon
                    </option>
                    <option value="all">All</option>{" "}
                    {/* Use "all" as the value */}
                    {salonData.length > 0 ? (
                      salonData.map((salon: any) => (
                        <option key={salon.salon.id} value={salon.salon.id}>
                          {salon.salon.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No salons available
                      </option>
                    )}
                  </select>
                </div>
              )}

              {/* Barber Dropdown */}
              <div className="col-lg-3 col-md-6 col-sm-6 position-relative">
                <select
                  value={selectedBarberId}
                  onChange={handleBarberChange}
                  // disabled={
                  //   barberDisabled ||
                  //   isLoadingBarbers ||
                  //   userRole?.role_name !== ROLES.SALON_MANAGER
                  // } // Disable dropdown while loading
                  disabled={
                    !selectedSalonId ||
                    (isLoadingBarbers &&
                      (userRole?.role_name !== ROLES.SALON_MANAGER ||
                        userRole?.role_name !== ROLES.ADMIN))
                  } // Disable barber dropdown if no salon is selected
                  id="barberSelect"
                  className="form-select"
                >
                  {isLoadingBarbers ? (
                    <option value="" disabled>
                      Loading barbers...
                    </option>
                  ) : (
                    <>
                      <option value="">Select Barber</option>
                      <option value="all">All</option>
                      {salonBarberData.map((barber) => (
                        <option key={barber.id} value={barber.id}>
                          {barber.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>

                {/* Inline Spinner */}
                {isLoadingBarbers && (
                  <div
                    className="position-absolute"
                    style={{
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <Spinner size="sm" /> {/* Show spinner while loading */}
                  </div>
                )}
              </div>

              {/* Start Date Picker */}
              <div className="col-lg-3 col-md-6 col-sm-6">
                <Flatpickr
                  className="form-control"
                  value={selectedStartDate}
                  onChange={(dates: any) => setStartDate(dates[0])}
                  options={{ dateFormat: "Y-m-d", maxDate: new Date() }}
                  placeholder="Select Start Date"
                />
              </div>

              {/* End Date Picker + Apply Button */}
              <div className="col-lg-3 col-md-6 col-sm-6 d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  <Flatpickr
                    className="form-control"
                    value={selectedEndDate}
                    onChange={(dates: any) => {
                      const selectedEnd = dates[0];
                      if (selectedEnd && selectedEnd < selectedStartDate) {
                        showToast("End Date cannot be before Start Date!");
                        return;
                      }
                      setEndDate(selectedEnd);
                    }}
                    options={{
                      dateFormat: "Y-m-d",
                      minDate: selectedStartDate,
                      maxDate: new Date(),
                    }}
                    placeholder="Select End Date"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={applyDateFilter}
                  disabled={showSpinner}
                  style={{ whiteSpace: "nowrap" }} // Prevents button text from wrapping
                >
                  {showSpinner && (
                    <Spinner size="sm" className="me-2">
                      Loading...
                    </Spinner>
                  )}
                  Apply
                </button>
              </div>
            </div>
          )}
        </Col>
      </Row>
      {storeUserInfo.salon &&
        (userRole?.role_name === ROLES.SALON_MANAGER ||
          userRole?.role_name === ROLES.SALON_OWNER) && (
          <Modal
            isOpen={isShowBarberModal}
            toggle={() => setIsShowBarberModal(!isShowBarberModal)}
            centered
            backdrop="static"
            size="xl"
          >
            <ModalHeader
              toggle={() => setIsShowBarberModal(!isShowBarberModal)}
            >
              Today's Barber(s) Status
            </ModalHeader>
            <ModalBody className="modal-body">
              <TodaysBarber rightClickBtn={toggleRightColumn} />
            </ModalBody>
            <div className="modal-footer">
              <div className="gap-2 hstack justify-content-end w-100">
                <div className="hstack gap-2 justify-content-end">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsShowBarberModal(false);
                    }}
                    className="btn-light"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
    </React.Fragment>
  );
};

export default Section;
