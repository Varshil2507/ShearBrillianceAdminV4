import { APIClient } from './api_helper';
import axios from 'axios';

const apiClient = new APIClient();
const SALON_ENDPOINT = 'salon';

// Fetch the list of all salons
export const fetchSalons = async (page: number, limit: any, search: any): Promise<any> => {
  try {
    const response = await apiClient.get(`${SALON_ENDPOINT}/admin`,{
      params:{page,limit,search},
    });

    return response; // Access the 'data' property
  } catch (error) {
    // console.error("Error fetching salons:", error);
    throw error; // Rethrow to let the calling function handle it
  }
};

// Add a new salon to the database
export const addSalon = async (salonData: FormData): Promise<any> => {
   
  try {
    const response = await axios.post(SALON_ENDPOINT, salonData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set Content-Type for FormData
      },
    });
   
    return response; // Access the 'data' property
  } catch (error) {
    // console.error("Error adding salon:", error);
    throw error;
  }
};

// Update an existing salon's data
export const updateSalon = async (id: number, salonData: FormData): Promise<any> => {
  try {
    const response = await axios.put(`${SALON_ENDPOINT}/${id}`, salonData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set Content-Type for FormData
      },
    });
    return response; // Return the updated salon data
  } catch (error) {
    // console.error("Error updating salon:", error);
    throw error;
  }
};

// Update an existing salon's data
export const updateSalonStatus = async (id: number, status: any): Promise<any> => {
  try {
    const response = await axios.patch(`${SALON_ENDPOINT}/status/${id}`, status);
    return response; // Return the updated salon data
  } catch (error) {
    // console.error("Error updating salon:", error);
    throw error;
  }
};

// Delete a salon by its ID
export const deleteSalon = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${SALON_ENDPOINT}/${id}`);
  } catch (error) {
    // console.error("Error deleting salon:", error);
    throw error;
  }
};

// Fetch a single salon by ID


