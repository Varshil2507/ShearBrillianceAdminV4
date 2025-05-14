import { APIClient } from "./api_helper";

const apiClient = new APIClient();
const DASHBOARD_ENDPOINT = "dashboard";

// Fetch the list of all salons
export const fetchDashboardData = async (): Promise<any> => {
  try {
    const response = await apiClient.get(DASHBOARD_ENDPOINT);
    return response; // Access the 'data' property
  } catch (error) {
    // console.error("Error fetching dashboard dat:", error);
    throw error; // Rethrow to let the calling function handle it
  }
};

// Fetch the list of all salons
export const fetchAppointmentDashboardData = async (): Promise<any> => {
  try {
    const response = await apiClient.get(
      `${DASHBOARD_ENDPOINT}/appointment-dashboard`
    );
    return response; // Access the 'data' property
  } catch (error) {
    // console.error("Error fetching dashboard dat:", error);
    throw error; // Rethrow to let the calling function handle it
  }
};

// Fetch appointment status based on a dynamic filter
export const fetchAppointmentStatus = async (filter: string): Promise<any> => {
  try {
    const response = await apiClient.get(
      `${DASHBOARD_ENDPOINT}/appointment-status`,
      { filter }
    );
    return response; // Access the 'data' property
  } catch (error) {
    // console.error("Error fetching appointment status:", error);
    throw error; // Rethrow to let the calling function handle it
  }
};

export const fetchCutomerStatus = async (filter: string): Promise<any> => {
  try {
    const response = await apiClient.get(
      `${DASHBOARD_ENDPOINT}/customer-status`,
      { filter }
    );
    return response; // Access the 'data' property
  } catch (error) {
    // console.error("Error fetching appointment status:", error);
    throw error; // Rethrow to let the calling function handle it
  }
};

export const fetchCustomerYearlyStatus = async (
  filter: string
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `${DASHBOARD_ENDPOINT}/customer-yearly-status`
    );
    return response;
  } catch (error) {
    // console.error("Error fetching customer yearly status:", error);
    throw error; // Rethrow for handling in calling function
  }
};

export const fetchBarberPayroll = async (
  filterData:  Omit<any, 'id'>
): Promise<any> => {
  try {
    const response = await apiClient.create(`${DASHBOARD_ENDPOINT}/payroll`, filterData);
    return response;
  } catch (error) {
    // console.error("Error fetching customer yearly status:", error);
    throw error; // Rethrow for handling in calling function
  }
};
