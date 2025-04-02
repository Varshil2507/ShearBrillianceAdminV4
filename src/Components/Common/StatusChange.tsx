import { useEffect, useState } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { updateSalonStatus } from "../../Services/SalonService"; // Assuming the API function is in api.js or api.ts
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";

interface SalonStatusDropdownProps {
  isSalonOwner: boolean;
  userInfo: any;
  salonUserInfo: any;
  showLoader: (mode: boolean) => void;
}
const SalonStatusDropdown = ({ userInfo, salonUserInfo, showLoader }: SalonStatusDropdownProps) => {
  const [status, setStatus] = useState("Open");

  // Update the default value during edit operation
  useEffect(() => {
    if (salonUserInfo) {
      setStatus(salonUserInfo.status); // Set the default value based on props
    }
  }, []);
  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      showLoader(true);
      setStatus(newStatus); // Update status locally 
      const obj = {
        status: newStatus
      }
      const updatedStatus = await updateSalonStatus(userInfo.user.id, obj);
      localStorage.setItem("authSalonUser", JSON.stringify(updatedStatus.salon));
      const timer = setTimeout(() => {
        showLoader(false);
      }, 1000); // Hide loader after 5 seconds
      showSuccessToast("Status updated successfully");
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

  return (
    <div className="d-flex align-items-center justify-content-start mb-6">
      <label htmlFor="statusDropdown" className="mt-4 mb-4">
        Status &nbsp; &nbsp;
      </label>

      <UncontrolledDropdown>
        <DropdownToggle
          tag="button"
          className="btn btn-light"
          style={{
            color: status === "open" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status} <i className="mdi mdi-chevron-down"></i>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => handleStatusChange("open")}>
          Open
          </DropdownItem>
          <DropdownItem onClick={() => handleStatusChange("close")}>
            Close
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
      {/* Show loading spinner if the API call is in progress */}
      {/* {loading && <span>Loading...</span>} */}
    </div>
  );
};

export default SalonStatusDropdown;
