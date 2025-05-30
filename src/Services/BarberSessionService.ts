import axios from "axios";
import { APIClient } from "./api_helper";

const BARBER_SESSIONS_ENDPOINT = "barber-sessions";

const apiClient = new APIClient();

// Fetch the list of all barbers
export const fetchBarberSession = async (
  salonId?: any,
  category?: any,
  barberId?: any
): Promise<any> => {
  try {
    const url =
      `${BARBER_SESSIONS_ENDPOINT}?SalonId=${salonId ?? ''}&category=${category ?? ''}&barberId=${barberId ?? ''}`;

    const response = await apiClient.get(url);

    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchBarbertodaysSession = async (
  salonId: any,
  category: number = 2
): Promise<any> => {
  try {
    const date = new Date().toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY

    const response = await apiClient.get(BARBER_SESSIONS_ENDPOINT, {
      params: { SalonId: salonId, category, date },
    });

    return response.data;
  } catch (error) {
    // console.error("Error fetching barber sessions:", error);
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
    // console.error("Error in getTodaysBarber:", error);
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
    // console.error("Error adding barber sessions:", error);
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
    // console.error("Error adding barber sessions:", error);
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
    // console.error("Error updating barber sessions:", error);
    throw error;
  }
};

// Delete a barber by their ID
export const deleteBarberSession = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BARBER_SESSIONS_ENDPOINT}/${id}`);
  } catch (error) {
    // console.error("Error deleting barber sessions:", error);
    throw error;
  }
};
