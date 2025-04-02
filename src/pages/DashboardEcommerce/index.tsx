import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Widget from "./Widgets";
import Section from "./Section";
import { fetchDashboardData } from "Services/DashboardService";
import Loader from "Components/Common/Loader";
import ProjectsStatus from "./ProjectsStatus";
import config from "config";
import CustomerStatus from "./CustomerStatus";
import { CustomerMixedChart } from "./CustomerMixedChart";
import { showErrorToast } from "slices/layouts/toastService";

export const DASHBOARD_ENDPOINT = "/dashboard";
const { commonText } = config;

const DashboardEcommerce = () => {
  document.title = `${commonText.PROJECT_NAME} Admin`;
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rightColumn, setRightColumn] = useState<boolean>(true);
  const [showLoader, setShowLoader] = useState(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  useEffect(() => {
    setShowLoader(true);
    const getDashboardData = async () => {
      try {
        const response: any = await fetchDashboardData();
        setDashboardData(response);
        setShowLoader(false);
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
    getDashboardData();
  }, []);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid className="data-section">
          <Row>
            <Col>
              <div className="h-100">
              <                                                      Row>
        {/* First Section */}
        <Col md={12}>

          <Section rightClickBtn={toggleRightColumn} />
        </Col>
      </Row>

                <Row>
                  {showLoader ? (
                    <Loader />
                  ) : (
                    <Widget dashboard={dashboardData} />
                  )}
                </Row>
              </div>
            </Col>
          </Row>
          <div className="d-lg-flex gap-2">
            <ProjectsStatus />
            <CustomerStatus />
            {/* <RevenueStatus /> */}
          </div>

          <CustomerMixedChart />

          {/* <Row>x
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Multiple Y-Axis Charts</h4>
                </CardHeader>
                <CardBody>
                  <CustomerMixedChart dataColors='["--vz-primary", "--vz-info", "--vz-success"]' />
                </CardBody>
              </Card>
            </Col>
          </Row> */}
        </Container>
      </div>

    </React.Fragment>
  );
};

export default DashboardEcommerce;
