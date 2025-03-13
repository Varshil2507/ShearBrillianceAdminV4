import axios from 'axios';
import { APIClient } from './api_helper';

const BARBER_ENDPOINT = 'barber';

const apiClient = new APIClient();
// Fetch the list of all barbers
export const fetchBarber = async (
  page: number,
  limit: any,
  search: any,
  // category?: any
): Promise<any> => {
  try {
    const response = await apiClient.get(`${BARBER_ENDPOINT}/admin`, {
      params: { page, limit, search },
    });
    // Return the entire Axios response object
    return response;
  } catch (error) {
    console.error("Error fetching barbers:", error);
    throw error;
  }
};


// Fetch the list of all appointments
export const fetchAvailableBarber = async (appointmentId: any) => {
  try {
    const response = await axios.get(`${BARBER_ENDPOINT}/available-barbers/${appointmentId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Save transfer appointments
export const saveTransferAppointments = async (appointmentData: any) => {
  try {
    const response = await axios.post(`${BARBER_ENDPOINT}/transfer-appointments`, appointmentData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Add a new barber to the database (with FormData to handle file uploads)
export const addBarber = async (barberData: FormData): Promise<any> => {
  try {
    const response = await axios.post(BARBER_ENDPOINT, barberData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
export const updateBarberStatus = async (userId: number, status: { status: string }): Promise<any> => {
  try {
    const response = await axios.patch(
      `${BARBER_ENDPOINT}/user/${userId}/availability-status`,
      status
    );
    return response; // Return the updated barber data
  } catch (error) {
    throw error;
  }
};
export const updateBarberCategory = async (barberId: number, category: { category: number }): Promise<any> => {
  try {
    const response = await axios.patch(
      `${BARBER_ENDPOINT}/${barberId}/category`,
      category
    );
    return response; // Return the updated barber data
  } catch (error) {
    throw error;
  }
};

// Update an existing barber's data (with FormData to handle file uploads)
export const updateBarber = async (id: number, barberData: FormData): Promise<any> => {
  try {
    const response = await axios.put(`${BARBER_ENDPOINT}/${id}`, barberData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete a barber by their ID
export const deleteBarber = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BARBER_ENDPOINT}/${id}`);
  } catch (error) {
    throw error;
  }
};

export const fetchBarberBySalon = async (salonId: any, category: any): Promise<any> => {
  try {
    
    const response = await apiClient.get(`${BARBER_ENDPOINT}`, {
      params: { salonId, category }, // Update to match the query parameters in the URL
    });
    return response; // Extract and return the data field
  } catch (error) {
    throw error;
  }
};
