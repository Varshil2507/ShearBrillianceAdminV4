import config from "config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Insalonappointment } from "Services/Insalonappointment";
import { showErrorToast } from "slices/layouts/toastService";
import { io } from "socket.io-client";
// Ensure you import your API method

// Interface for the user object
interface User {
  id: number;
  firstname: string;
  lastname: string;
  profile_photo: string | null;
}

// Interface for the barber object
interface Barber {
  name: string;
  background_color: string | null;
}

// Interface for the salon object
interface Salon {
  name: string;
}

// Interface for each appointment in the response data
interface Appointment {
  id: number;
  number_of_people: number;
  status: string;
  estimated_wait_time: number;
  queue_position: number;
  mobile_number: string;
  name: string;
  check_in_time: string;
  in_salon_time: string;
  complete_time: string | null;
  cancel_time: string | null;
  BarberId: number;
  User: User;
  Barber: Barber;
  salon: Salon;
}

// Interface for the full API response
interface AppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment[];
  code: number;
}

const { api } = config;

const AppointmentCards = () => {
  const [cards, setCards] = useState<any>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const authTUser = localStorage.getItem("authUser");
  let storeUserInfo: any;
  let token: any;
  if (authTUser) {
    storeUserInfo = JSON.parse(authTUser);
    token = storeUserInfo.token;
  }

  useEffect(() => {
    const socket = io(api.MAIN_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,  // Number of attempts before giving up
      reconnectionDelay: 3000,  // Time between reconnections
    });

    socket.on("connect_error", (error) => {
      navigate("/dashboard");
    });
  
    // Listen for messages from the servers
    socket.on("insaloncustomerupdate", (updatedAppointments) => { 
      const transformedCards = updatedAppointments.map((appointment: any) => ({
        barber: appointment.Barber.name,
        barber_bg_color: appointment.Barber.background_color,
        salon: appointment.salon.name,
        title: appointment.User.firstname,
        text: appointment.User.lastname,
        picture: appointment.User.profile_photo,
      }));
      setCards(transformedCards);
      // Update the UI with new appointments (you can update your state here)
    });
    // Cleanup function to avoid memory leaks
    return () => {
      socket.off("insaloncustomerupdate"); // Clean up the socket event listener
      socket.disconnect();
    };
  }, [token]);



  useEffect(() => {
    const fetchAppointments = async () => {

      try {
        const response: any = await Insalonappointment("status=active"); // Fetch data from API
        if (!response.success) {
          const transformedCards = response.map((appointment: any) => ({
            barber: appointment.Barber.name,
            barber_bg_color: appointment.Barber.background_color,
            salon: appointment.salon.name,
            title: appointment.User.firstname,
            text: appointment.User.lastname,
            picture: appointment.User.profile_photo,
          }));
          setCards(transformedCards);
        }
        setLoading(false);
      } catch (error: any) {
        // Check if the error has a response property (Axios errors usually have this)
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
        } else {
          // Fallback for other types of errors
          showErrorToast(error.message || "Something went wrong");
        }
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getInitials = (firstName: string, lastName: string): string => {
    const firstInitial = firstName?.[0]?.toUpperCase() || '';
    const lastInitial = lastName?.[0]?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };
  return (
    <><div className="container-fluid mt-1">
      <div className="row row-cols-1 row-cols-md-4 row-cols-lg-4 g-4">
        {cards?.length > 0 ? cards?.slice(0, 16).map((card: any, index: number) => (
          <div className="col col-md-6" key={index}> {/* Added a unique key */}
            <div
              className="card task-box"
              style={{ marginBottom: "0px", maxWidth: "230px", margin: "0 auto" }}
            >
              <div className="card-body" style={{ paddingBottom: "0px" }}>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="fs-15 mb-2 text-truncate">
                      <a href="#" className="d-block">
                        {card.title} {card.text} - {getInitials(card.title, card.text)}
                      </a>
                    </h6>
                  </div>
                </div>
              </div>
              <div className="card-footer border-top-dashed" style={{ paddingTop: "8px" }}>
                <div className="flex-grow-1">
                  <b>Barber:</b> <span style={{ color: card.barber_bg_color }}>{card.barber}</span>
                </div>
                <div className="flex-grow-1">
                  <b>Salon:</b> <span>{card.salon}</span>
                </div>
              </div>
            </div>
          </div>
        )) : <span className="text-muted text-center w-100"><i>No appointment currently running!!!</i></span>}

      </div>
    </div></>

  );
};

export default AppointmentCards;
