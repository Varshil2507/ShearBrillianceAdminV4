import { APIClient } from './api_helper';

const apiClient = new APIClient();
const LEAVE_STATUS_ENDPOINT = '/barber-leave/status/'; // Replace with the actual leave endpoint

// Update the function signature to accept an object instead of a string
export const updateLeaveStatus = async (
  id: number,
  dataToUpdate: { status: string; response_reason: string }
): Promise<any> => {
  try {
    const response = await apiClient.put(`${LEAVE_STATUS_ENDPOINT}${id}`, dataToUpdate);
    return response; // Return the updated leave data
  } catch (error) {
    // console.error("Error updating leave status:", error);
    throw error;
  }
};
