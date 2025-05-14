import { APIClient } from './api_helper';

const apiClient = new APIClient();
const TIMESLOT_ENDPOINT = 'slots/available';

// Fetch the available time slots
export const fetchTimeSlots = async (BarberId: string, slot_date: string, period: string): Promise<any> => {
    try {
        const response:any = await apiClient.get(TIMESLOT_ENDPOINT, {
            params: { BarberId, slot_date, period },
          });
          return response.slots; // Access the 'data' property
    
        
      
    } catch (error) {
      // console.error("Error fetching time slots:", error);
      throw error;
    }
  };
  