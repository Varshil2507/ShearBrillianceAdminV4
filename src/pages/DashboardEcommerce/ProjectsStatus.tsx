import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { PrjectsStatusCharts } from './DashboardProjectCharts';
import { fetchAppointmentStatus } from 'Services/DashboardService';
import { showErrorToast } from 'slices/layouts/toastService';

interface AppointmentStatus {
    status: string;
    count: string;
}

const ProjectsStatus: React.FC = () => {
    const [chartData, setChartData] = useState<number[]>([0, 0]); // Completed, Cancelled
    const [selectedFilter, setSelectedFilter] = useState<string>("Last 7 Days");
    const [loading, setLoading] = useState<boolean>(false);

    // Function to map API response to chartData
    const mapApiResponseToChartData = (response: AppointmentStatus[]): number[] => {
        const mappedData = [0, 0]; // Default values for [completed, cancelled]
        response.forEach((item: AppointmentStatus) => {
            if (item.status === "completed") mappedData[0] = parseInt(item.count, 10);
            // else if (item.status === "checked_in" || item.status === "yet_to_start") mappedData[1] += parseInt(item.count, 10);
            else if (item.status === "canceled") mappedData[1] = parseInt(item.count, 10);
        });
        return mappedData;
    };

    const fetchData = async (filter: string): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetchAppointmentStatus(filter);
            if (response?.response) {
                const data = response.response.filter((stats: any) => stats.status?.toLowerCase() === 'completed' || stats.status?.toLowerCase() === 'canceled')
                const chartData = mapApiResponseToChartData(data);
                setChartData(chartData);
            } else {
                setChartData([0, 0]); // Default to zero if no response
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
            setChartData([0, 0]); // Handle error by resetting data
        } finally {
            setLoading(false);
        }
    };

    const onChangeChartPeriod = (filter: string): void => {
        const filterMapping: { [key: string]: string } = {
            today: "Today",
            last_7_days: "Last 7 Days",
            last_30_days: "Last 30 Days",
        };
        setSelectedFilter(filterMapping[filter]);
        fetchData(filter);
    };

    useEffect(() => {
        fetchData("last_7_days"); // Fetch data on initial load
    }, []);

    return (
        <React.Fragment>
            <Col xxl={6} lg={6}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Appointment Status</h4>
                        <div className="flex-shrink-0">
                            <UncontrolledDropdown className="card-header-dropdown">
                                <DropdownToggle tag="a" className="dropdown-btn text-muted" role="button">
                                    {selectedFilter} <i className="mdi mdi-chevron-down ms-1"></i>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end">
                                    <DropdownItem
                                        onClick={() => onChangeChartPeriod("today")}
                                        className={selectedFilter === "Today" ? "active" : ""}
                                    >
                                        Today
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => onChangeChartPeriod("last_7_days")}
                                        className={selectedFilter === "Last 7 Days" ? "active" : ""}
                                    >
                                        Last 7 Days
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => onChangeChartPeriod("last_30_days")}
                                        className={selectedFilter === "Last 30 Days" ? "active" : ""}
                                    >
                                        Last 30 Days
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {loading ? (
                            <div className="text-center">Loading...</div>
                        ) : (
                            <>
                                <PrjectsStatusCharts
                                    series={chartData}
                                    chartId="projects-status"
                                />

                                <div className="mt-3">
                                    <div className="d-flex justify-content-center align-items-center mb-4">
                                        <h2 className="me-3 ff-secondary mb-0">
                                            {chartData.reduce((total, num) => total + num, 0)}
                                        </h2>
                                        <div>
                                            <p className="text-muted mb-0">Total Appointments</p>
                                        </div>
                                    </div>

                                    {[
                                        { color: "success", label: "Completed", count: chartData[0] },
                                        { color: "danger", label: "Cancelled", count: chartData[1] },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className={`d-flex justify-content-between ${index < 2 ? 'border-bottom border-bottom-dashed' : ''} py-2`}
                                        >
                                            <p className="fw-medium mb-0">
                                                <i className={`ri-checkbox-blank-circle-fill text-${item.color} align-middle me-2`}></i>
                                                {item.label}
                                            </p>
                                            <div>
                                                <span className="text-muted pe-5">{item.count} Appointments</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardBody>
                </Card>
            </Col>
            
        </React.Fragment>
    );
};

export default ProjectsStatus;
