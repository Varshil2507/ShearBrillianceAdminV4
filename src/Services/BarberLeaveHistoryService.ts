import  { AxiosResponse } from 'axios';
import { APIClient } from './api_helper'; // Assuming APIClient is already defined


const apiClient = new APIClient();
const LEAVE_HISTORY_ENDPOINT = '/barber-leave/barber';

export const fetchLeaveHistory = async (
  page: number,
  pageSize: any,
  start_date?: string,
  end_date?: string,
  status?: string,
  search?: string
): Promise<any> => {
  try {

    // Build query parameters dynamically
    const params: Record<string, string | number | undefined> = {
      page,
      pageSize,
      start_date,
      end_date,
      status: status && status !== "All" ? status : undefined, // Exclude "All"
      search: search || undefined, // Include search text if provided
    };

    // Send GET request with query parameters
    const response: AxiosResponse<any> = await apiClient.get(LEAVE_HISTORY_ENDPOINT, { params });

    // Check response data
    if (response) {
      return response;
    } else {
      throw new Error('Invalid response: Data field missing.');
    }
  } catch (error) {
    // console.error('Error fetching barber leave history:', error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};
