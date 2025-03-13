import React, { useEffect, useState } from "react";
import { Col, Row, Spinner } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/material_blue.css"; // Flatpickr theme

import "./section.css";
import { getTodaysBarber } from "Services/BarberSessionService";

const TodaysBarber = (props: any) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [salonBarberData, setSalonBarberData] = useState<any[]>([]); // Barbers filtered by selected salon
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);

  let authUser = localStorage.getItem("authUser");
  let userRole: any;
  let storeUserInfo: any;
  if (authUser) {
    storeUserInfo = JSON.parse(authUser);
    userRole = storeUserInfo.user.role;
  }

  const getAvailableBarber = async () => {
    try {
    //   setIsLoadingBarbers(true); // Start loading
      const response = await getTodaysBarber(); // Fetch barbers
      if (response && response.data) {
        setSalonBarberData(response); // Set barber data from API response
      } else {
        setSalonBarberData([]); // No barbers found, clear barber data
      }
    } catch (error: any) {
      console.error("Error fetching barbers:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "An error occurred");
      } else {
        toast.error(error.message || "Something went wrong");
      }
      setSalonBarberData([]); // Clear barber data in case of error
    } finally {
      setIsLoadingBarbers(false); // Stop loading
    }
  };

  useEffect(() => {
    if (userRole?.role_name === "Salon Manager") {
      getAvailableBarber(); // Fetch barbers when the component mounts
    }
  }, [userRole]);

  return (
    <React.Fragment>
      <Row className="pb-1">
        <Col xs={12}>
          <div className="d-flex align-items-lg-center flex-lg-row flex-column">
            {userRole?.role_name === "Salon Manager" ||
            userRole?.role_name === "Salon Manager" ? (
              <div className="">
                <div className="d-flex justify-content-between align-items-center col-auto p-2 bg-light">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0 me-2">
                    Today's Barber List
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
            <Row className="pb-1">
              <Col xs={12}>
                <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                  {userRole?.role_name === "Salon Manager" && ( // Only for Salon Manager
                    <div className="">
                      <div className="d-flex justify-content-between align-items-center col-auto p-2 bg-light">
                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0 me-2">
                          Available Barbers in Your Salon
                        </p>
                        <button
                          type="button"
                          className="btn btn-soft-info btn-icon waves-effect waves-light"
                          title="Refresh List"
                          aria-label="Refresh List"
                          onClick={getAvailableBarber} // Refresh barber list
                        >
                          <i className="ri-refresh-line"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Barbers List */}
                {userRole?.role_name === "Salon Manager" && ( // Only for Salon Manager
                  <div className="mt-3">
                    {isLoadingBarbers ? (
                      <div className="col-12 text-center">
                        <Spinner size="sm" /> Loading barbers...
                      </div>
                    ) : (
                      <div className="row">
                        {salonBarberData
                          .filter((barber) => barber.isAvailable) // Filter available barbers
                          .map((barber) => (
                            <div
                              key={barber.id}
                              className="col-lg-3 col-md-4 col-sm-6 mb-3"
                            >
                              <div className="card">
                                <div className="card-body">
                                  <h6 className="card-title">{barber.name}</h6>
                                  <p className="card-text text-muted">
                                    {barber.specialization || "Barber"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}

                        {salonBarberData.filter((barber) => barber.isAvailable)
                          .length === 0 && (
                          <div className="col-12 text-center text-muted">
                            No available barbers at the moment.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <ToastContainer closeButton={false} limit={1} />
              </Col>
            </Row>
          )}
          <ToastContainer closeButton={false} limit={1} />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default TodaysBarber;