import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Form,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

//import images
import logoSm from "../assets/images/logo-sm.png";

//import Components
import FullScreenDropdown from "../Components/Common/FullScreenDropdown";
import NotificationDropdown from "../Components/Common/NotificationDropdown";
import ProfileDropdown from "../Components/Common/ProfileDropdown";
import SalonStatusDropdown from "../Components/Common/StatusChange";
import BarberLeaveModal from "Components/Common/BarberLeave";
import LightDark from "../Components/Common/LightDark";
import { createBarberLeaveRequest } from '../Services/BarberLeaveService';
import { changeSidebarVisibility } from "../slices/thunks";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for Toastify
import config from "config";
import { updatePaymentConfig } from "Services/ConfigurationService";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";
import { ROLES } from "common/data/Constants";

const { commonText } = config;
const Header = ({ onChangeLayoutMode, layoutModeType, storeRoleInfo, headerClass, userInfo, salonUserInfo, paymentMode, changeShowLoader }: any) => {
  const dispatch: any = useDispatch();
  const [isSalonOpen, setIsSalonOpen] = useState<boolean>(true);
  const [isChecked, setIsChecked] = useState(paymentMode); // Initial state
  const [showModal, setShowModal] = useState(false); // Modal visibility state 
  const [nextState, setNextState] = useState(paymentMode); // Track next state for message

  // const [isModalOpen, setModalOpen] = useState<boolean>(false);

  // Function to toggle modal visibility

  const isSalonOwner = true;


  const selectDashboardData = createSelector(
    (state: any) => state.Layout,
    (sidebarVisibilitytype: any) => sidebarVisibilitytype.sidebarVisibilitytype
  );
  // Inside your component
  const sidebarVisibilitytype = useSelector(selectDashboardData);

  const [search, setSearch] = useState<boolean>(false);
  const toogleSearch = () => {
    setSearch(!search);
  };

  const toogleMenuBtn = () => {
    var windowSize = document.documentElement.clientWidth;
    const humberIcon = document.querySelector(".hamburger-icon") as HTMLElement;
    dispatch(changeSidebarVisibility("show"));

    if (windowSize > 767) humberIcon.classList.toggle("open");

    //For collapse horizontal menu
    if (document.documentElement.getAttribute("data-layout") === "horizontal") {
      document.body.classList.contains("menu")
        ? document.body.classList.remove("menu")
        : document.body.classList.add("menu");
    }

    //For collapse vertical and semibox menu
    if (
      sidebarVisibilitytype === "show" &&
      (document.documentElement.getAttribute("data-layout") === "vertical" ||
        document.documentElement.getAttribute("data-layout") === "semibox")
    ) {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document.documentElement.setAttribute("data-sidebar-size", "")
          : document.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute("data-sidebar-size", "sm")
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }

    //Two column menu
    if (document.documentElement.getAttribute("data-layout") === "twocolumn") {
      document.body.classList.contains("twocolumn-panel")
        ? document.body.classList.remove("twocolumn-panel")
        : document.body.classList.add("twocolumn-panel");
    }
  };
  const toggleSalonStatus = () => {
    setIsSalonOpen(!isSalonOpen); // Toggle between Open and Closed
  };

  // const handleStatusChange = async (newStatus: string) => {
  //   setStatus(newStatus); // Update status locally

  //   if (isSalonOwner) {
  //     setLoading(true); // Start loading while API is fetching salon data

  //     try {
  //       // Call the fetchSalons API with pagination and search params
  //       const response = await fetchSalons(1, 10, ""); // Example: page = 1, limit = 10, no search term

  //       // Handle the response (e.g., update the UI with fetched salons)
  //     } catch (error) {
  //       console.error("Error fetching salons:", error);
  //     } finally {
  //       setLoading(false); // Stop loading after the API call completes
  //     }
  //   }
  // };
  // const handleLeaveSubmit = async (leaveData: any) => {
  //   try {
  //     // Construct the payload for the API
  //     const leaveRequestPayload = {
  //       availability_status: leaveData.availability_status,
  //       date: leaveData.date,
  //       reason: leaveData.reason,
  //     start_time: leaveData.start_time,
  //      end_time: leaveData.end_time,
  //     };

  //     // Call the API service to create a leave request
  //     const response = await createBarberLeaveRequest(leaveRequestPayload);

  //     if (response.status === 200) {
  //       alert("Leave request submitted successfully");
  //       setLeaveModalOpen(false); // Close the modal after successful submission
  //     }
  //   } catch (error) {
  //     console.error("Error submitting leave request:", error);
  //     alert("Failed to submit leave request. Please try again.");
  //   }
  // };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Handle leave request submission
  const handleLeaveSubmit = async (leaveData: any) => {
    try {
      const response = await createBarberLeaveRequest(leaveData);

      if (response.status === 200) {
        showSuccessToast("Leave request submitted successfully!");
        toggleModal();
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

  const handleToggle = (event: any) => {
    setNextState(!isChecked); // Store the next state
    setShowModal(true); // Show the confirmation modal
  };

  const handleConfirm = async () => {
    const obj = {
      "enableOnlinePayment": nextState
    }
    try {
      await updatePaymentConfig(obj);
      showSuccessToast("Payment mode updated successfully!");
      setIsChecked(nextState); // Toggle the switch
      setShowModal(false); // Close modal
    } catch (error: any) {
      // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        showErrorToast(error.message || "Something went wrong");
      }
    };
  }

  const handleCancel = () => {
    setShowModal(false); // Just close modal, no action
  };

  useEffect(() => {

    // Initialize the theme from localStorage if available
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== layoutModeType) {
      onChangeLayoutMode(savedTheme); // Update the theme in the parent component
    }
  }, [layoutModeType, onChangeLayoutMode]);

  useEffect(() => {
    setIsChecked(paymentMode);
  }, [paymentMode]);

  return (
    <React.Fragment>
      <header id="page-topbar" className={headerClass}>
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex align-items-center">
              <div className="navbar-brand-box horizontal-logo">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <h3 className="mt-4 mb-4">{commonText.PROJECT_NAME}</h3>
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <h3 className="text-white mt-4 mb-4">{commonText.PROJECT_NAME}</h3>
                  </span>
                </Link>
              </div>

              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
              <h3>Welcome {storeRoleInfo?.role_name}</h3>
            </div>

            <div className="d-flex align-items-center">
              <Dropdown
                isOpen={search}
                toggle={toogleSearch}
                className="d-md-none topbar-head-dropdown header-item"
              >
                <DropdownToggle
                  type="button"
                  tag="button"
                  className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                >
                  <i className="bx bx-search fs-22"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                  <Form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ..."
                          aria-label="Recipient's username"
                        />
                        <button className="btn btn-primary" type="submit">
                          <i className="mdi mdi-magnify"></i>
                        </button>
                      </div>
                    </div>
                  </Form>
                </DropdownMenu>
              </Dropdown>
              {/* <div className="d-flex align-items-center justify-content-end mb-6">
                <label htmlFor="statusDropdown" className="mt-4 mb-4">
                  Status &nbsp; &nbsp;
                </label>
               
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="button"
                    className="btn btn-light"
                    style={{
                      color: status === "Open" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {status} <i className="mdi mdi-chevron-down"></i>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleStatusChange("Open")}>
                      Open
                    </DropdownItem>
                    <DropdownItem onClick={() => handleStatusChange("Close")}>
                      Close
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div> */}
              {(storeRoleInfo?.role_name ===ROLES.ADMIN) && (
                <div className="form-check form-switch form-switch-secondary">
                  <Input className="form-check-input" type="checkbox" role="switch" id="SwitchCheck2"
                    checked={isChecked}
                    onChange={handleToggle} // Trigger modal on change
                  />
                  <Label className="form-check-label" htmlFor="SwitchCheck2">Payment {isChecked ? "Online" : "Offline"}</Label>
                </div>
              )}
              {(storeRoleInfo?.role_name === ROLES.SALON_OWNER || storeRoleInfo?.role_name === ROLES.SALON_MANAGER) && (
                <SalonStatusDropdown
                  isSalonOwner={isSalonOwner}
                  userInfo={userInfo}
                  salonUserInfo={salonUserInfo}
                  showLoader={changeShowLoader}
                />
              )}
              <div>
                {storeRoleInfo?.role_name === ROLES.SALON_BARBER && (
                  <>
                    <Button color="primary" onClick={toggleModal}>Leave Request</Button>

                    {/* BarberLeaveModal */}
                    <BarberLeaveModal
                      isOpen={isModalOpen}
                      toggle={toggleModal}
                      onSubmit={handleLeaveSubmit}  // Pass the handleLeaveSubmit function here
                    />
                  </>
                )}
              </div>

              {/* {storeRoleInfo?.role_name === ROLES.SALON_BARBER && (
                <BarberStatusDropdown isBarber={isBarber}
                 userInfo={userInfo}
                 barberUserInfo={barberUserInfo}
                   showLoader={changeShowLoader} />
              ) } */}
              {/* FullScreenDropdown */}
              <FullScreenDropdown />

              {/* Dark/Light Mode set */}
              <LightDark
                layoutMode={layoutModeType}
                onChangeLayoutMode={onChangeLayoutMode}
              />
              {/* NotificationDropdown */}
              <NotificationDropdown />

              {/* ProfileDropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      <Modal isOpen={showModal} toggle={handleCancel} centered backdrop="static">
        <ModalHeader toggle={handleCancel}>Change Payment Mode</ModalHeader>
        <ModalBody>
          Are you sure you want to change the payment {isChecked ? "Online" : "Offline"} to{" "}
          {isChecked ? "Offline" : "Online"}?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Header;
