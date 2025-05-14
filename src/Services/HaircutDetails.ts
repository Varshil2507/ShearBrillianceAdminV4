import axios from 'axios';
import { APIClient } from './api_helper';
import { HaircutDetail } from './type'; // Import your type definition for HaircutDetail

const apiClient = new APIClient();
const HAIRCUT_DETAILS_ENDPOINT = 'haircut-details'; // Assuming 'haircuts' is the endpoint for haircut details

// Fetch the list of all haircut details
export const fetchHaircutDetails = async (): Promise<any> => {
    try {
        const response = await axios.get(HAIRCUT_DETAILS_ENDPOINT);
        return response; // Return the haircut details data
    } catch (error) {
        // console.error("Error fetching haircut details:", error);
        throw error; // Rethrow for handling in the calling function
    }
};

// Example of adding a new haircut detail
export const addHaircutDetail = async (haircutData: Omit<any, 'id'>): Promise<any> => {
    try {
        const response = await apiClient.create(HAIRCUT_DETAILS_ENDPOINT, haircutData);
        return response; // Return the newly created haircut detail
    } catch (error) {
        // console.error("Error adding haircut detail:", error);
        throw error; // Rethrow for handling
    }
};

// Example of updating an existing haircut detail
export const updateHaircutDetail = async (id: number, haircutData: Omit<HaircutDetail, 'id'>): Promise<HaircutDetail> => {
    try {
        const response = await apiClient.put(`${HAIRCUT_DETAILS_ENDPOINT}/${id}`, haircutData);
        return response.data; // Return the updated haircut detail
    } catch (error) {
        // console.error("Error updating haircut detail:", error);
        throw error; // Rethrow for handling
    }
};

// Example of deleting a haircut detail by its ID
export const deleteHaircutDetail = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${HAIRCUT_DETAILS_ENDPOINT}/${id}`);
    } catch (error) {
        // console.error("Error deleting haircut detail:", error);
        throw error; // Rethrow for handling
    }
};
