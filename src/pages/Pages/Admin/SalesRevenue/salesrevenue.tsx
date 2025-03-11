import React, { useEffect, useState } from "react";
import { Col, Row, Spinner } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/material_blue.css"; // Flatpickr theme
import Loader from "Components/Common/Loader";
import { generateSalesReport } from "Services/Insalonappointment";
import { fetchBarber, fetchBarberBySalon } from "Services/barberService";
import { fetchSalons } from "Services/SalonService";

const Salesrevenue = () => {
  const [selectedStartDate, setStartDate] = useState<any>(new Date());
  const [selectedEndDate, setEndDate] = useState<any>(new Date());
  const [showLoader, setShowLoader] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [salonData, setSalonData] = useState<any[]>([]); // List of all barbers
  const [salonBarberData, setSalonBarberData] = useState<any[]>([]); // Barbers filtered by selected salon
  const [selectedSalonId, setSelectedSalonId] = useState<any | null>(null); // Selected salon
  const [selectedBarberId, setSelectedBarberId] = useState<any | null>(null); // Selected barber
  // const [barberDisabled, setBarberDisabled] = useState(false);
  const [barberDisabled, setBarberDisabled] = useState(true); // Initially disabled

  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
  let authUser = localStorage.getItem("authUser");
  let userRole: any;
  let storeUserInfo: any;
  if (authUser) {
    storeUserInfo = JSON.parse(authUser);
    userRole = storeUserInfo.user.role;
  }

  // const applyDateFilter = async () => {
  //   setShowSpinner(true);
  //   setShowLoader(true);

  //   try {
  //     const response = await generateSalesReport(
  //       formatDate(selectedStartDate),
  //       formatDate(selectedEndDate),
  //       selectedSalonId === "all" ? undefined : selectedSalonId, // Pass undefined for "All"
  //       // selectedSalonId || undefined, // Pass salonId if selected, else undefined
  //       selectedBarberId || undefined // Pass barberId if selected, else undefined
  //     );

  //     if (response && response.downloadUrl) {
  //       toast.success("PDF sales report generated successfully!");
  //       window.open(response.downloadUrl, "_blank");
  //     } else {
  //       toast.error("Failed to generate PDF report.");
  //     }
  //   } catch (error: any) {
  //     if (error.response?.data?.message) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error(error.message || "Something went wrong");
  //     }
  //   } finally {
  //     setShowSpinner(false);
  //     setShowLoader(false);
  //     setShowDatePicker(false);
  //   }
  // };
  const applyDateFilter = async () => {
    setShowSpinner(true);
    setShowLoader(true);

    try {
      const response = await generateSalesReport(
        formatDate(selectedStartDate),
        formatDate(selectedEndDate),
        selectedSalonId === "all" ? undefined : selectedSalonId, // Pass undefined for "All" salons
        selectedBarberId === "all" ? undefined : selectedBarberId || undefined // Pass undefined for "All" barbers
      );

      if (response && response.downloadUrl) {
        toast.success("PDF sales report generated successfully!");
        window.open(response.downloadUrl, "_blank");
      } else {
        toast.error("Failed to generate PDF report.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setShowSpinner(false);
      setShowLoader(false);
      setShowDatePicker(false);
    }
  };
  const showToast = (message: string) => {
    toast.warning(message); // Display warning toast message
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return ""; // Return an empty string if dateString is invalid
    const date = new Date(dateString);
    // Get the user's current timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: userTimeZone, // Automatically adapts to the user's location
    };

    // Get formatted date
    const formattedDate = new Intl.DateTimeFormat("en-CA", options).format(
      date
    ); // en-CA ensures YYYY-MM-DD format

    // Replace slashes with dashes to ensure YYYY-MM-DD format
    return formattedDate.replace(/\//g, "-");
  };
  //  const userRole = localStorage.getItem("userRole");
  //   let storeRoleInfo: any;
  //   if (userRole) {
  //     storeRoleInfo = JSON.parse(userRole);
  //   }
  useEffect(() => {
    if (userRole?.role_name !== "Salon Manager") {
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
            toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
          } else {
            // Fallback for other types of errors
            toast.error(error.message || "Something went wrong");
          }
        }
      };
      fetchAllData();
    }
  }, []);

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
        toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        toast.error(error.message || "Something went wrong");
      }
      setSalonBarberData([]); // Clear barber data in case of error
    }
  };

  useEffect(() => {
    if (storeUserInfo.berber) {
      setSelectedSalonId(storeUserInfo.berber.SalonId);
      setSelectedBarberId(storeUserInfo.berber.id);
      // setTimeout(() => {
      //   applyDateFilter(
      //     storeUserInfo.berber.SalonId,
      //     storeUserInfo.berber.id
      //   );
      // }, 500);
    }
    if (storeUserInfo.salon && userRole?.role_name === "Salon Manager") {
      setSelectedSalonId(storeUserInfo.salon.id);
      getSalonBabrer(storeUserInfo.salon.id);
    }
  }, []);

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
        console.error("Error fetching barbers:", error);
        toast.error("Failed to fetch barbers.");
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
          <div className="d-flex justify-content-end align-items-lg-center flex-lg-row flex-column">
            {userRole?.role_name === "Admin" ||
            userRole?.role_name === "Salon Manager" ? (
              <div className="mt-3 mt-lg-0">
                <div className="d-flex justify-content-between align-items-center col-auto p-2 bg-light">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0 me-2">
                    Generate Sales Report
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
            ) : null}
          </div>

          {showDatePicker && (
            <div className="row align-items-center mt-3 g-2">
              {/* Salon Dropdown */}
              {!storeUserInfo.berber && !storeUserInfo.salon && (
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
              <div
                className={
                  !storeUserInfo.salon
                    ? "col-sm-3 col-3"
                    : "col-sm-6 col-md-6 col-lg-6 col-xl-9 col-xxl-6 col-8"
                }
              >
                
                <select
                  value={selectedBarberId}
                  onChange={handleBarberChange}
                  disabled={
                    !selectedSalonId ||
                    isLoadingBarbers &&
                    (userRole?.role_name !== "Salon Manager" || userRole?.role_name !== "Admin")
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
                    <Spinner size="sm" />
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

          <ToastContainer closeButton={false} limit={1} />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Salesrevenue;
