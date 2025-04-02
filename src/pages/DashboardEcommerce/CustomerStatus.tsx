import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { CustomerStatusCharts } from './CustomerChartDashboard';
import { fetchCutomerStatus } from 'Services/DashboardService';
import { showErrorToast } from 'slices/layouts/toastService';

const CustomerStatus: React.FC = () => {
    const [chartData, setChartData] = useState<number[]>([0, 0]); // Repeated, New
    const [totalCustomers, setTotalCustomers] = useState<number>(0);
    const [selectedFilter, setSelectedFilter] = useState<string>("Last 7 Days");
    const [loading, setLoading] = useState<boolean>(false);

    // Function to map API response to chartData
    const mapApiResponseToChartData = (data: any): number[] => {
        return [data.repeatedCustomers || 0, data.newCustomers || 0];
    };

    const fetchData = async (filter: string): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetchCutomerStatus(filter);
            if (response) {
                const chartData = mapApiResponseToChartData(response);
                setChartData(chartData);
                setTotalCustomers(response.totalCustomers || 0);
            } else {
                setChartData([0, 0]);
                setTotalCustomers(0);
            }
        } catch (error: any) {
            showErrorToast(error.response?.data?.message || "Something went wrong");
            setChartData([0, 0]);
            setTotalCustomers(0);
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
        fetchData("last_7_days");
    }, []);

    return (
        <React.Fragment>
            <Col xxl={6} lg={6}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Customer Status</h4>
                        <div className="flex-shrink-0">
                            <UncontrolledDropdown className="card-header-dropdown">
                                <DropdownToggle tag="a" className="dropdown-btn text-muted" role="button">
                                    {selectedFilter} <i className="mdi mdi-chevron-down ms-1"></i>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end">
                                    <DropdownItem onClick={() => onChangeChartPeriod("today")} className={selectedFilter === "Today" ? "active" : ""}>
                                        Today
                                    </DropdownItem>
                                    <DropdownItem onClick={() => onChangeChartPeriod("last_7_days")} className={selectedFilter === "Last 7 Days" ? "active" : ""}>
                                        Last 7 Days
                                    </DropdownItem>
                                    <DropdownItem onClick={() => onChangeChartPeriod("last_30_days")} className={selectedFilter === "Last 30 Days" ? "active" : ""}>
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
                                <CustomerStatusCharts series={chartData} chartId="projects-status" />

                                <div className="mt-3">
                                    <div className="d-flex justify-content-center align-items-center mb-4">
                                        <h2 className="me-3 ff-secondary mb-0">{totalCustomers}</h2>
                                        <div>
                                            <p className="text-muted mb-0">Total Customers</p>
                                        </div>
                                    </div>

                                    {[
                                        { color: "success", label: "Repeated Customers", count: chartData[0] },
                                        { color: "warning", label: "New Customers", count: chartData[1] },
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
                                                <span className="text-muted pe-5">{item.count} Customer</span>
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

export default CustomerStatus;
