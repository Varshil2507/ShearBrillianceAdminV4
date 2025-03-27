import React, { useEffect, useState } from "react";
import { Col, Row, Spinner, Accordion, AccordionItem, AccordionHeader, AccordionBody, Card } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/material_blue.css"; // Flatpickr theme
import { generateSalesReport } from "Services/Insalonappointment";
import { fetchBarber, fetchBarberBySalon } from "Services/barberService";
import { fetchSalons } from "Services/SalonService";
import PayrollPDF from "./PayrollPDF"; // Import the PDF Component
import { PDFDownloadLink } from "@react-pdf/renderer";
import { fetchBarberPayroll } from "Services/DashboardService";
import { formatDate, formatHours } from "Components/Common/DateUtil";
import PayrollDownloadButton from "./PayrollDownloadButton";

interface SubDetail {
    id: string;
    info: string;
}

interface Detail {
    id: string;
    date: string;
    day: string;
    totalHours: number;
    workingHours: number;
    appointments: number;
    services: number;
    servicesAmount: number;
    tips: number;
    tax: number;
    grandTotal: number;
    subDetails?: SubDetail[];
}

interface Employee {
    id: string;
    name: string;
    totalHours: number;
    workingHours: number;
    appointments: number;
    services: number;
    servicesAmount: number;
    tips: number;
    tax: number;
    grandTotal: number;
    details?: Detail[];
}

type OptionType = {
    value: number;
    label: string;
};

