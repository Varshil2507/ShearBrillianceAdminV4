import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Row, Col, Card, CardHeader, CardBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { fetchCustomerYearlyStatus } from "Services/DashboardService";
import getChartColorsArray from "../../common/data/ChartsDynamicColor";
import { showErrorToast } from "slices/layouts/toastService";

const CustomerMixedChart = ({ dataColors }: any) => {
  const chartMultiColors = getChartColorsArray(dataColors);
  const [series, setSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("last_12_months");
  const [loading, setLoading] = useState<boolean>(false);

  const mapApiResponseToChartData = (data: any) => {
    if (!data || typeof data !== "object") return { months: [], newCustomers: [], repeatedCustomers: [], totalCustomers: [] };

    const months = Object.keys(data) ?? [];
    const newCustomers = months.map((month) => data[month]?.newCustomers ?? 0);
    const repeatedCustomers = months.map((month) => data[month]?.repeatedCustomers ?? 0);
    const totalCustomers = months.map((month) => data[month]?.totalCustomers ?? 0);

    return { months, newCustomers, repeatedCustomers, totalCustomers };
  };

  const fetchData = async (filter: string) => {
    setLoading(true);
    try {
      const response = await fetchCustomerYearlyStatus(filter);

      if (response) {
        const { months, newCustomers, repeatedCustomers, totalCustomers } = mapApiResponseToChartData(response);

        console.log("Months:", months);
        console.log("New Customers:", newCustomers);
        console.log("Repeated Customers:", repeatedCustomers);
        console.log("Total Customers:", totalCustomers);

        setSeries([
          { name: "Repeated Customer", type: "column", data: repeatedCustomers },
          { name: "New Customer", type: "column", data: newCustomers },
          { name: "Total Customer", type: "line", data: totalCustomers },
        ]);
        setCategories(months);
        setTotalCustomers(totalCustomers.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0));
      } else {
        setSeries([]);
        setCategories([]);
        setTotalCustomers(0);
      }
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Something went wrong");
      setSeries([]);
      setCategories([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedFilter);
  }, []);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    fetchData(filter);
  };

  const options: any = {
    chart: { stacked: false, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { width: [1, 1, 4] },
    xaxis: {
      categories: categories.length ? categories : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    yaxis: [{ axisTicks: { show: true }, axisBorder: { show: true, color: "#038edc" }, labels: { style: { colors: "#038edc" } } }],
    tooltip: { fixed: { enabled: true, position: "topLeft", offsetY: 30, offsetX: 60 } },
    legend: { horizontalAlign: "left", offsetX: 40 },
    colors: chartMultiColors,
  };

  if (categories.length === 0 || series.length === 0) {
    return <div className="text-center">No Data Available</div>;
  }

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h4 className="card-title mb-0">Customer Engagement Analysis</h4>
            <UncontrolledDropdown>
              <DropdownToggle tag="a" className="dropdown-btn text-muted" role="button">
                {selectedFilter.replace(/_/g, " ")} <i className="mdi mdi-chevron-down ms-1"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem onClick={() => handleFilterChange("last_12_months")}>Last 12 Months</DropdownItem>
                <DropdownItem onClick={() => handleFilterChange("last_6_months")}>Last 6 Months</DropdownItem>
                <DropdownItem onClick={() => handleFilterChange("last_3_months")}>Last 3 Months</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <ReactApexChart dir="ltr" className="apex-charts" options={options} series={series} type="line" height={350} />
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export { CustomerMixedChart };
