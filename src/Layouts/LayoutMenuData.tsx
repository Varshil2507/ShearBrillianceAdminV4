"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "common/data/Constants";

const Navdata = () => {
  const history = useNavigate();

  //state data
  const [isDashboard, setIsDashboard] = useState<boolean>(false);
  const [isFutureBooking, setIsFutureBooking] = useState<boolean>(false);
  const [isAdministrationOpen, setIsAdministrationOpen] =
    useState<boolean>(false);
  const [isReportsOpen, setIsReportsOpen] = useState<boolean>(false);
  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  // Get the user's role from localStorage (you can replace this with a global state if needed)
  const userCategory = localStorage.getItem("userCategory");
  // const userRole = localStorage.getItem("userRole");
  // let storeRoleInfo: any;
  // if (userRole) {
  //     storeRoleInfo = JSON.parse(userRole);
  // }
  function updateIconSidebar(e: any) {
    if (e && e.target && e.target.getAttribute("sub-items")) {
      const ul: any = document.getElementById("two-column-menu");
      const iconItems: any = ul.querySelectorAll(".nav-icon.active");
      const activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("sub-items");
        const getID = document.getElementById(id) as HTMLElement;
        if (getID) getID.classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Future Booking") {
      setIsFutureBooking(false);
    }
    if (iscurrentState !== "Administration") {
      setIsAdministrationOpen(false);
    }
    if (iscurrentState !== "Reports") {
      setIsReportsOpen(false);
    }

    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState !== "Landing") {
      //setIsLanding(false);
    }
  }, [
    history,
    iscurrentState,
    isFutureBooking,
    isAdministrationOpen,
    isReportsOpen,
  ]);

  const menuItems: any = [
    {
      label: "Menu",
      isHeader: true,
      allowedRoles: [
        ROLES.ADMIN,
        ROLES.APPOINTMENT_BARBER,
        ROLES.WALKIN_BARBER,
        ROLES.SALON_OWNER,
        ROLES.SALON_MANAGER,
      ],
    },
    {
      id: "dashboard",
      label: "Dashboards",
      icon: "ri-dashboard-2-line",
      link: "/dashboard",
      stateVariables: isDashboard,
      click: (e: any) => {
        e?.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("Dashboard");
        updateIconSidebar(e);
      },
      allowedRoles: [
        ROLES.ADMIN,
        ROLES.APPOINTMENT_BARBER,
        ROLES.WALKIN_BARBER,
        ROLES.SALON_OWNER,
        ROLES.SALON_MANAGER,
      ], // All roles can see this
    },
    {
      id: "board",
      label: "Walk In Booking",
      icon: "ri-dashboard-fill",
      link: "/board",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Board");
      },
      allowedRoles: [
        ROLES.ADMIN,
        ROLES.WALKIN_BARBER,
        ROLES.SALON_OWNER,
        ROLES.SALON_MANAGER,
      ], // All roles can see this
    },
    {
      id: "futureBooking",
      label: "Appointment Booking",
      icon: "ri-calendar-check-line",
      link: "/#",
      stateVariables: isFutureBooking, // This will be false initially
      click: (e: any) => {
        e?.preventDefault();
        setIsFutureBooking(!isFutureBooking);
        setIscurrentState("Future Booking");
        updateIconSidebar(e);
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER],
      subItems: [
        {
          id: "scheduleAppointment",
          label: "Schedule Appointment",
          link: "/schedule-appointment",
          parentId: "futureBooking",
          allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER],
        },
        {
          id: "calendar ",
          label: "Calendar",
          link: "/calender-schedule",
          parentId: "futureBooking",
          allowedRoles: [
            ROLES.ADMIN,
            ROLES.SALON_OWNER,
            ROLES.APPOINTMENT_BARBER,
            ROLES.SALON_MANAGER,
          ],
        },
      ],
    },
    {
      id: "calender",
      label: "Calender",
      icon: "ri-calendar-2-line",
      link: "/calender-schedule",
      click: function (e: any) {
        e?.preventDefault();
        setIscurrentState("calender Schedule");
      },
      allowedRoles: [ROLES.APPOINTMENT_BARBER], // All roles can see this
    },
    {
      id: "salon",
      label: "Salon",
      icon: "ri-store-line",
      link: "/salons",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Salon");
      },
      allowedRoles: [ROLES.ADMIN], // All roles can see this
    },
    {
      id: "barber",
      label: ROLES.SALON_BARBER,
      icon: "ri-scissors-cut-line",
      link: "/barbers",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState(ROLES.SALON_BARBER);
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER], // All roles can see this
    },
    {
      id: "appointment",
      label: "Walk In History",
      icon: "ri-calendar-check-fill",
      link: "/appointments",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Appointment");
      },
      allowedRoles: [
        ROLES.ADMIN,
        ROLES.WALKIN_BARBER,
        ROLES.SALON_OWNER,
        ROLES.SALON_MANAGER,
      ], // All roles can see this
    },
    {
      id: "barberappointment",
      label: "Daily Appointment List",
      icon: " ri-calendar-todo-fill",
      link: "/barber-appointments",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Barber Appointments");
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER], // Only Admin can see
    },
    // Removed the standalone Calender item since it's now a submenu item
    {
      id: "Insalonappointment",
      label: "In-Salon Appointment",
      icon: "ri-calendar-check-line",
      link: "/in-salon-appointment",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Blog");
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER], // All roles can see this
    },
    {
      id: "barberSchedule",
      label: "Barber Schedule",
      icon: "ri-time-line",
      link: "/barber-schedule",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Barber Schedule");
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER, ROLES.SALON_MANAGER], // All roles can see this
    },
    {
      id: "ourservice",
      label: "Our Services",
      icon: "ri-service-line",
      link: "/services",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Our Service");
      },
      allowedRoles: [ROLES.ADMIN], // All roles can see this
    },
    {
      id: "blog",
      label: "Add Blog",
      icon: "ri-book-open-line",
      link: "/blogs",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Blog");
      },
      allowedRoles: [ROLES.ADMIN], // All roles can see this
    },
    {
      id: "TransferBarber",
      label: "Update Barber Category",
      icon: "ri-user-shared-2-line",
      link: "/transfer-barber",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Blog");
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER], // All roles can see this
    },
    // {
    //   id: "users",
    //   label: "System Users",
    //   icon: " ri-shield-user-fill",
    //   link: "/users",
    //   click: (e: any) => {
    //     e.preventDefault()
    //     setIscurrentState("Users")
    //   },
    //   allowedRoles: [ROLES.ADMIN], // All roles can see this
    // },
    {
      id: "customers",
      label: "Customers Details",
      icon: "user ri-user-3-line",
      link: "/customers",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Customers");
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_OWNER, ROLES.SALON_MANAGER], // Only Admin can see
    },
    {
      id: "administration",
      label: "Administration",
      icon: "ri-settings-line", // Using a settings icon for administration
      link: "/#",
      stateVariables: isAdministrationOpen,
      click: (e: any) => {
        e?.preventDefault();
        setIsAdministrationOpen(!isAdministrationOpen);
        setIscurrentState("Administration");
        updateIconSidebar(e);
      },
      allowedRoles: [ROLES.ADMIN], // Only admin can access these
      subItems: [
        {
          id: "users",
          label: "System Users",
          link: "/users",
          parentId: "administration",
          allowedRoles: [ROLES.ADMIN],
        },
        {
          id: "role",
          label: "User Roles",
          link: "/roles",
          parentId: "administration",
          allowedRoles: [ROLES.ADMIN],
        },
      ],
    },
    // {
    //   id: "SalesRevenue",
    //   label: "Sales and Revenue",
    //   icon: "ri-line-chart-line",
    //   link: "/sales-revenue",
    //   click: (e: any) => {
    //     e.preventDefault()
    //     setIscurrentState("Blog")
    //   },
    //   allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER], // All roles can see this
    // },
    // {
    //   id: "payroll",
    //   label: "Payroll",
    //   icon: "ri-line-chart-line",
    //   link: "/payroll",
    //   click: (e: any) => {
    //     e.preventDefault()
    //     setIscurrentState("Blog")
    //   },
    //   allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER], // All roles can see this
    // },
    {
      id: "reports",
      label: "Reports", // Parent menu label
      icon: "ri-file-chart-line", // Suitable icon for reports
      link: "/#", // Use "#" for parent items that only expand
      stateVariables: isReportsOpen, // Controls expand/collapse
      click: (e: any) => {
        e?.preventDefault();
        setIsReportsOpen(!isReportsOpen); // Toggle expansion
        setIscurrentState("Reports");
        updateIconSidebar(e);
      },
      allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER], // Same roles as original items
      subItems: [
        // Sales and Revenue (now a sub-item)
        {
          id: "SalesRevenue",
          label: "Sales and Revenue",
          link: "/sales-revenue",
          parentId: "reports",
          allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER],
        },
        // Payroll (now a sub-item)
        {
          id: "payroll",
          label: "Payroll",
          link: "/payroll",
          parentId: "reports",
          allowedRoles: [ROLES.ADMIN, ROLES.SALON_MANAGER],
        },
      ],
    },
    // {
    //   id: "role",
    //   label: "User Roles",
    //   icon: "ri-file-list-fill",
    //   link: "/roles",
    //   click: (e: any) => {
    //     e.preventDefault()
    //     setIscurrentState("Role")
    //   },
    //   allowedRoles: [ROLES.ADMIN], // All roles can see this
    // },
    {
      id: "Leave",
      label: "Leave History",
      icon: "ri-book-open-line",
      link: "/leave-history",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Leave");
      },
      allowedRoles: [ROLES.APPOINTMENT_BARBER, ROLES.WALKIN_BARBER], // All roles can see this
    },
    {
      id: "LeaveDesk",
      label: "Leave Desk",
      icon: " ri-walk-line",
      link: "/leave-desk",
      click: (e: any) => {
        e?.preventDefault();
        setIscurrentState("Leave");
      },
      allowedRoles: [ROLES.SALON_MANAGER], // All roles can see this
    },
  ];

  return (
    <React.Fragment>
      {menuItems
        .filter((item: any) => {
          return item?.allowedRoles?.includes(userCategory);
        })
        .map((item: any, index: number) => item)}
    </React.Fragment>
  );
};
export default Navdata;
