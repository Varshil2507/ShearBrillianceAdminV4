import React, { useEffect, useState } from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { updateBarberStatus } from "../../Services/barberService"; // API handler
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BarberStatusDropdownProps {
  isBarber: boolean; // Indicates if the user is a barber
  userInfo: any; // Barber's user info
  barberUserInfo: any; // Barber's detailed information
  showLoader: (mode: boolean) => void; // Function to toggle loader
}

const BarberStatusDropdown: React.FC<BarberStatusDropdownProps> = ({
  isBarber,
  userInfo,
  barberUserInfo,
  showLoader,
}) => {
  const [barberStatus, setBarberStatus] = useState<string>("Available");

  // Set default status from props during initialization
  useEffect(() => {
    if (barberUserInfo?.status) {
      setBarberStatus(barberUserInfo.status.toLowerCase());
    }
  }, [barberUserInfo]);

  // Handle barber status change
  const handleStatusChange = async (newStatus: string) => {
    showLoader(true); // Show loader during API call
    setBarberStatus(newStatus); // Update status locally for instant UI feedback

    const obj = { status: newStatus };
    try {
      // Call the API to update barber status
      const response = await updateBarberStatus(userInfo.user.id, obj);

      // Validate and update session storage
      if (response && response.barber) {
        sessionStorage.setItem("authBarberUser", JSON.stringify(response.barber));
        toast.success("Status updated successfully", { autoClose: 2000 });
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
    } finally {
      showLoader(false); // Hide loader after API call
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-end mb-6">
      <label htmlFor="statusDropdown" className="mt-4 mb-4">
        Status &nbsp; &nbsp;
      </label>

      <UncontrolledDropdown>
        <DropdownToggle
          tag="button"
          className="btn btn-light"
          style={{
            color:
              barberStatus === "available"
                ? "green"
                : barberStatus === "running"
                ? "blue"
                : "red",
            fontWeight: "bold",
          }}
        >
          {barberStatus.charAt(0).toUpperCase() + barberStatus.slice(1)}{" "}
          <i className="mdi mdi-chevron-down"></i>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => handleStatusChange("available")}>Available</DropdownItem>
          <DropdownItem onClick={() => handleStatusChange("unavailable")}>Unavailable</DropdownItem>
          <DropdownItem onClick={() => handleStatusChange("running")}>Running</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>

      <ToastContainer autoClose={2000} limit={1} />
    </div>
  );
};

export default BarberStatusDropdown;
