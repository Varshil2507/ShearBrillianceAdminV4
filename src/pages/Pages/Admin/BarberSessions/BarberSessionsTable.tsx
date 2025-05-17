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
import BarberScheduleList from "./BarberScheduleList";
import { formatHours, formatTime } from "Components/Common/DateUtil";
import { showErrorToast, showWarningToast } from "slices/layouts/toastService";
import { ROLES } from "common/data/Constants";

const BarberSessionsTable: React.FC = () => {
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
  let salonDetails = localStorage.getItem("salonDetails");
  let storesalonDetailInfo: any;
  if (salonDetails) {
    storesalonDetailInfo = JSON.parse(salonDetails);
  }
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setNewBarberSession(null);
      formik.resetForm();
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
    if (!storesalonDetailInfo) {
      if (storeRoleInfo?.role_name !== ROLES.SALON_MANAGER && storeRoleInfo?.role_name !== ROLES.SALON_OWNER) {
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
    }
  }, []);

  // Accordions with Plus Icon
  const [openPlusIcon, setOpenPlusIcon] = useState("");
  const togglePlusIcon = (id: any) => {
    setOpenPlusIcon(openPlusIcon === id ? "" : id);
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

  // Convert time string "HH:mm" to a Date object for proper comparison
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
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: newBarberSession?.id ? newBarberSession?.id : 0,
      SalonId: newBarberSession?.SalonId ? newBarberSession?.SalonId : 0,
      BarberId: newBarberSession?.BarberId ? newBarberSession?.BarberId : 0,
      start_time: newBarberSession?.start_time
        ? newBarberSession?.start_time
        : "",
      end_time: newBarberSession?.end_time ? newBarberSession?.end_time : "",
      created_date: newBarberSession?.created_date
        ? newBarberSession?.created_date
        : "",
    },
    validationSchema: Yup.object({
      SalonId:
        storeRoleInfo?.role_name === ROLES.ADMIN
          ? Yup.number()
          : Yup.number().required("Salon is required"), // Add this line
      BarberId:
        userCategory === ROLES.WALKIN_BARBER ||
          userCategory === ROLES.APPOINTMENT_BARBER
          ? Yup.number()
          : Yup.number().required("Barber is required"), // Add this line
    }),
    onSubmit: (values) => {
      setShowSpinner(true);
      // // const selectedSchedule = weeks.flat().filter((day) => day.available);
      // // const processedValues = {
      // //   ...values,
      // // };
      // // const obj = {
      // //   BarberId: values.BarberId,
      // //   SalonId: values.SalonId,
      // //   availableDays: [] as AvailableDay[]
      // // };

      // // selectedSchedule.map((day: Day) => {
      // //   const availableObj: AvailableDay = {
      // //     startTime: day.startTime,
      // //     endTime: day.endTime,
      // //     date: day.date
      // //   };
      // //   obj.availableDays.push(availableObj);
      // // })
      // if (isEditing) {
      //   updateBarberSession(values.id, processedValues).then((response) => {
      //     showSuccessToast("Barber schedule updated successfully", {
      //       autoClose: 2000,
      //     });
      //     getBarberSessionsData();
      //     setShowSpinner(false);
      //     toggle();
      //   })
      //     .catch((error) => {
      //       console.error("Error updating Barber schedule:", error);
      //     });
      // } else {
      //   addBarberSession(obj)
      //     .then((response) => {
      //       showSuccessToast("Barber schedule created successfully", {
      //         autoClose: 2000,
      //       });
      //       getBarberSessionsData();
      //       setShowSpinner(false);
      //       toggle();
      //     })
      //     .catch((error) => {
      //       console.error("Error creating Barber schedule:", error);
      //     });
      // }
    },
  });

  const columns = useMemo(
    () => [
      {
        header: "Salon Name",
        accessorKey: "barber.salon.name",
        enableColumnFilter: false,
      },
      {
        header: "Barber Name",
        accessorKey: "barber.name",
        cell: (cell: any) => {
          return cell?.getValue() ? cell?.getValue() : "Unknown"; // Fallback if the barber is not found
        },
        enableColumnFilter: false,
      },
      {
        header: "Available Time",
        accessorKey: "availabe_time",
        enableColumnFilter: false,
        cell: ({
          row,
        }: {
          row: { original: { start_time: string; end_time: string } };
        }) => {
          const { start_time, end_time } = row.original; // Access start_time and end_time
          return `${start_time ? formatHours(start_time) : "null"} - ${end_time ? formatHours(end_time) : "null"
            }`; // Combine and display
        },
      },
      {
        header: "Actions",
        accessorKey: "actions",
        enableColumnFilter: false,
        cell: (cell: { row: { original: BarberSessions } }) => (
          <div>
            <i
              className="ri-edit-2-fill"
              style={{
                cursor: "pointer",
                marginRight: "20px",
                color: "grey",
                fontSize: "20px",
              }}
              onClick={() => handleEdit(cell.row.original)}
            ></i>
            {/*<i
              className="ri-delete-bin-fill"
              style={{ cursor: "pointer", color: "grey", fontSize: "20px" }}
              onClick={() => onClickDelete(cell.row.original)} // Call the delete function
            />*/}
          </div>
        ),
      },
    ],
    [barberSessionsData]
  );

  const handleEdit = (info: BarberSessions) => {
    if (info.SalonId) {
      const filterBarber = barberData.filter(
        (sal: any) => sal.SalonId === info.SalonId
      );
      setSalonBarberData(filterBarber);
      setExistBarber(false);
    }
    setNewBarberSession(info);
    setIsEditing(true); // Toggle edit mode
    setModal(true);
  };

  const handleSalonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      const salonId = Number(event.target.value);
      setSelectedSalonId(salonId);
      formik.setFieldValue("SalonId", salonId);
      const filterBarber = barberData.filter(
        (sal: any) => sal.SalonId === salonId
      );
      setSalonBarberData(filterBarber);
      // const selectedSalonData = salonData.find(
      //   (salon) => salon.salon_id === salonId
      // );
      // setSelectedSalon(selectedSalonData || null);
    }
  };

  const handleBarberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value) {
      const selectedBarberId = Number(event.target.value);
      if (barberSessionsData?.length > 0) {
        const findBarberId = (data: any, barberId: number) => {
          for (const salon of data) {
            const barber = salon.barbers.find(
              (barberObj: any) => barberObj.barber.id === barberId
            );
            if (barber) {
              return barber.barber.id; // Return the barber's id
            }
          }
          return null; // Return null if not found
        };

        const barberId = findBarberId(barberSessionsData, selectedBarberId);
        // const barberInfo = barberSessionsData.find((barbr: any) => barbr.BarberId === barberId);
        if (barberId && !isEditing) {
          setExistBarber(true);
          showWarningToast("Barber schedule already exist!!!", {
            autoClose: 3000,
          });
        } else {
          setExistBarber(false);
          setSelectedBarberId(selectedBarberId);
          formik.setFieldValue("BarberId", selectedBarberId);
        }
      } else {
        setExistBarber(false);
        setSelectedBarberId(selectedBarberId);
        formik.setFieldValue("BarberId", selectedBarberId);
      }
      // const selectedSalonData = salonData.find(
      //   (salon) => salon.salon_id === salonId
      // );
      // setSelectedSalon(selectedSalonData || null);
    }
  };

  // Helper to compare times
  const isTimeAfter = (time1: any, time2: any) => {
    const t1 = new Date(`1970-01-01T${time1}`);
    const t2 = new Date(`1970-01-01T${time2}`);
    return t1 > t2;
  };

  return (
    <React.Fragment>
      <div className="row">
        <Col lg={12}>
          <div className="card" id="tasksList">
            <div className="card-header border-0">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">
                  Barber Schedules
                </h5>
                <b className="text-danger">
                  Unavailable barber not shown in the schedule
                </b>
                <div className="flex-shrink-0">
                  {/* {(isCurrentWeekDay(today.getDate().toString()) || isSunday()) && ( */}
                  {/* <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-primary add-btn me-1"
                        onClick={() => {
                          toggle();
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i> Create
                        Barber Schedule
                      </button>

                    </div> */}
                  {/* )} */}
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
                          <BarberScheduleList
                            salonNames={salonName}
                            onReload={getBarberSessionsData}
                          ></BarberScheduleList>
                        </AccordionBody>
                      </AccordionItem>
                    ))
                  ) : (
                    <div className="text-center py-3 w-100">
                      No schedule data available for this week
                    </div>
                  )}
                </Accordion>
                // <TableContainer
                //   columns={columns}
                //   data={barberSessionsData || []}
                //   isGlobalFilter={false}
                //   customPageSize={limit}
                //   divClass="table-responsive table-card mb-3"
                //   tableClass="align-middle table-nowrap mb-0"
                //   theadClass="table-light text-muted"
                //   SearchPlaceholder="Search by barber, salon or name"
                // />
              )}
            </div>
          </div>
        </Col>
      </div>

      <Modal
        isOpen={modal}
        toggle={toggle}
        centered
        backdrop="static"
        size="lg"
      >
        <ModalHeader toggle={toggle}>
          {isEditing ? "Update Barber Schedule" : "Barber Schedule"}
        </ModalHeader>
        <Form className="tablelist-form" onSubmit={formik.handleSubmit}>
          <ModalBody className="modal-body">
            <Row className="g-3">
              {(storeRoleInfo.role_name === ROLES.ADMIN ||
                storeRoleInfo.role_name === ROLES.SALON_MANAGER) && (
                  <Col lg={6}>
                    <div>
                      <Label htmlFor="salon" className="form-label">
                        Salon Name
                      </Label>
                      <select
                        className="form-select"
                        value={formik.values.SalonId}
                        onChange={handleSalonChange}
                      >
                        <option value="">Select a salon</option>
                        {salonData?.map((salon) => (
                          <option key={salon.salon_id} value={salon.salon_id}>
                            {salon.salon_name}
                          </option>
                        ))}
                      </select>
                      {formik.touched.SalonId && formik.errors.SalonId && (
                        <div className="invalid-feedback">
                          {formik.errors.SalonId}
                        </div>
                      )}
                    </div>
                  </Col>
                )}
              {/* Barber ID */}
              {(storeRoleInfo.role_name === ROLES.ADMIN ||
                storeRoleInfo.role_name === ROLES.SALON_MANAGER) && (
                  <Col lg={6}>
                    <div>
                      <Label htmlFor="salon" className="form-label">
                        Barber Name
                      </Label>
                      <select
                        className="form-select"
                        value={formik.values.BarberId}
                        onChange={handleBarberChange}
                      >
                        <option value="">Select a barber</option>
                        {salonBarberData.map((barber: any) => (
                          <option key={barber.id} value={barber.id}>
                            {barber.name}
                          </option>
                        ))}
                      </select>
                      {formik.touched.BarberId && formik.errors.BarberId && (
                        <div className="invalid-feedback">
                          {formik.errors.BarberId}
                        </div>
                      )}
                    </div>
                  </Col>
                )}
            </Row>
            <Row className="mt-3 g-3"></Row>
          </ModalBody>
          <div className="modal-footer">
            <div className="gap-2 hstack justify-content-between w-100">
              {/* <Button type="button" className="btn-primary" onClick={addNextWeek}>
                Add Next Week
              </Button> */}
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
                  disabled={showSpinner || existBarber} // Disable button when loader is active
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
    </React.Fragment>
  );
};

export default BarberSessionsTable;
