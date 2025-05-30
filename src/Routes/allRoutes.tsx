import { Navigate } from "react-router-dom";

// //Tables
import CustomerTable from "pages/Pages/Admin/Customer";
import UserTable from "../pages/Pages/Admin/User";
import BarberTable from "pages/Pages/Admin/Barbers";
import SalonTable from "pages/Pages/Admin/Salon";
import RoleTable from "pages/Pages/Admin/Role";
import AppointmentTable from "pages/Pages/Admin/Appointments";
import BlogTable from "pages/Pages/Admin/Blog";
import Board from "pages/Pages/Admin/Board";
import HaircutDetail from "pages/Pages/Admin/HaircutDetail";
import OurService from "pages/Pages/Admin/OurService";
import LeaveHistoryTable from "pages/Pages/Admin/BarberLeaveHistory"
import RequestedLeavesTable from "pages/Pages/Admin/LeaveDesk"

// //AuthenticationInner pages
import BasicSignIn from "../pages/AuthenticationInner/Login/BasicSignIn";
import CoverSignIn from "../pages/AuthenticationInner/Login/CoverSignIn";
// //pages

import Settings from "../pages/Pages/Profile/Settings/Settings";
import Faqs from "../pages/Pages/Faqs/Faqs";

import ComingSoon from "../pages/Pages/ComingSoon/ComingSoon";

import BasicSuccessMsg from "../pages/AuthenticationInner/SuccessMessage/BasicSuccessMsg";
import Basic404 from "../pages/AuthenticationInner/Errors/Basic404";
import Cover404 from "../pages/AuthenticationInner/Errors/Cover404";
import Cover401 from "../pages/AuthenticationInner/Errors/Cover401";
import Alt404 from "../pages/AuthenticationInner/Errors/Alt404";
import Error500 from "../pages/AuthenticationInner/Errors/Error500";

import Offlinepage from "../pages/AuthenticationInner/Errors/Offlinepage";

// //APi Key
import APIKey from "../pages/APIKey/index";

// //login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";


// // User Profile
import UserProfile from "../pages/Authentication/user-profile";

import DashboardEcommerce from "pages/DashboardEcommerce";
//import { components } from "react-select";


// //Task
import TaskDetails from "../pages/Tasks/TaskDetails";
import TaskList from "../pages/Tasks/TaskList";
import PrivacyPolicy from "pages/Pages/PrivacyPolicy";
import TermsCondition from "pages/Pages/TermsCondition";
import Notification from "pages/Authentication/Notification";
import Salonappointment from "pages/Pages/Admin/Insalonappointment";
import BarberSessions from "pages/Pages/Admin/BarberSessions";
import Salonscheduleappointment from "pages/Pages/Admin/ScheludeAppointment";
import SalonTransferBarber from "pages/Pages/Admin/TransferBarber";
import Salesrevenueindex from "pages/Pages/Admin/SalesRevenue";
import CalenderScheduleInfo from "pages/Pages/Admin/CalenderSchedule";
import BasicPasswReset from "pages/Authentication/BasicPasswReset";
import BarberPayroll from "pages/Pages/Admin/BarberPayroll";
import {ROLES} from "../common/data/Constants"
import BarberAppointmentTable from "pages/Pages/Admin/BarberAppointments/BarberAppointmentTable";
import ReactBarberAppointmentTable from "pages/Pages/Admin/BarberAppointments";


const authProtectedRoutes = [

  // //Task
  { path: "/apps-tasks-list-view", component: <TaskList /> },
  { path: "/apps-tasks-details", component: <TaskDetails /> },

  // //Api Key
  { path: "/apps-api-key", component: <APIKey /> },


  //Tables
  { path: "/customers", component: <CustomerTable />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER,ROLES.SALON_MANAGER] },  // Only admins can access},
  { path: "/barber-appointments", component: <ReactBarberAppointmentTable/>, allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER,ROLES.SALON_MANAGER] }, 
  { path: "/users", component: <UserTable />, allowedRoles: [ROLES.ADMIN] },
  { path: "/barbers", component: <BarberTable />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/barber-schedule", component: <BarberSessions />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER] },
  { path: "/salons", component: <SalonTable />, allowedRoles: [ROLES.ADMIN] },
  { path: "/roles", component: <RoleTable />, allowedRoles: [ROLES.ADMIN] },
  { path: "/appointments", component: <AppointmentTable />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER,ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/blogs", component: <BlogTable />, allowedRoles: [ROLES.ADMIN] },
  { path: "/in-salon-appointment", component: <Salonappointment />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/board", component: <Board />, allowedRoles: [ROLES.ADMIN, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/haircut-details", component: <HaircutDetail /> },
  { path: "/services", component: <OurService />, allowedRoles: [ROLES.ADMIN] },
  { path: "/leave-history", component: <LeaveHistoryTable />, allowedRoles: [ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER] },
  { path: "/transfer-barber", component: <SalonTransferBarber />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER] },
  { path: "/leave-desk", component: <RequestedLeavesTable />, allowedRoles: [ROLES.SALON_MANAGER] },

  { path: "/sales-revenue", component: <Salesrevenueindex />, allowedRoles: [ROLES.ADMIN,ROLES.SALON_MANAGER] },

  { path: "/schedule-appointment", component: <Salonscheduleappointment />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/calender-schedule", component: <CalenderScheduleInfo />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.APPOINTMENT_BARBER, ROLES.SALON_MANAGER] },


  // //Pages
  { path: "/pages-profile-settings", component: <Settings />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/pages-faqs", component: <Faqs /> },

  { path: "/pages-privacy-policy", component: <PrivacyPolicy />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/termscondition", component: <TermsCondition />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },


  //User Profile
  { path: "/profile", component: <UserProfile />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/dashboard", component: <DashboardEcommerce />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/notification", component: < Notification />, allowedRoles: [ROLES.ADMIN, ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER, ROLES.SALON_OWNER, ROLES.SALON_MANAGER] },
  { path: "/payroll", component: <BarberPayroll />, allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER] },
  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
  { path: "*", component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/register", component: <Register /> },
  { path: "/access-denied", component: <Cover401 /> },
  { path: "/reset-password", component: <BasicPasswReset /> },
  // //AuthenticationInner pages
  { path: "/auth-signin-basic", component: <BasicSignIn /> },
  { path: "/auth-signin-cover", component: <CoverSignIn /> },
  { path: "/auth-success-msg-basic", component: <BasicSuccessMsg /> },
  { path: "/auth-404-basic", component: <Basic404 /> },
  { path: "/auth-401-cover", component: <Cover404 /> },
  { path: "/auth-404-alt", component: <Alt404 /> },
  { path: "/auth-500", component: <Error500 /> },

  { path: "/auth-offline", component: <Offlinepage /> },

  { path: "/pages-coming-soon", component: <ComingSoon /> },
];

export { authProtectedRoutes, publicRoutes };
