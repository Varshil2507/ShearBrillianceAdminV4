import { APIClient } from "./api_helper";
import axios from 'axios'; // Import AxiosError
import { loginAPI, registerAPI, userForgetPassword } from "./url_helper";
import { LoginData, RegisterData } from "./type";

const api = new APIClient();

// ADMIN LOGIN
export const loginUser = async (loginData: LoginData) => {
  try {
    const response = await axios.post(loginAPI, loginData);
    return response; // Return the response data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || { message: 'An unknown error occurred.' };
    } else {
      throw { message: 'An unknown error occurred.' };
    }
  }
};


export const logoutUser = async () => {
  localStorage.removeItem("authUser");
  localStorage.removeItem("authSalonUser");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userCategory");
};

//ADMIN REGISTER
const registerUser = async (userData: RegisterData): Promise<any> => {
  try {
    const response = await axios.post(registerAPI, userData);
    return response; // return the response data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "An error occurred during registration"; // Custom error message
    } else {
      throw { message: 'An unknown error occurred' }; // Fallback error
    }
  }
};

export { registerUser };


export const sendResetPassword = async (email: string) => {
  try {
    const response = await axios.post(userForgetPassword, { email });
    return response.data; // Assuming the response contains a success message
  } catch (error: unknown) {

    if (axios.isAxiosError(error)) {

      if (error.response) {

        throw error.response.data;  // Assuming response contains the error message
      } else if (error.request) {
        // If the request was made but no response received
        throw new Error('No response from server');
      }
    } else {
      // Handle non-Axios errors here (if any)
      throw new Error('An unknown error occurred');
    }
  }
};


// // Gets the logged in user data from local session
// export const getLoggedInUser = () => {
//   const user = localStorage.getItem("user");
//   if (user) return JSON.parse(user);
//   return null;
// };

// // //is user is logged in
// export const isUserAuthenticated = () => {
//   return getLoggedInUser() !== null;
// };

// // Register Method
// export const postRegister = (data : any) => api.create(url.POST_FAKE_REGISTER, data);

// // Login Method
// export const postLogin = (data : any) => api.create(url.POST_FAKE_LOGIN, data);

// // postForgetPwd
// export const postForgetPwd = (data : any) => api.create(url.POST_FAKE_PASSWORD_FORGET, data);

// // Edit profile
// export const postJwtProfile = (data : any) => api.create(url.POST_EDIT_JWT_PROFILE, data);

// export const postProfile = (data : any) => api.update(url.POST_EDIT_PROFILE + '/' + data.idx, data);

// // Register Method
// export const postJwtRegister = (url : string, data  :any) => {
//   return api.create(url, data)
//     .catch(err => {
//       var message;
//       if (err.response && err.response.status) {
//         switch (err.response.status) {
//           case 404:
//             message = "Sorry! the page you are looking for could not be found";
//             break;
//           case 500:
//             message = "Sorry! something went wrong, please contact our support team";
//             break;
//           case 401:
//             message = "Invalid credentials";
//             break;
//           default:
//             message = err[1];
//             break;
//         }
//       }
//       throw message;
//     });
// };

// // Login Method
// export const postJwtLogin = (data : any) => api.create(url.POST_FAKE_JWT_LOGIN, data);

// // postForgetPwd
// export const postJwtForgetPwd = (data : any) => api.create(url.POST_FAKE_JWT_PASSWORD_FORGET, data);

// // postSocialLogin
// export const postSocialLogin = (data : any) => api.create(url.SOCIAL_LOGIN, data);


