import { APIClient } from './api_helper';
import { Role } from './type';

const apiClient = new APIClient();
const ROLE_ENDPOINT = 'roles';

// Fetch the list of all roles
export const fetchRoles = async (): Promise<any> => {
    try {
        const response = await apiClient.get(ROLE_ENDPOINT);
        return response; // Access the 'data' property
    } catch (error) {
        // console.error("Error fetching roles:", error);
        throw error; // Rethrow to let the calling function handle it
    }
};

// Add a new role to the database
export const addRole = async (roleData: Omit<any, 'id'>): Promise<any> => {
    try {
        const response = await apiClient.create(ROLE_ENDPOINT, roleData);
        return response; // Access the 'data' property
    } catch (error) {
        // console.error("Error adding role:", error);
        throw error;
    }
};

// Update an existing role's data
export const updateRole = async (id: number, roleData: Omit<Role, 'id'>): Promise<void> => {
    try {
        await apiClient.put(`${ROLE_ENDPOINT}/${id}`, roleData);
    } catch (error) {
        // console.error("Error updating role:", error);
        throw error;
    }
};

// Delete a role by their ID
export const deleteRole = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${ROLE_ENDPOINT}/${id}`);
    } catch (error) {
        // console.error("Error deleting role:", error);
        throw error;
    }
};
