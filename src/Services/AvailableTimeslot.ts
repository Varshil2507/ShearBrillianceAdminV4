import { APIClient } from './api_helper';

const apiClient = new APIClient();
const TIMESLOT_ENDPOINT = 'slots/available';

// Fetch the available time slots
export const fetchTimeSlots = async (BarberId: string, slot_date: string): Promise<any> => {

    try {
        const response = await apiClient.get(`${TIMESLOT_ENDPOINT}`, {
            params: { BarberId, slot_date }, // Update to match the query parameters in the URL
        });
        return response; // Extract and return the data field
    } catch (error) {
        // console.error("Error fetching barbers:", error);
        throw error;
    }
};