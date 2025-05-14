import React, { useState, useEffect, useMemo, useCallback } from "react";

//redux
import {
  Col,
  Modal,
  ModalBody,
  Row,
  Label,
  Button,
  ModalHeader,
  Form,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "reactstrap";

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

import Loader from "../../../../Components/Common/Loader";

import { fetchBarber } from "Services/barberService";
import { fetchBarberSession } from "Services/BarberSessionService";
import { fetchSalons } from "Services/SalonService";
import { formatHours, formatTime } from "Components/Common/DateUtil";
import { showErrorToast, showWarningToast } from "slices/layouts/toastService";
import { ROLES } from "common/data/Constants";
import BarberAppointmentList from "./BarberAppointmentList";

const BarberAppointmentTable: React.FC = () => {
  const [barberSessionsData, setBarberSessionsData] = useState<any>(null);

  const [barberData, setBarberData] = useState<Barber[]>([]);
  const [salonBarberData, setSalonBarberData] = useState<any>([]);

  const [salonData, setSalonData] = useState<Salon[]>([]);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const [showLoader, setShowLoader] = useState(true);
  const [existBarber, setExistBarber] = useState(true);

  const [newBarberSession, setNewBarberSession] =
    useState<BarberSessions | null>(null);

  // Delete Task
  const [modal, setModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);

  const userCategory = localStorage.getItem("userCategory");
  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setNewBarberSession(null);
      setShowSpinner(false);
    } else {
      setModal(true);
    }
  }, [modal]);

  interface Salon {
    salon_id: number;
    salon_name: string;
    availability_status: string; // Field for availability status
    photos: number; // Field for default service time
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
    created_date: string;
    barber?: object; // Add this line
  }

  // Define the Barber type based on your database structure
  interface Barber {
    id: number;
    name: string;
    firstname: string; // Add this line
    lastname: string; // Add this line
    mobile_number: string; // Add this line
    email: string; // Add this line
    address: string;
    password: string; // Add password field
    availability_status: string; // Field for availability status
    default_service_time: number; // Field for default service time
    profile_photo: string; // Fixed typo here
    cutting_since?: string; // Add this line
    organization_join_date?: string; // Add this line
    SalonId: number; // Add this line
    // salon: object | null; // Add this line
  }


  useEffect(() => {
    getBarberSessionsData();
    const fetchBarbersList = async () => {
      try {
        const response: any = await fetchBarber(1, 100, null);
        const activeBarber = response.barbers.filter(
          (bar: any) => bar.availability_status === "available"
        );
        setBarberData(activeBarber);
        if (storeRoleInfo.role_name !== ROLES.ADMIN) {
          setSalonBarberData(response.barbers);
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

    fetchBarbersList();

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
  }, []);

  // Accordions with Plus Icon
  const [openPlusIcon, setOpenPlusIcon] = useState("");
  const togglePlusIcon = (id: any) => {
    setOpenPlusIcon(openPlusIcon === id ? "" : id);
  };


  const parseTime = (time: any) => {
    if (!time) return null;
    const [hour, minute] = time.split(":").map(Number); // Assuming 'time' is in 'HH:mm' format
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const getBarberSessionsData = async () => {
    try {
      const response: any = await fetchBarberSession();
      if (response?.length > 0) {
        const tempData = response.map((info: any) => {
          const openTime: any = info ? parseTime(info.salon.open_time) : null;
          const closeTime: any = info ? parseTime(info.salon.close_time) : null;
          info.salon.open_time_temp = openTime;
          info.salon.close_time_temp = closeTime;
          const salonStartTimeAMPM = info
            ? formatTime(info.salon.open_time)
            : null;
          const salonCloseTimeAMPM = info
            ? formatTime(info.salon.close_time)
            : null;
          info.startTimeAMPM = salonStartTimeAMPM;
          info.closeTimeAMPM = salonCloseTimeAMPM;
          return info;
        });
        setBarberSessionsData(tempData);
      } else {
        setBarberSessionsData(response);
      }
      if (barberSessionsData?.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 5000); // Hide loader after 5 seconds
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

  // validation
 




  return (
    <React.Fragment>
      <div className="row">
        <Col lg={12}>
          <div className="card" id="tasksList">
            <div className="card-header border-0">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">
                  Barber Appointments
                </h5>
                <b className="text-danger">
                  Unavailable barber not shown in the schedule
                </b>
                <div className="flex-shrink-0">
                
                </div>
              </div>
            </div>

            <div className="card-body pt-3">
              {showLoader ? (
                <Loader />
              ) : (
                <Accordion
                  className="custom-accordionwithicon-plus"
                  id="accordionWithplusicon"
                  open={openPlusIcon}
                  toggle={togglePlusIcon}
                >
                  {barberSessionsData?.length > 0 ? (
                    barberSessionsData.map((salonName: any, index: any) => (
                      <AccordionItem key={`salon-${index}`}>
                        <AccordionHeader targetId={String(index)}>
                          <h4 className="m-0 d-flex justify-content-between align-items-center">
                            {salonName.salon.name}
                            <span className="badge text-success">
                              ({salonName.barbers.length} Barbers)
                            </span>
                            <span className="badge text-primary">
                              ({salonName.startTimeAMPM} -{" "}
                              {salonName.closeTimeAMPM})
                            </span>
                          </h4>
                        </AccordionHeader>
                        <AccordionBody accordionId={String(index)}>
                          <BarberAppointmentList
                            salonNames={salonName}
                            onReload={getBarberSessionsData}
                          ></BarberAppointmentList>
                        </AccordionBody>
                      </AccordionItem>
                    ))
                  ) : (
                    <div className="text-center py-3 w-100">
                      No schedule data available for this week
                    </div>
                  )}
                </Accordion>
               
              )}
            </div>
          </div>
        </Col>
      </div>

    </React.Fragment>
  );
};

export default BarberAppointmentTable;
