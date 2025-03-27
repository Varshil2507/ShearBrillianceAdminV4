import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Navdata = () => {
    const history = useNavigate();

    //state data
    const [isDashboard, setIsDashboard] = useState<boolean>(false);
    const [iscurrentState, setIscurrentState] = useState('Dashboard');

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
            let activeIconItems = [...iconItems];
            activeIconItems.forEach((item) => {
                item.classList.remove("active");
                var id = item.getAttribute("sub-items");
                const getID = document.getElementById(id) as HTMLElement;
                if (getID)
                    getID.classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove('twocolumn-panel');
        if (iscurrentState !== 'Dashboard') {
            setIsDashboard(false);
        }

        if (iscurrentState === 'Widgets') {
            history("/widgets");
            document.body.classList.add('twocolumn-panel');
        }
        if (iscurrentState !== 'Landing') {
            //setIsLanding(false);
        }
    }, [
        history,
        iscurrentState,
        isDashboard,

    ]);

    const menuItems: any = [
        {
            label: "Menu",
            isHeader: true,
            allowedRoles: ['Admin', 'Appointment_Barber', 'WalkIn_Barber', 'Salon Owner', 'Salon Manager']
        },
        {
            id: "dashboard",
            label: "Dashboards",
            icon: "ri-dashboard-2-line",
            link: "/dashboard",
            stateVariables: isDashboard,
            click: function (e: any) {
                e.preventDefault();
                setIsDashboard(!isDashboard);
                setIscurrentState('Dashboard');
                updateIconSidebar(e);
            },
            allowedRoles: ['Admin', 'Appointment_Barber', 'WalkIn_Barber', 'Salon Owner', 'Salon Manager'] // All roles can see this
        },
        {
            id: "board",
            label: "Walk In Booking",
            icon: "ri-dashboard-fill",
            link: "/board",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Board');
            },
            allowedRoles: ['Admin', 'WalkIn_Barber', 'Salon Owner', 'Salon Manager'] // All roles can see this
        },
        {
            id: "AppointmentSchedule",
            label: "Future Booking",
            icon: "ri-calendar-check-line",
            link: "/schedule-appointment",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Blog');
            },
            allowedRoles: ['Admin', 'Salon Owner', 'Salon Manager'] // All roles can see this
        },
        {
            id: "salon",
            label: "Salon",
            icon: "ri-store-line",
            link: "/salons",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Salon');
            },
            allowedRoles: ['Admin'] // All roles can see this
        },
        {
            id: "barber",
            label: "Barber",
            icon: "ri-scissors-cut-line",
            link: "/barbers",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Barber');
            },
            allowedRoles: ['Admin', 'Salon Owner', 'Salon Manager'] // All roles can see this
        },
        {
            id: "appointment",
            label: "Walk In History",
            icon: "ri-calendar-check-fill",
            link: "/appointments",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Appointment');
            },
            allowedRoles: ['Admin', 'WalkIn_Barber', 'Salon Owner', 'Salon Manager'] // All roles can see this
        },
        {
            id: "calender",
            label: "Calender",
            icon: "ri-calendar-2-line",
            link: "/calender-schedule",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('calender Schedule');
            },
            allowedRoles: ["Admin", "Salon Owner", 'Appointment_Barber', 'Salon Manager'] // All roles can see this
        },
        {
            id: "Insalonappointment",
            label: "In-Salon Appointment",
            icon: "ri-calendar-check-line",
            link: "/in-salon-appointment",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Blog');
            },
            allowedRoles: ['Admin', 'Salon Owner', 'Salon Manager'] // All roles can see this
        },
        {
            id: "barberSchedule",
            label: "Barber Schedule",
            icon: "ri-time-line",
            link: "/barber-schedule",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Barber Schedule');
            },
            allowedRoles: ["Admin", "Salon Manager", 'Salon Manager',] // All roles can see this
        },
        {
            id: "ourservice",
            label: "Our Services",
            icon: "ri-service-line",
            link: "/services",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Our Service');
            },
            allowedRoles: ['Admin'] // All roles can see this
        },
        {
            id: "blog",
            label: "Add Blog",
            icon: "ri-book-open-line",
            link: "/blogs",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Blog');
            },
            allowedRoles: ['Admin'] // All roles can see this
        },
        {
            id: "TransferBarber",
            label: "Update Barber Category",
            icon: "ri-user-shared-2-line",
            link: "/transfer-barber",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Blog');
            },
            allowedRoles: ['Admin', 'Salon Manager'] // All roles can see this
        },
        {
            id: "users",
            label: "System Users",
            icon: " ri-shield-user-fill",
            link: "/users",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Users');
            },
            allowedRoles: ['Admin'] // All roles can see this
        },
        {
            id: "customers",
            label: "Customers Details",
            icon: "user ri-user-3-line",
            link: "/customers",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Customers');
            },
            allowedRoles: ['Admin', 'Salon Owner', 'Salon Manager'] // Only Admin can see
        },
        {
            id: "SalesRevenue",
            label: "Sales and Revenue",
            icon: "ri-line-chart-line",
            link: "/sales-revenue",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Blog');
            },
            allowedRoles: ['Admin', 'Salon Manager'] // All roles can see this
        },
        {
            id: "payroll",
            label: "Payroll",
            icon: "ri-line-chart-line",
            link: "/payroll",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Blog');
            },
            allowedRoles: ['Admin', 'Salon Manager'] // All roles can see this
        },
        {
            id: "role",
            label: "User Roles",
            icon: "ri-file-list-fill",
            link: "/roles",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Role');
            },
            allowedRoles: ['Admin'] // All roles can see this
        },
        // {
        //     id: "haircutdetails",
        //     label: "HaircutDetails",
        //     icon: "ri-scissors-2-fill",
        //     link: "/haircut-details",
        //     click: function (e: any) {
        //         e.preventDefault();
        //         setIscurrentState('HaircutDetails');
        //     }
        // },

        {
            id: "Leave",
            label: "Leave History",
            icon: "ri-book-open-line",
            link: "/leave-history",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Leave');
            },
            allowedRoles: ['Appointment_Barber', 'WalkIn_Barber'] // All roles can see this
        },
        {
            id: "LeaveDesk",
            label: "Leave Desk",
            icon: " ri-walk-line",
            link: "/leave-desk",
            click: function (e: any) {
                e.preventDefault();
                setIscurrentState('Leave');
            },
            allowedRoles: ['Salon Manager'] // All roles can see this
        },



        {/*
        id: "favoritesalon",
           label: "Favorite Salon",
          icon: "ri-heart-3-fill",
         link: "/favorite-salon",
         click: function (e: any) {
             e.preventDefault();
             setIscurrentState('Blog');
         }
     */}


    ];
    return <React.Fragment>

        {menuItems
            .filter((item: any) => {
                return item?.allowedRoles?.includes(userCategory)
            })
            .map((item: any, index: number) =>
                item
            )}
    </React.Fragment>;
};
export default Navdata;