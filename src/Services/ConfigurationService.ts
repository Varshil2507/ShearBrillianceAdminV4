import { APIClient } from './api_helper';
import { Customer } from './type';

const apiClient = new APIClient();
const CONFIGURATION_ENDPOINT = 'configurations'; 
// Fetch the list of all users (Read)
export const fetchPaymentConfig = async (): Promise<any> => {
    try {
        const response = await apiClient.get(`${CONFIGURATION_ENDPOINT}/get-payment-config`);
        return response;
    } catch (error) {
        // console.error("Error fetching Payment configuration:", error);
        throw error;
    }
};


// Update an existing customer
export const updatePaymentConfig = async (updatedData: Partial<any>): Promise<any> => {
    try {
        const response = await apiClient.put(`${CONFIGURATION_ENDPOINT}/put-payment-config`, updatedData);
        return response.data;
    } catch (error) {
        // console.error("Error updating Payment configuration:", error);
        throw error;
    }
};



