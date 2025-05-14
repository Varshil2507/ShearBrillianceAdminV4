import { APIClient } from "./api_helper";

const apiClient = new APIClient();
const TIP_ENDPOINT = "payment/update-tip/";

export const updateTipAmount = async (appointmentId: number, tip: number): Promise<any> => {
  try {
    
    const response = await apiClient.patch(`${TIP_ENDPOINT}${appointmentId}`, {
      tip,
    });
    return response;
  } catch (error) {
    // console.error("Error updating tip:", error);
    throw error;
  }
};
