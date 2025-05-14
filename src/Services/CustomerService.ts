import { APIClient } from './api_helper';
import { Customer } from './type';

const apiClient = new APIClient();
const USERS_ENDPOINT = 'users';

// Fetch the list of all users (Read)
export const fetchCustomers = async (): Promise<Customer[]> => {
    try {
      const response = await apiClient.get(USERS_ENDPOINT);
      return response.data.map((customer: any) => ({
        ...customer,
        mobile_number: customer.mobile_number || "", // Fallback to empty string
      }));
    } catch (error) {
    //   console.error("Error fetching customers:", error);
      throw error;
    }
  };
  

// Create a new customer
export const createCustomer = async (customerData: Customer): Promise<Customer> => {
    try {
        const response = await apiClient.create(USERS_ENDPOINT, customerData);
        return response.data; 
    } catch (error) {
        // console.error("Error creating customer:", error);
        throw error; 
    }
};

// Update an existing customer
export const updateCustomer = async (id: number, updatedCustomerData: Partial<Customer>): Promise<Customer> => {
    try {
        const response = await apiClient.put(`${USERS_ENDPOINT}/${id}`, updatedCustomerData);
        return response.data;
    } catch (error) {
        // console.error("Error updating customer:", error);
        throw error;
    }
};


// Delete a customer by ID
export const deleteCustomer = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${USERS_ENDPOINT}/${id}`);
    } catch (error) {
        // console.error("Error deleting customer:", error);
        throw error; 
    }
};

// Add a new customer (Create)
export const addCustomer = async (customerData: Customer): Promise<Customer> => {
    try {
        const response = await apiClient.create(USERS_ENDPOINT, customerData);
        return response.data;
    } catch (error) {
        // console.error("Error adding customer:", error);
        throw error;
    }
};


