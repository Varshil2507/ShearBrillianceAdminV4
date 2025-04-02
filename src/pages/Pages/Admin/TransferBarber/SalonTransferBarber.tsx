import React, { useEffect, useState } from "react";
import Loader from "Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchBarber, updateBarberCategory } from "Services/barberService";
import AppointmentConfirmationModal from "Components/Common/AppointmentStatusChange";

type CategoryKey = "walkIn" | "schedule";

type Barber = {
  id: string;
  name: string;
  color: string;
};

type Salon = {
  salon: {
    id: number;
    name: string;
  };
  categories: {
    walkIn: Barber[];
    schedule: Barber[];
  };
  initialLoader: boolean;
};
export const REQUESTED_LEAVES_ENDPOINT = "/requested-leaves";

const SalonTransferBarber: React.FC = () => {
  const [barberData, setBarberData] = useState<Barber[]>([]);
  const [salonBarberData, setSalonBarberData] = useState<Salon[]>([]);
  const [showLoader, setShowLoader] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<any>();
  const [selectedBarberCategory, setSelectedBarberCategory] = useState<any>();
  const [selectedSoruceCategory, setSelectedSoruceCategory] = useState<any>();

  useEffect(() => {
    fetchBarbersList(1, null);
  }, []);

  const fetchBarbersList = async (page: any, search: any) => {
    try {
      const response: any = await fetchBarber(
        page === 0 ? 1 : page,
        null,
        search ?? null
      );
      const availableBarbers = response.barbers.filter(
        (barber: any) => barber.availability_status === "available"
      );
      const barbers = availableBarbers.map((barber: any) => {
        return {
          ...barber,
          displayName: `${barber.name} (${barber.availability_status})`,
        };
      });
      setBarberData(barbers);
      const transferData: any[] = transformData(barbers);
      setSalonBarberData(transferData);

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
        toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const transformData = (data: any) => {
    const salons: any = {};

    data.forEach((barber: any) => {
      const salonId = barber.salon.id;
      const category = barber.category === 2 ? "walkIn" : "schedule";

      if (!salons[salonId]) {
        salons[salonId] = {
          salon: { id: barber.salon.id, name: barber.salon.name },
          categories: {
            walkIn: [],
            schedule: [],
          },
          initialLoader: false,
        };
      }

      salons[salonId].categories[category].push({
        id: `${barber.id}`,
        name: barber.name,
        color: barber.background_color,
      });
    });
    return Object.values(salons);
  };

  // Handle Drag End
  const handleDragEnd = async (result: any) => {
    try {
      setShowLoader(true);
      const { source, destination } = result;
      // If no destination, return
      if (!destination) return;

      // If the source and destination are the same, return
      if (source.droppableId === destination.droppableId) {
        setShowLoader(false);
        return;
      }

      let destCategory: "schedule" | "walkIn" | string;

      const sourceSalonIndex = parseInt(source.droppableId.split("-")[0], 10);
      const sourceCategory = source.droppableId.split("-")[1] as CategoryKey;
      const destSalonIndex = parseInt(
        destination.droppableId.split("-")[0],
        10
      );
      destCategory = destination.droppableId.split("-")[1] as CategoryKey;

      // Prevent drag-and-drop across different salons
      if (sourceSalonIndex !== destSalonIndex) {
        setShowLoader(false);
        return;
      }

      // Avoid unnecessary state updates if source and destination are the same
      if (
        sourceCategory === destCategory &&
        source.index === destination.index
      ) {
        setShowLoader(false);
        return;
      }
      salonBarberData[sourceSalonIndex].initialLoader = true;
      setSelectedBarberId(result.draggableId);
      setSelectedBarberCategory(destCategory);
      setSelectedSoruceCategory(sourceCategory);
      setTimeout(() => {
        if (destCategory === "walkIn") {
          toggleConfirmModal();
        } else {
          updateBarberStatus(result.draggableId, destCategory, sourceCategory);
        }
      }, 500);
    } catch (error: any) {
      setShowLoader(false);
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

  const confirmAppointmentChange = async () => {
    updateBarberStatus();
  };

  const closeConfirm = () => {
    const updatedData = salonBarberData.map((salon: any) => {
      return {
        ...salon,
        initialLoader: false,
      };
    });
    setSalonBarberData(updatedData);
    setSelectedBarberCategory(null);
    setSelectedSoruceCategory(null);
    setSelectedBarberId(null);
    toggleConfirmModal();
  };

  const toggleConfirmModal = () => {
    setShowLoader(false);
    setConfirmModalOpen(!confirmModalOpen);
  };

  // const updateBarberStatus = async (barberId?: any, destCategory?: any, sourceCategory?: any) => {
  //   if (selectedBarberCategory) {
  //     destCategory = selectedBarberCategory;
  //   }
  //   if (selectedSoruceCategory) {
  //     sourceCategory = selectedSoruceCategory;
  //   }
  //   const obj = { category: destCategory === 'walkIn' ? 2 : 1 };

  //   if (selectedBarberId) {
  //     barberId = selectedBarberId;
  //   }
  //   const updatedCategory = await updateBarberCategory(parseInt(barberId), obj);
  //   if (updatedCategory) {
  //     toast.success("Category updated successfully", { autoClose: 2000 });

  //     setConfirmModalOpen(false);
  //     setSelectedBarberCategory(null);
  //     setSelectedSoruceCategory(null);
  //     setSelectedBarberId(null);
  //     fetchBarbersList(1, null);
  //     setShowLoader(false);

  //   }

  const updateBarberStatus = async (barberId?: any,destCategory?: any,sourceCategory?: any) => {
    try {
      if (selectedBarberCategory) {
        destCategory = selectedBarberCategory;
      }
      if (selectedSoruceCategory) {
        sourceCategory = selectedSoruceCategory;
      }
      const obj = { category: destCategory === "walkIn" ? 2 : 1 };

      if (selectedBarberId) {
        barberId = selectedBarberId;
      }

      const updatedCategory = await updateBarberCategory(parseInt(barberId),obj);

      if (updatedCategory) {
        toast.success("Category updated successfully", { autoClose: 2000 });
        setConfirmModalOpen(false);
        setSelectedBarberCategory(null);
        setSelectedSoruceCategory(null);
        setSelectedBarberId(null);
        fetchBarbersList(1, null);
        setShowLoader(false);
      }
    } catch (error: any) {
      setShowLoader(false);
      if (error?.response && error?.response?.status === 400) {
        // toast.warning(error?.response?.data?.message || "Bad Request", {
        //   autoClose: 3000,
        // });
        toast.warning("You must complete all ongoing appointments before changing the barber's category.", { autoClose: 3000 });

      } else {
        toast.error("Something went wrong. Please try again!", {
          autoClose: 3000,
        });
      }
    }
  };
  return (
    <>
      <div className="d-flex justify-content-end" style={{ padding: "20px" }}>
        <b className="text-danger">
          <span style={{ fontSize: "16px", fontWeight: 800 }}>Note: </span>If
          you change the barber category, then the barber needs to relogin.
        </b>
      </div>
      <>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "40px",
            }}
          >
            {salonBarberData.map((salon, salonIndex) => (
              <div
                key={salon.salon.id}
                style={{
                  border: "1px solid lightgray",
                  borderRadius: "10px",
                  padding: "20px",
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {salon.initialLoader && <Loader />}
                <h2
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    color: "#333",
                  }}
                >
                  {salon.salon.name}
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {/* Walk-In Service */}
                  <Droppable
                    droppableId={`${salonIndex}-walkIn`}
                    key={`general-${salonIndex}`}
                  >
                    {(provided: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "15px",
                          backgroundColor: "#f7f7f7",
                          minHeight: "200px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          alignItems: "center",
                          justifyContent:
                            salon.categories.walkIn.length === 0
                              ? "center"
                              : "flex-start",
                        }}
                      >
                        <h4 style={{ marginBottom: "15px", color: "#555" }}>
                          Walk-In Service
                        </h4>
                        {salon.categories.walkIn.length === 0 ? (
                          <div style={{ color: "#999" }}>No data available</div>
                        ) : (
                          salon.categories.walkIn.map((barber, index) => (
                            <Draggable
                              key={`${salon.salon.id}-${barber.id}`}
                              draggableId={barber.id}
                              index={index}
                            >
                              {(provided: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    padding: "10px",
                                    backgroundColor: barber.color,
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    color:
                                      barber.color === "#000000" ||
                                      barber.color === "#0a0a0a"
                                        ? "#ffffff"
                                        : "#000000",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                    width: "50%",
                                    textAlign: "center",
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {barber.name}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Scheduled Service */}
                  <Droppable
                    droppableId={`${salonIndex}-schedule`}
                    key={`appointment-${salonIndex}`}
                  >
                    {(provided: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "15px",
                          backgroundColor: "#f7f7f7",
                          minHeight: "200px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          alignItems: "center",
                          justifyContent:
                            salon.categories.schedule.length === 0
                              ? "center"
                              : "flex-start",
                        }}
                      >
                        <h4 style={{ marginBottom: "15px", color: "#555" }}>
                          Scheduled Service
                        </h4>
                        {salon.categories.schedule.length === 0 ? (
                          <div style={{ color: "#999" }}>No data available</div>
                        ) : (
                          salon.categories.schedule.map((barber, index) => (
                            <Draggable
                              key={barber.id}
                              draggableId={barber.id}
                              index={index}
                            >
                              {(provided: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    padding: "10px",
                                    backgroundColor: barber.color,
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    color:
                                      barber.color === "#000000"
                                        ? "#ffffff"
                                        : "#000000",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                    width: "50%",
                                    textAlign: "center",
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {barber.name}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
        <AppointmentConfirmationModal
          isOpen={confirmModalOpen}
          toggle={closeConfirm}
          onConfirm={confirmAppointmentChange} // Pass the confirm function with appointmentId
          status={""}
          isAppointment={false}
          isTransferBarber={true}
          isService={false}
          appointmentId={""} // Pass appointmentId to modal
        />
      </>
      <ToastContainer closeButton={false} limit={1} />
    </>
  );
};

export default SalonTransferBarber;