const Payroll = () => {
    const [selectedStartDate, setStartDate] = useState<any>(new Date());
    const [selectedEndDate, setEndDate] = useState<any>(new Date());
    const [showReportSpinner, setShowReportSpinner] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [showDownload, setShowDownload] = useState<boolean>(false);
    const [salonData, setSalonData] = useState<any[]>([]); // List of all barbers
    const [salonBarberData, setSalonBarberData] = useState<any[]>([]); // Barbers filtered by selected salon
    const [payrollData, setPayrollData] = useState<any[]>([]); // Barbers filtered by selected salon
    const [selectedSalonId, setSelectedSalonId] = useState<any | null>(null); // Selected salon
    const [selectedSalonInfo, setSelectedSalonInfo] = useState<any | null>(null); // Selected salon

    const [selectedBarberIds, setSelectedBarberIds] = useState<OptionType[]>([]);
    // const [barberDisabled, setBarberDisabled] = useState(false);
    const [barberDisabled, setBarberDisabled] = useState(true); // Initially disabled
    const [barberError, setBarberError] = useState(false);
    const [salonError, setSalonError] = useState(false);

    const [isReady, setIsReady] = useState(false);


    const customStyles = {
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: "#cce5ff", // Change background color of selected options
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: "#0056b3", // Change text color of selected options
            fontWeight: "500",
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: "#0056b3",
            ":hover": {
                backgroundColor: "#d1ecf1",
                color: "#004085",
            },
        }),
    }

    // Level 1: Track which employee accordion is open.
    const [openEmployee, setOpenEmployee] = useState<string>("");
    // Level 2: Track which detail accordion is open.
    const [openDetail, setOpenDetail] = useState<string>("");
    // Level 3: Track which sub-detail accordion is open.
    const [openSubDetail, setOpenSubDetail] = useState<string>("");


    const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
    let authUser = localStorage.getItem("authUser");
    let userRole: any;
    let storeUserInfo: any;
    if (authUser) {
        storeUserInfo = JSON.parse(authUser);
        userRole = storeUserInfo.user.role;
    }

    const applyDateFilter = async () => {
        if (!selectedSalonId) {
            toast.warning("Please select salon.");
            return;
        }
        if (selectedBarberIds.length === 0) {
            toast.warning("Please select at least one barber.");
            return;
        }
        setShowSpinner(true);
        const barberIds = selectedBarberIds?.map((barber: any) => barber.value) || [];
        const obj = {
            startDate: formatDate(selectedStartDate),
            endDate: formatDate(selectedEndDate),
            salonId: selectedSalonId,
            barberIds: barberIds
        }
        try {
            const response = await fetchBarberPayroll(obj);
            setPayrollData([]);
            setShowDownload(true);
            if (response?.length > 0) {
                const payRollArray: any = [];
                response.forEach((element: any, index: any) => {
                    const payrollObj = {
                        id: index,
                        name: element.Name,
                        totalHours: element.TotalHours,
                        workingHours: element.WorkingHours,
                        appointments: element.TotalAppointments,
                        services: element.Services,
                        servicesAmount: element.ServicesAmount,
                        tips: element.Tips,
                        tax: element.Tax,
                        grandTotal: element.GrandTotal,
                        grandTotalWithoutTax: element.GrandTotalWithoutTax,
                        details: element.DateWiseBreakdown,
                    };
                    payRollArray.push(payrollObj);
                });
                setOpenEmployee(payRollArray?.length > 0 ? String(payRollArray[0].id) : "");
                setOpenDetail(payRollArray?.length > 0 ? payRollArray[0].details.length > 0 ? "0" : "" : "");
                setPayrollData(payRollArray);
                setIsReady(true); // Enable Download Button

            } else {
                setPayrollData([]); // No Data, Keep Button Disabled
                setIsReady(false);
            }

            // if (response && response.downloadUrl) {
            //     toast.success("PDF sales report generated successfully!", { autoClose: 2000 });
            //     window.open(response.downloadUrl, "_blank");
            // } else {
            //     toast.error("Failed to generate PDF report.");
            // }
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.message || "Something went wrong");
            }
        } finally {
            setShowSpinner(false);
            setShowDatePicker(false);
        }
    };
    const showToast = (message: string) => {
        toast.warning(message); // Display warning toast message
    };

    // const formatDate = (dateString: any) => {
    //     if (!dateString) return ""; // Return an empty string if dateString is invalid
    //     const date = new Date(dateString);
    //     // Get the user's current timezone
    //     const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    //     const options: Intl.DateTimeFormatOptions = {
    //         year: "numeric",
    //         month: "2-digit",
    //         day: "2-digit",
    //         timeZone: userTimeZone, // Automatically adapts to the user's location
    //     };

    //     // Get formatted date
    //     const formattedDate = new Intl.DateTimeFormat("en-CA", options).format(
    //         date
    //     ); // en-CA ensures YYYY-MM-DD format

    //     // Replace slashes with dashes to ensure YYYY-MM-DD format
    //     return formattedDate.replace(/\//g, "-");
    // };

    useEffect(() => {
        if (userRole?.role_name !== "Salon Manager") {
            const fetchAllData = async () => {
                try {
                    // Fetch both salons and barbers data in parallel
                    const [salonsResponse] = await Promise.all([
                        fetchSalons(1, null, null),
                    ]);
                    // Set the fetched data to the respective states
                    setSalonData(salonsResponse?.salons || []);
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
            fetchAllData();
        }
    }, []);

    const getSalonBabrer = async (salonId: any) => {
        try {
            // Fetch barbers for the selected salon
            const barberResponse = await fetchBarberBySalon(salonId, null);
            // Check if the barberResponse itself has data or is not empty
            if (barberResponse && barberResponse.length > 0) {
                const availableBarbers = barberResponse.filter((barber: any) => barber.availability_status === "available");
                const barbers = availableBarbers; // Assuming the response is directly the list of barbers
                if (barbers?.length > 0) {
                    let barberOptions = barbers?.length
                        ? barbers.map((barber: any) => ({ value: barber.id, label: barber.name }))
                        : [];
                    setSalonBarberData(barberOptions); // Update barber data
                }
            } else {
                setSalonBarberData([]); // No barbers found, clear barber data
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
            setSalonBarberData([]); // Clear barber data in case of error
        }
    };

    useEffect(() => {
        if (storeUserInfo.salon && userRole?.role_name === "Salon Manager") {
            setSelectedSalonId(storeUserInfo.salon.id);
            setSelectedSalonInfo(storeUserInfo.salon);
            getSalonBabrer(storeUserInfo.salon.id);
        }
    }, []);

    const handleSalonChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedValue = event.target.value;
        const salonId = selectedValue ? Number(selectedValue) : null;
        const salonInfo = salonData.find((salon: any) => salon.salon.id === salonId);
        setSelectedSalonId(salonId);
        setSelectedSalonInfo(salonInfo?.salon);
        if (salonId !== null) {
            // Fetch barbers for the selected salon
            setBarberDisabled(false); // Enable barber dropdown
            setSelectedBarberIds([]); // Reset to "Select Barber"
            setIsLoadingBarbers(true); // Show spinner while loading barbers
            try {
                await getSalonBabrer(salonId); // Fetch barbers
            } catch (error) {
                console.error("Error fetching barbers:", error);
                toast.error("Failed to fetch barbers.");
            } finally {
                setIsLoadingBarbers(false); // Hide spinner after fetching
            }
        } else {
            // If no salon is selected, reset barber dropdown
            setSalonBarberData([]);
            setSelectedBarberIds([]); // Ensure it shows "Select Barber"
            setBarberDisabled(false);
            setIsLoadingBarbers(false); // No loading
        }
    };

    const handleBarberChange = async (
        selectedMulti: any) => {
        // const barberId = selectedMulti;
        setSelectedBarberIds(selectedMulti);
        setBarberError(false); // Clear error when a selection is made
    };

    const toggleEmployee = (id: string) => {
        setOpenEmployee((prev) => (prev === id ? "" : id));
        // Optionally, clear nested states when switching employees.
        setOpenDetail("");
        setOpenSubDetail("");
    };

    const toggleDetail = (id: string) => {
        setOpenDetail((prev) => (prev === id ? "" : id));
        // Optionally, clear sub-detail state when toggling detail.
        setOpenSubDetail("");
    };

    const toggleSubDetail = (id: string) => {
        setOpenSubDetail((prev) => (prev === id ? "" : id));
    };

    return (
        <React.Fragment>
            <Row className="mb-3 pb-1">
                <Col xs={12}>
                    <div className="row align-items-center mt-3 g-2">
                        {/* Start Date Picker */}
                        <div className="col-lg-4 col-md-6 col-sm-6">
                            <Flatpickr
                                className="form-control"
                                value={selectedStartDate}
                                onChange={(dates: any) => setStartDate(dates[0])}
                                options={{ dateFormat: "Y-m-d", maxDate: new Date() }}
                                placeholder="Select Start Date"
                            />
                        </div>

                        {/* End Date Picker + Apply Button */}
                        <div className="col-lg-4 col-md-6 col-sm-6 d-flex align-items-center gap-2">
                            <div className="flex-grow-1">
                                <Flatpickr
                                    className="form-control"
                                    value={selectedEndDate}
                                    onChange={(dates: any) => {
                                        const selectedEnd = dates[0];
                                        if (selectedEnd && selectedEnd < selectedStartDate) {
                                            showToast("End Date cannot be before Start Date!");
                                            return;
                                        }
                                        setEndDate(selectedEnd);
                                    }}
                                    options={{
                                        dateFormat: "Y-m-d",
                                        minDate: selectedStartDate,
                                        maxDate: new Date(),
                                    }}
                                    placeholder="Select End Date"
                                />
                            </div>
                        </div>
                        {/* Salon Dropdown */}
                        {!storeUserInfo.berber && !storeUserInfo.salon && (
                            <div className="col-lg-4 col-md-6 col-sm-6">
                                <select
                                    id="salonSelect"
                                    className="form-select"
                                    value={
                                        selectedSalonId !== null
                                            ? selectedSalonId
                                            : ""
                                    }
                                    onChange={handleSalonChange}
                                >
                                    <option value="" disabled>
                                        Select Salon
                                    </option>
                                    {salonData.length > 0 ? (
                                        salonData.map((salon: any) => (
                                            <option key={salon.salon.id} value={salon.salon.id}>
                                                {salon.salon.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>
                                            No salons available
                                        </option>
                                    )}
                                </select>
                            </div>
                        )}
                        <div className="col-lg-12 col-md-12 col-sm-12 d-flex align-items-center gap-2">
                            {/* Barber Dropdown */}
                            <div
                                className={
                                    !storeUserInfo.salon
                                        ? "col-sm-11 col-md-11 col-lg-11 col-11"
                                        : "col-sm-11 col-md-11 col-lg-11 col-xl-11 col-xxl-11 col-11"
                                }
                            >
                                <Select
                                    isMulti
                                    name="barberSelect"
                                    options={salonBarberData}
                                    value={selectedBarberIds}
                                    styles={customStyles} // Apply custom styles
                                    onChange={handleBarberChange}
                                    disabled={
                                        !selectedSalonId ||
                                        isLoadingBarbers &&
                                        (userRole?.role_name !== "Salon Manager" || userRole?.role_name !== "Admin")
                                    } // Disable barber dropdown if no salon is selected
                                    getOptionLabel={(e: any) => (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedBarberIds.some((day: any) => day.value === e.value)}
                                                readOnly
                                            />
                                            &nbsp; {e.label}
                                        </div>
                                    )}
                                    closeMenuOnSelect={false}
                                />

                                {/* Inline Spinner */}
                                {isLoadingBarbers && (
                                    <div
                                        className="position-absolute"
                                        style={{
                                            top: "50%",
                                            right: "10px",
                                            transform: "translateY(-50%)",
                                        }}
                                    >
                                        <Spinner size="sm" />
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={applyDateFilter}
                                disabled={showSpinner}
                                style={{ whiteSpace: "nowrap" }} // Prevents button text from wrapping
                            >
                                {showSpinner && (
                                    <Spinner size="sm" className="me-2">
                                        Loading...
                                    </Spinner>
                                )}
                                Apply
                            </button>
                        </div>
                    </div>
                    <ToastContainer closeButton={false} limit={1} />
                </Col>
            </Row>
            <div className="p-4">
                <div className="d-flex justify-content-between">
                    <h2 className="text-xl font-bold mb-4">PAYROLL REPORT - TOTALS</h2>
                    {selectedSalonInfo && (
                        <div>
                            <b>Salon:</b> {selectedSalonInfo?.name}{"  |  "} <b>Date:</b> {formatDate(selectedStartDate)}  &nbsp; - &nbsp; {formatDate(selectedEndDate)}
                        </div>
                    )}
                </div>
                {/* Add Payroll Download Button */}
                <PayrollDownloadButton isReady={isReady} payrollData={payrollData} selectedSalonInfo={selectedSalonInfo}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate} />
                {openEmployee}
                <Accordion open={openEmployee} toggle={toggleEmployee}>
                    {payrollData.map((employee) => (
                        <AccordionItem key={employee.id} itemID={String(employee.id)}>
                            <AccordionHeader targetId={String(employee.id)}>
                                {employee.name} - Total: {employee.grandTotal}
                            </AccordionHeader>
                            <AccordionBody accordionId={String(employee.id)}>
                                <Card className="p-3 mb-3">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Total Hours</th>
                                                <th>Working Hours</th>
                                                <th>Appointments</th>
                                                <th>Services</th>
                                                <th>Tips</th>
                                                <th>Tax</th>
                                                <th>Total (with Tax)</th>
                                                <th>Total (without Tax)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{employee.totalHours}</td>
                                                <td>{employee.workingHours}</td>
                                                <td>{employee.appointments}</td>
                                                <td>{employee.services} (${employee.servicesAmount})</td>
                                                <td>${employee.tips}</td>
                                                <td>${employee.tax}</td>
                                                <td>${employee.grandTotal}</td>
                                                <td>${employee.grandTotalWithoutTax}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {employee.details && employee.details?.length > 0 && (
                                        <Accordion open={openDetail} toggle={toggleDetail}>
                                            {employee.details.map((detail: any, index: any) => (
                                                <AccordionItem key={index} itemID={String(index)}>
                                                    <AccordionHeader targetId={String(index)}>
                                                        {detail.Date} - {detail.Day}
                                                    </AccordionHeader>
                                                    <AccordionBody accordionId={String(index)}>
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Total Hours</th>
                                                                    <th>Working Hours</th>
                                                                    <th>Appointments</th>
                                                                    <th>Services</th>
                                                                    <th>Tips</th>
                                                                    <th>Tax</th>
                                                                    <th>Total (with Tax)</th>
                                                                    <th>Total (without Tax)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>{detail.TotalHours}</td>
                                                                    <td>{detail.WorkingHours}</td>
                                                                    <td>{detail.Appointments}</td>
                                                                    <td>{detail.Services} (${detail.ServicesAmount})</td>
                                                                    <td>${detail.Tips}</td>
                                                                    <td>${detail.Tax}</td>
                                                                    <td>${detail.GrandTotal}</td>
                                                                    <td>${detail.GrandTotalWithoutTax}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <div className="ps-5">
                                                            <h5>Completed Appointments</h5>
                                                            <hr />
                                                            <table className="table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Duration</th>
                                                                        <th>Amount</th>
                                                                        <th>Payment Mode</th>
                                                                        <th>Tips</th>
                                                                        <th>Tax</th>
                                                                        <th>Grand Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {detail.CompletedAppointments?.length > 0 ? (
                                                                        detail.CompletedAppointments.map((completedAppointments: any, index: any) => (
                                                                            <tr>
                                                                                <td>{completedAppointments.WorkingHours}</td>
                                                                                <td>${completedAppointments.ServicesAmount}</td>
                                                                                <td>{completedAppointments.PaymentMode === "Pay_Online" ? "Pay Online" : "Pay at Salon"}</td>
                                                                                <td>${completedAppointments.Tips}</td>
                                                                                <td>${completedAppointments.Tax}</td>
                                                                                <td>${completedAppointments.GrandTotal}</td>
                                                                            </tr>
                                                                        ))) : (
                                                                        <tr>
                                                                            <td colSpan={7} className="text-center">No completed appointments available</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </AccordionBody>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    )}
                                </Card>
                            </AccordionBody>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </React.Fragment>
    );
};

export default Payroll;
