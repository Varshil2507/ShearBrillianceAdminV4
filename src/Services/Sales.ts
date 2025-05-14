import { APIClient } from "./api_helper";

const apiClient = new APIClient();
const SALES_ENDPOINT = "Sales";
const CHECKINREVENUE_ENDPOINT = "Sales"; 


// Fetch top services data
export const fetchTopServices = async (): Promise<any> => {
  try {
    const response = await apiClient.get(`${SALES_ENDPOINT}/gettopService`);
    return response; // Return the response directly or response.data as needed
  } catch (error) {
    // console.error("Error fetching top services:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
};
// Fetch Payment data based on method
export const fetchPaymentMethod = async (filter: string): Promise<any> => {
  try {
    const response = await apiClient.get(`${SALES_ENDPOINT}/payment?filter=${filter}`);
    return response; // Return the response directly or response.data as needed
  } catch (error) {
    // console.error("Error fetching top services:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
};

//Fetch sales data based on filter
export const fetchAppointmentSalesData = async (filter: string): Promise<any> => {

  try {
    const response = await apiClient.get(`${SALES_ENDPOINT}/getAppointmentSalesData?filter=${filter}`);
    return response; // Return data assuming it's in `response.data`
  } catch (error) {
    // console.error(`Error fetching sales data for filter: ${filter}`, error);
    throw error;
  }
};


export const fetchWalkInSalesData = async (filter: string): Promise<any> => {
  
  try {
    const response = await apiClient.get(`${CHECKINREVENUE_ENDPOINT}/getWalkInSalesData?filter=${filter}`);
    return response; // Return data assuming it's in `response.data`
  } catch (error) {
    // console.error(`Error fetching sales data for filter: ${filter}`, error);
    throw error;
  }
};


export const fetchSalesPaymentData = async (filter: string): Promise<any> => {
  
  try {
    const response = await apiClient.get(`${CHECKINREVENUE_ENDPOINT}/payment?filter=${filter}`);
    return response; // Return data assuming it's in `response.data`
  } catch (error) {
    // console.error(`Error fetching sales data for filter: ${filter}`, error);
    throw error;
  }
};

export const fetchTopSalon= async (): Promise<any> => {
  try {
 
    const response = await apiClient.get(`${SALES_ENDPOINT}/gettopSalon`);
    return response; // Return the response directly or response.data as needed
  } catch (error) {
    // console.error("Error fetching top services:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
};

export const fetchTopBarber= async (): Promise<any> => {
  try {
 
    const response = await apiClient.get(`${SALES_ENDPOINT}/gettopBarber`);
    return response; // Return the response directly or response.data as needed
  } catch (error) {
    // console.error("Error fetching top services:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
};