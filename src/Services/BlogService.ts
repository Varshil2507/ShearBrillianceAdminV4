import { APIClient } from './api_helper';
import { Blog } from './type';
import axios from 'axios';

const apiClient = new APIClient();
const BLOG_ENDPOINT = 'blogs';

// Fetch the list of all blog posts
export const fetchBlogs = async (page: number, limit: number,search: any): Promise<any> => {
   
    try {
      const response = await axios.get(`${BLOG_ENDPOINT}`, {
        params: { page, limit,search},
      });
      return response; // Ensure the API response is what you expect
    } catch (error: any) {
      throw new Error("Failed to fetch blogs. Please try again.");
    }
  };
  

// Add a new blog post to the database
export const addBlog = async (blogData: FormData): Promise<any> => {
    try {
        // Using axios directly to ensure multipart/form-data header is set
        const response = await axios.post(BLOG_ENDPOINT, blogData, {
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
export const updateBlog = async (id: number, formData: FormData): Promise<Blog> => {
    try {
        const response = await axios.put(`${BLOG_ENDPOINT}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete a blog post by its ID
export const deleteBlog = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${BLOG_ENDPOINT}/${id}`);
    } catch (error) {
        throw error;
    }
};
