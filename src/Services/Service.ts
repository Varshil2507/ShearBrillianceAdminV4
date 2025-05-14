import axios from 'axios';
import { APIClient } from './api_helper';

const apiClient = new APIClient();
const SERVICE_ENDPOINT = 'services';

// Fetch the list of all roles
export const fetchServices = async (): Promise<any> => {

    try {
        const response = await apiClient.get(SERVICE_ENDPOINT);
        return response; // Access the 'data' property
    } catch (error) {
        // console.error("Error fetching services:", error);
        throw error; // Rethrow to let the calling function handle it
    }
};

// Add a new service to the database
export const addService = async (serviceData: Omit<any, 'id'>): Promise<any> => {
    try {
        const response = await apiClient.create(SERVICE_ENDPOINT, serviceData);
        return response; // Access the 'data' property
    } catch (error) {
        // console.error("Error adding service:", error);
        throw error;
    }
};

// Update an existing service's data
export const updateService= async (id: number, serviceData: Omit<any, 'id'>): Promise<void> => {
    try {
        await apiClient.put(`${SERVICE_ENDPOINT}/${id}`, serviceData);
    } catch (error) {
        // console.error("Error updating service:", error);
        throw error;
    }
};

// // Update an existing user
export const updatePatchStatus = async (id: number, updatedUserData: Partial<any>): Promise<any> => {
    try {
        const response = await axios.patch(`${SERVICE_ENDPOINT}/${id}/status`, updatedUserData);
        return response;
    } catch (error) {
        // console.error("Error updating status:", error);
        throw error;
    }
};

// Delete a service by its ID
export const deleteService = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${SERVICE_ENDPOINT}/${id}`);
    } catch (error) {
    //   console.error("Error deleting service:", error);
      throw error;
    }
  };
  