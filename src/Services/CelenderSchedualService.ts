import { APIClient } from './api_helper'; // Assuming APIClient is defined to manage axios instance

const apiClient = new APIClient(); // Initialize your API client
const CALENDAR_APPOINTMENTS_ENDPOINT = '/appointments/calendar-appointment'; // Define the endpoint

/**
 * Fetch calendar appointments with optional filters.
 * @param params Query parameters to filter the appointments (e.g., page, limit, startDate, endDate, status, etc.).
 * @returns A promise that resolves to an array of calendar appointment data.
 */
export const fetchCalendarAppointments = async (params: {
   
  startDate?: string;
  endDate?: string;
  search?: string;
  barberId?: number;
  salonId?: number;  

}): Promise<any[]> => {
  try { 
    
    // Fetch data using APIClient with query parameters
    const response:any = await apiClient.get(CALENDAR_APPOINTMENTS_ENDPOINT, {
      params, // Pass query parameters
    });

    // Validate and return the response
    if (Array.isArray(response?.appointments)) {
      return response.appointments; // Return the appointments array
    } else {
      throw new Error('Invalid response format: Expected an array of appointments.');
    }
  } catch (error) {
    // console.error('Error fetching calendar appointments:', error);
    throw error; // Rethrow error for handling in the calling function
  }
};
