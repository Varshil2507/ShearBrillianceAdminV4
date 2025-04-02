import config from "config";

// Import Images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import avatar9 from "../../assets/images/users/avatar-9.jpg";
import avatar10 from "../../assets/images/users/avatar-10.jpg";
import {ROLES} from "../data/Constants"


const { commonText } = config;
const taskWidgets = [
    {
        id: 1,
        label: "Total Appointments",
        counter: 234,
        badge: "ri-arrow-up-line",
        badgeClass: "success",
        percentage: "17.32 %",
        icon: "ri-ticket-2-line",
        iconClass: "info",
        decimals: 1,
        prefix: "",
        suffix: "k",
    },
    {
        id: 2,
        label: "Pending Appointments",
        counter: 64.5,
        badge: "ri-arrow-down-line",
        badgeClass: "danger",
        percentage: "0.87 %",
        icon: "mdi mdi-timer-sand",
        iconClass: "warning",
        decimals: 1,
        prefix: "",
        suffix: "k",
    },
    {
        id: 3,
        label: "Completed Appointments",
        counter: 116.21,
        badge: "ri-arrow-down-line",
        badgeClass: "danger",
        percentage: "2.52 %",
        icon: "ri-checkbox-circle-line",
        iconClass: "success",
        decimals: 2,
        prefix: "",
        suffix: "K",
    },
    {
        id: 4,
        label: "Deleted Appointments",
        counter: 14.84,
        badge: "ri-arrow-up-line",
        badgeClass: "success",
        percentage: "0.63 %",
        icon: "ri-delete-bin-line",
        iconClass: "danger",
        decimals: 2,
        prefix: "$",
        suffix: "%",
    },
];

const allTask = [
    {
        id: 1,
        UserID: "John Doe",
        BarberID: "Mike Anderson",
        DeviceId: "DVC12345",
        SalonId: "Luxe Cuts",
        NumberOfPeople: "5",
        EstimatTime: "20",
        CreatedDate: "25 Jan, 2022",
        Status: "Inprogress",
        statusClass: "secondary",
        Priority: "High",
        priorityClass: "danger",
    },
    {
        id: 2,
        UserID: "Sarah Johnson",
        BarberID: "Alex Smith",
        DeviceId: "DVC67890",
        SalonId: "Mary Cousar",
        NumberOfPeople: "2",
        EstimatTime: "20",
        CreatedDate:"25 Jan, 2022",
        Status: "New",
        statusClass: "info",
        Priority: "Low",
        priorityClass: "success",
    },
    {
        id: 3,
        UserID: "Anderson ",
        BarberID: "JoElite Styleshn",
        DeviceId: "DVC54321",
        SalonId: "Nathan Cole",
        NumberOfPeople: "6",
        EstimatTime: "23",
        CreatedDate:"25 Jan, 2022",
        Status: "Completed",
        statusClass: "success",
        Priority: "Medium",
        priorityClass: "warning",
    },
    
];

const kanbanBoardData = [
    {
        id: 1,
        name: "Check In",
        badge: "5",
        badgeClass: "success",
        tasks: [
            {
                id: 11,
                taskId: "#VL2436",
                title: "Profile Page Satructure",
                desc: "Profile Page means a web page accessible to the public or to guests.",
                progressBar: "15%",
                date: "03 Jan, 2022",
                progressBarColor: "danger",
                progressBarText: "secondary",
                tags: [
                    { tag: ROLES.ADMIN }
                ],
                members: [
                    { id: 1, img: avatar6 },
                    { id: 2, img: avatar5 },
                ],
                view: "04",
                message: "19",
                file: "02",
                isTaskId: true,
            },
            {
                id: 12,
                taskId: "#VL2436",
                title:  commonText.PROJECT_NAME + " - Admin Layout Design",
                desc: "The dashboard is the front page of the Administration UI.",
                date: "07 Jan, 2022",
                tags: [
                    { tag: "Layout" },
                    { tag: ROLES.ADMIN },
                    { tag: "Dashboard" }
                ],
                members: [
                    { id: 1, img: avatar7 },
                    { id: 2, img: avatar6 },
                    { id: 2, img: avatar1 },
                ],
                view: "14",
                message: "32",
                file: "05",
            }
        ]
    },
    {
        id: 2,
        name: "To Do",
        badge: "2",
        badgeClass: "secondary",
        tasks: [
            {
                id: 21,
                taskId: "#VL2436",
                title: "Admin Layout Design",
                desc: "Landing page template with clean, minimal and modern design.",
                date: "07 Jan, 2022",
                tags: [
                    { tag: "Design" },
                    { tag: "Website" },
                ],
                members: [
                    { id: 1, img: avatar10 },
                    { id: 2, img: avatar3 },
                    { id: 3, img: avatar2 },
                ],
                view: "13",
                message: "52",
                file: "17",
            },
            {
                id: 22,
                taskId: "#VL2436",
                title: "Marketing & Sales",
                desc: "Sales and marketing are two business functions within an organization.",
                date: "27 Dec, 2021",
                tags: [
                    { tag: "Marketing" },
                    { tag: "Business" },
                ],
                members: [
                    { id: 1, img: avatar9 },
                    { id: 2, img: avatar8 },
                ],
                view: "24",
                message: "10",
                file: "10",
            }
        ]
    },
    {
        id: 3,
        name: "Inprogress",
        badge: "2",
        badgeClass: "warning",
        tasks: [
            {
                id: 31,
                taskId: "#VL2457",
                title: "Brand Logo Design",
                desc: "BrandCrowd's brand logo maker allows you to generate and customize stand-out brand logos in minutes.",
                progressBar: "55%",
                date: "22 Dec, 2021",
                progressBarColor: "warning",
                tags: [
                    { tag: "Logo" },
                    { tag: "Design" },
                    { tag: "UI/UX" },
                ],
                members: [
                    { id: 1, img: avatar5 },
                    { id: 2, img: avatar7 },
                    { id: 3, img: avatar6 },
                ],
                view: "24",
                message: "10",
                file: "10",
                isTaskIdHeader: true,
                isProgessBarFooter: true,
            },
            {
                id: 32,
                taskId: "#VL2743",
                title: "Change Old App Icon",
                desc: "Change app icons on Android: How do you change the look of your apps.",
                progressBar: "0%",
                date: "24 Oct, 2021",
                progressBarColor: "primary",
                tags: [
                    { tag: "Design" },
                    { tag: "Website" },
                ],
                members: [
                    { id: 1, img: avatar10 },
                    { id: 2, img: avatar9 },
                    { id: 3, img: avatar5 },
                ],
                view: "64",
                message: "35",
                file: "23",
                isTaskIdHeader: true,
                isProgessBarFooter: true,
            }
        ]
    },
    {
        id: 4,
        name: "Completed",
        badge: "1",
        badgeClass: "success",
        tasks: [
            {
                id: 51,
                taskId: "#VL2451",
                title: "Create a Blog Template UI",
                desc: "Landing page template with clean, minimal and modern design.",
                progressBar: "35%",
                date: "3 Day",
                progressBarColor: "danger",
                progressBarText: "info",
                tags: [
                    { tag: "Design" },
                    { tag: "Website" },
                ],
                members: [
                    { id: 1, img: avatar8 },
                    { id: 2, img: avatar7 },
                    { id: 3, img: avatar6 },
                ],
                view: "24",
                message: "10",
                file: "10",
                isTaskId: true,
            }
        ]
    },
];

export { taskWidgets, allTask, kanbanBoardData };