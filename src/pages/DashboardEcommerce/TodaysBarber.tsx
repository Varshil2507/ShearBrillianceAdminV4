import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardImg, CardSubtitle, CardText, CardTitle, Col, Row, Spinner } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/material_blue.css"; // Flatpickr theme

import "./section.css";
import { getTodaysBarber } from "Services/BarberSessionService";
import TableContainer from "Components/Common/TableContainer";
import Profile from "../../assets/images/users/avatar-8.jpg";
import Loader from "Components/Common/Loader";

const TodaysBarber = (props: any) => {
  const [salonBarberData, setSalonBarberData] = useState<any>(); // Barbers filtered by selected salon
  const [salonAvailableBarberData, setSalonAvailableBarberData] = useState<any>(); // Barbers filtered by selected salon
  const [salonUnavailableBarberData, setSalonUnavailableBarberData] = useState<any>(); // Barbers filtered by selected salon
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  let authUser = localStorage.getItem("authUser");
  let userRole: any;
  let storeUserInfo: any;
  if (authUser) {
    storeUserInfo = JSON.parse(authUser);
    userRole = storeUserInfo.user.role;
  }

  const getAvailableBarber = async () => {
    try {
      setShowLoader(true);
      //   setIsLoadingBarbers(true); // Start loading
      const response = await getTodaysBarber(); // Fetch barbers
      if (response) {
        setSalonBarberData(response); // Set barber data from API response
        setSalonAvailableBarberData(response.availableBarbers); // Set barber data from API response
        setSalonUnavailableBarberData(response.unavailableBarbers); // Set barber data from API response
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 500); // Hide loader after 5 seconds
        return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes

      } else {
        setSalonBarberData([]); // No barbers found, clear barber data
        setSalonAvailableBarberData([]); // No barbers found, clear barber data
        setSalonUnavailableBarberData([]); // No barbers found, clear barber data
        setShowLoader(false);
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
    getAvailableBarber(); // Fetch barbers when the component mounts
  }, []);

  const formatHours = (timeString: string) => {
    const padZero = (num: number) => String(num).padStart(2, "0");

    // Split the time string into hours, minutes, and seconds
    const [hoursStr, minutesStr] = timeString.split(":");

    let hours = parseInt(hoursStr, 10);
    const minutes = padZero(parseInt(minutesStr, 10));
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    return `${padZero(hours)}:${minutes} ${ampm}`;
  };

  return (
    <React.Fragment>
      <ToastContainer closeButton={false} limit={1} />

      {
        showLoader ? (
          <Loader />
        ) : (
          <Row>
            {/* Available Barbers */}
            <Col md={6}>
              <h5 className="mt-2">Available Barber(s)</h5>
              <hr />
              {showLoader ? (
                <Loader />
              ) : (
                salonAvailableBarberData?.length ? (
                  <div className="gap-3">
                    {salonAvailableBarberData.map((barber: any, index: any) => (
                      <Card key={index} className="p-3 shadow-sm">
                        <CardBody className="d-flex w-100">
                          <CardImg variant="top" src={
                            barber.photo ? barber.photo : Profile
                          } alt={barber.name} className="rounded img-thumbnail me-2" style={{ width: "70px", height: "70px" }} />
                          <div className="w-100">
                            <div className="d-flex justify-content-between w-100">
                              <CardTitle style={{ fontWeight: 600 }}>{barber.name}</CardTitle>
                              <p className="mb-0">
                                <i className="ri-time-line"></i>{" "}
                                {barber?.session?.startTime ? formatHours(barber.session?.startTime) : "N/A"} - {barber?.session?.endTime ? formatHours(barber?.session?.endTime) : 'N/A'}
                              </p>
                            </div>
                            <CardText className="mb-0">Position: {barber.position} </CardText>
                            <CardText className="mb-0">Category: {barber.category === 2 ? 'Walk-In' : 'Appointment'}</CardText>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div style={{ minHeight: "300px" }}>No Available barber data found</div>
                )
              )}
            </Col>

            {/* Unavailable Barbers */}
            <Col md={6}>
              <h5 className="mt-2">Unavailable Barber(s)</h5>
              <hr />
              {salonUnavailableBarberData?.length ? (
                <div className="gap-3">
                  {salonUnavailableBarberData.map((barber: any, index: any) => (
                    <Card key={index} className="p-3 shadow-sm bg-light">
                      <CardBody className="d-flex w-100">
                        <CardImg variant="top" src={
                          barber.photo ? barber.photo : Profile
                        } alt={barber.name} className="rounded img-thumbnail me-2" style={{ width: "70px", height: "70px" }} />
                        <div className="w-100">
                          <div className="d-flex justify-content-between w-100">
                            <CardTitle style={{ fontWeight: 600 }}>{barber.name}</CardTitle>
                            <p className="mb-0">
                              <i className="ri-time-line"></i>{" "}
                              {barber?.session?.startTime ? formatHours(barber.session?.startTime) : "N/A"} - {barber?.session?.endTime ? formatHours(barber?.session?.endTime) : 'N/A'}
                            </p>
                          </div>
                          <CardText className="mb-0">Position: {barber.position} </CardText>
                          <CardText className="mb-0">Category: {barber.category === 2 ? 'Walk-In' : 'Appointment'}</CardText>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div>No Unavailable barber data found</div>
              )}
            </Col>
          </Row>
        )
      }

    </React.Fragment >
  );
};

export default TodaysBarber;