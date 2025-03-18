import { toast } from 'react-toastify';

import { APIClient } from './api_helper'; // Assuming APIClient is already defined
const apiClient = new APIClient();

export const REQUESTED_LEAVES_ENDPOINT = '/barber-leave/all';

export const fetchRequestedLeaves = async (
  page: number,
  pageSize: any,
  start_date?: string,
  end_date?: string,
  status?: string,
  search?: string
): Promise<any[]> => {
  try {

    const params: Record<string, string | number | undefined> = {
      page,
      pageSize,
      start_date,
      end_date,
      status: status && status !== "All" ? status : undefined,
      search: search || undefined,
    };
    const response:any = await apiClient.get(REQUESTED_LEAVES_ENDPOINT, { params });
    return response; // Return only the data array
  } catch (error) {
    toast.error('Error fetching requested leaves', { autoClose: 2000 });
    console.error('Error fetching requested leaves:', error);
    throw error; // Rethrow the error so that it can be handled in the component
  }
};
