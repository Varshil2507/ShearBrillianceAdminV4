import axios from "axios";
import { APIClient } from "./api_helper";
import { User } from "./type";
import { useDebugValue } from "react";

const apiClient = new APIClient();
const USERS_ENDPOINT = "users";

// Fetch the list of all users (Read)

export const fetchUsers = async (salonId = null, type = "customer", page = 1, limit = 10, search: any, roleName?: string): Promise<any> => {
  try {
    const response = await apiClient.get(USERS_ENDPOINT, {
      params: {
        salonId,
        type,
        page,
        limit,
        search,
        roleName, // Add role filter here
      },
    });
    return response;
  } catch (error) {
    // console.error("Error fetching users:", error);
    throw error;
  }
};

// Fetch the list of all users (Read)
export const fetchUserById = async (userId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`${USERS_ENDPOINT}/${userId}`, {
      params: {
        id: userId,
      },
    });
    return response;
  } catch (error) {
    // console.error("Error fetching users:", error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData: any): Promise<any> => {
  try {
    const response = await axios.post(USERS_ENDPOINT, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    // console.error("Error creating user:", error);
    throw error;
  }
};

// Update an existing user with FormData
export const updateUser = async (
  id: number,
  updatedUserData: FormData
): Promise<User> => {
  try {
    const response = await axios.put(
      `${USERS_ENDPOINT}/${id}`,
      updatedUserData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    // console.error("Error updating user:", error);
    throw error;
  }
};

// // Update an existing user
export const updatePatchUser = async (
  id: number,
  updatedUserData: Partial<any>
): Promise<any> => {
  try {
    const response = await axios.patch(
      `${USERS_ENDPOINT}/update/${id}`,
      updatedUserData
    );
    return response;
  } catch (error) {
    // console.error("Error updating user:", error);
    throw error;
  }
};

// Delete a user by ID
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${USERS_ENDPOINT}/${id}`);
  } catch (error) {
    // console.error("Error deleting user:", error);
    throw error;
  }
};

// Add a new user (Create)
export const addUser = async (userData: User): Promise<User> => {
  try {
    const response = await apiClient.create(USERS_ENDPOINT, userData);
    return response.data;
  } catch (error) {
    // console.error("Error adding user:", error);
    throw error;
  }
};

// Add a new user (Create)
export const changePassword = async (userData: any): Promise<any> => {
  try {
    const response = await apiClient.create(
      `${USERS_ENDPOINT}/change-password`,
      userData
    );
    return response;
  } catch (error) {
    // console.error("Error change password:", error);
    throw error;
  }
};
