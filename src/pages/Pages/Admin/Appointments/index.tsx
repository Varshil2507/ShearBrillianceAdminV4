import React, { useEffect, useState } from 'react';
import { Container, Row } from 'reactstrap';
import BreadCrumb from '../../../../Components/Common/BreadCrumb';
import AppointmentTable from './AppointmentTable';
import Widgets from './Widgets';
import { fetchAppointmentDashboardData } from "Services/DashboardService";
import config from 'config';
import { showErrorToast } from 'slices/layouts/toastService';
export const DASHBOARD_ENDPOINT = "/dashboard";

const { commonText } = config;
const TaskList = () => {
  document.title = `Appointments | ${ commonText.PROJECT_NAME }`;

  const [dashboardData, setDashboardData] = useState<any>(null);
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response: any = await fetchAppointmentDashboardData();
        setDashboardData(response);
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

        <Container fluid>
          <BreadCrumb title="customer data" pageTitle="Appointments" />
          <Row>
            <Widgets dashboard={dashboardData} />
          </Row>
          <AppointmentTable />
        </Container>
      </div>
      
    </React.Fragment>
  );
};

export default TaskList;