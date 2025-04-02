import React, { useState, useEffect } from 'react';
import { fetchSalesPaymentData } from 'Services/Sales';
import { showErrorToast } from 'slices/layouts/toastService';

interface AppointmentStatus {
    status: string;
    count: string;
}

const RevenueStatus: React.FC = () => {
    const [chartData, setChartData] = useState<number[]>([0, 0]); // Completed, Cancelled
    const [selectedFilter, setSelectedFilter] = useState<string>("Last 7 Days");
    const [loading, setLoading] = useState<boolean>(false);

    // Function to map API response to chartData
    const mapApiResponseToChartData = (response: AppointmentStatus[]): number[] => {
        const mappedData = [0, 0]; // Default values for [completed, cancelled]
        response.forEach((item: AppointmentStatus) => {
            if (item.status === "completed") mappedData[0] = parseInt(item.count, 10);
            // else if (item.status === "checked_in" || item.status === "yet_to_start") mappedData[1] += parseInt(item.count, 10);
            else if (item.status === "canceled") mappedData[2] = parseInt(item.count, 10);
        });
        return mappedData;
    };

    const fetchData = async (filter: string): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetchSalesPaymentData(filter);
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
            {/* <Col xxl={3} md={6}>
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Sales Forecast</h4>
                        <div className="flex-shrink-0">
                            <UncontrolledDropdown className="card-header-dropdown">
                                <DropdownToggle tag="a" className="text-reset dropdown-btn" role="button">
                                    <span className="fw-semibold text-uppercase fs-12">Sort by: </span><span className="text-muted">{seletedMonth.charAt(0).toUpperCase() + seletedMonth.slice(1)}<i className="mdi mdi-chevron-down ms-1"></i></span>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-start">
                                    <DropdownItem onClick={() => { onChangeChartPeriod("oct"); }} className={seletedMonth === "oct" ? "active" : ""}>Oct 2021</DropdownItem>
                                    <DropdownItem onClick={() => { onChangeChartPeriod("nov"); }} className={seletedMonth === "nov" ? "active" : ""}>Nov 2021</DropdownItem>
                                    <DropdownItem onClick={() => { onChangeChartPeriod("dec"); }} className={seletedMonth === "dec" ? "active" : ""}>Dec 2021</DropdownItem>
                                    <DropdownItem onClick={() => { onChangeChartPeriod("jan"); }} className={seletedMonth === "jan" ? "active" : ""}>Jan 2022</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>
                    </CardHeader>
                    <div className="card-body pb-0">
                        <div id="sales-forecast-chart" className="apex-charts">
                            <SalesForecastCharts series={chartData} dataColors='["--vz-primary", "--vz-success", "--vz-warning"]'/>
                        </div>
                    </div>
                </Card>
            </Col> */}

        </React.Fragment>
    );
};

export default RevenueStatus;
