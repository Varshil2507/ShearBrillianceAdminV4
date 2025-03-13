import axios from "axios";
import { APIClient } from "./api_helper";

const BARBER_SESSIONS_ENDPOINT = "barber-sessions";

const apiClient = new APIClient();

// Fetch the list of all barbers
export const fetchBarberSession = async (salonId?: any): Promise<any> => {
  try {
    const response = await apiClient.get(`${BARBER_SESSIONS_ENDPOINT}`, {
      params: { SalonId: salonId },
    });

    // Return the entire Axios response object
    return response;
  } catch (error) {
    console.error("Error fetching barber sessions:", error);
    throw error;
  }
};
export const getTodaysBarber = async (): Promise<any> => {
  try {
    
    const response = await apiClient.get(
      `${BARBER_SESSIONS_ENDPOINT}/today-status`
    );
    return response; // Ensure this returns the expected data
  } catch (error) {
    console.error("Error in getTodaysBarber:", error);
    throw error;
  }
};
// Add a new barber to the database (with FormData to handle file uploads)
export const addBarberSession = async (
  barberSessionData: any
): Promise<any> => {
  try {
    const response = await axios.post(
      `${BARBER_SESSIONS_ENDPOINT}/Create`,
      barberSessionData
    );
    return response;
  } catch (error) {
    console.error("Error adding barber sessions:", error);
    throw error;
  }
};

// Add a new barber to the database (with FormData to handle file uploads)
export const getBarberSessionByBarber = async (
  barberSessionData: any
): Promise<any> => {
  try {
    const response = await axios.post(
      `${BARBER_SESSIONS_ENDPOINT}/barber/find-by-barber-id`,
      barberSessionData
    );
    return response;
  } catch (error) {
    console.error("Error adding barber sessions:", error);
    throw error;
  }
};

// Update an existing barber's data (with FormData to handle file uploads)
export const updateBarberSession = async (
  id: number,
  barberSessionData: any
): Promise<any> => {
  try {
    const response = await axios.put(
      `${BARBER_SESSIONS_ENDPOINT}/${id}`,
      barberSessionData
    );
    return response;
  } catch (error) {
    console.error("Error updating barber sessions:", error);
    throw error;
  }
};

// Delete a barber by their ID
export const deleteBarberSession = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BARBER_SESSIONS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error("Error deleting barber sessions:", error);
    throw error;
  }
};
