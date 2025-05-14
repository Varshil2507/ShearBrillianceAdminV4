import { APIClient } from './api_helper';
import { Blog } from './type';
import axios from 'axios';

const apiClient = new APIClient();
const NOTIFICATION_ENDPOINT = 'notification';

// Fetch the list of all blog posts
export const fetchNotification = async (page: number, limit: number,search: any): Promise<any> => {
   
    try {
      const response = await axios.get(`${NOTIFICATION_ENDPOINT}`, {
        params: { page, limit,search},
      });
      return response; // Ensure the API response is what you expect
    } catch (error: any) {
      throw new Error("Failed to fetch blogs. Please try again.");
    }
  };
  

// Add a new blog post to the database
export const addNotification = async (notificationData: FormData): Promise<any> => {
    try {
        // Using axios directly to ensure multipart/form-data header is set
        const response = await axios.post(NOTIFICATION_ENDPOINT, notificationData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
      
        return response;
    } catch (error) {
        throw error;
    }
};

// Update an existing blog post's data (with FormData to handle file uploads)
export const updateNotification = async (id: number, formData: FormData): Promise<Notification> => {
    try {
        
        const response:any = await axios.post(`${NOTIFICATION_ENDPOINT}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// // Delete a blog post by its ID
// export const deleteBlog = async (id: number): Promise<void> => {
//     try {
//         await apiClient.delete(`${BLOG_ENDPOINT}/${id}`);
//     } catch (error) {
//         throw error;
//     }
// };
