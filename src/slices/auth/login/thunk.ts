// thunks.ts
import { loginUser } from '../../../Services/AuthService';
import { logoutUser as logoutService } from '../../../Services/AuthService';
import { loginSuccess, apiError, logoutUserSuccess } from '../../../slices/auth/login/reducer';
import { LoginData } from '../../../Services/type';

export const loginAPI = (loginData: LoginData, navigate: (path: string) => void) => {
  return async (dispatch: any) => {
    try {
      const userData: any = await loginUser(loginData);
      localStorage.setItem("authBarberUser", JSON.stringify(userData.barber));
      localStorage.setItem("authSalonUser", JSON.stringify(userData.salon));
      localStorage.setItem("userCategory", userData.categoryType); // Store role in localStorage
      if (userData.user) {
        localStorage.setItem("authUser", JSON.stringify(userData));
        localStorage.setItem("userRole", JSON.stringify(userData.user.role)); // Store role in localStorage
      }
      return userData; // Ensure you return userData here
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch(apiError(errorMessage));
      throw error; // Re-throw error for further handling if needed
    }
  };
};

export const logoutUser = () => {
  return async (dispatch: any) => {
    try {
      await logoutService();
      dispatch(logoutUserSuccess({})); // Ensure {} if logoutUserSuccess requires a payload
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed.';
      dispatch(apiError(errorMessage));
    }
  };
};

export const resetLoginFlag = () => async (dispatch: any) => {
  try {
    const response = dispatch(resetLoginFlag()); // Correct function name
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};





////Include Both Helper File with needed methods
// import { getFirebaseBackend } from "../../../helpers/firebase_helper";
// import {
//   postFakeLogin,
//   postJwtLogin,
// } from "../../../helpers/fakebackend_helper";

// import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from './reducer';

// export const loginUser = (user : any, history : any) => async (dispatch : any) => {
//   try {
//     let response;
//     if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
//       let fireBaseBackend : any = getFirebaseBackend();
//       response = fireBaseBackend.loginUser(
//         user.email,
//         user.password
//       );
//     } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
//       response = postJwtLogin({
//         email: user.email,
//         password: user.password
//       });

//     } else if (process.env.REACT_APP_DEFAULTAUTH) {
//       response = postFakeLogin({
//         email: user.email,
//         password: user.password,
//       });
//     }

//     var data = await response;

//    // if (data) {
//       localStorage.setItem("authUser", JSON.stringify(data));
//       if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
//         var finallogin : any = JSON.stringify(data);
//         finallogin = JSON.parse(finallogin)
//         data = finallogin.data;
//         if (finallogin.status === "success") {
//           dispatch(loginSuccess(data));
//           history('/dashboard')
//         } 
//         else {
//           dispatch(apiError(finallogin));
//         }
//       } else {
//         dispatch(loginSuccess(data));
//         history('/dashboard')
//       }
//     //}
//   } catch (error) {
//     dispatch(apiError(error));
//   }
// };

// export const logoutUser = () => async (dispatch : any) => {
// //   try {
// //     localStorage.removeItem("authUser");
// //     let fireBaseBackend : any = getFirebaseBackend();
// //     if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
// //       const response = fireBaseBackend.logout;
// //       dispatch(logoutUserSuccess(response));
// //     } else {
// //       dispatch(logoutUserSuccess(true));
// //     }

// //   } catch (error) {
// //     dispatch(apiError(error));
// //   }
// };

export const socialLogin = (type: any, history: any) => async (dispatch: any) => {
  //   try {
  //     let response;

  //     if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
  //       const fireBaseBackend : any = getFirebaseBackend();
  //       response = fireBaseBackend.socialLoginUser(type);
  //     }
  //     //  else {
  //       //   response = postSocialLogin(data);
  //       // }

  //       const socialdata = await response;
  //     if (socialdata) {
  //       localStorage.setItem("authUser", JSON.stringify(response));
  //       dispatch(loginSuccess(response));
  //       history('/dashboard')
  //     }

  //   } catch (error) {
  //     dispatch(apiError(error));
  //   }
};

//export const resetLoginFlag = () => async (dispatch : any) => {
//   try {
//     const response = dispatch(reset_login_flag());
//     return response;
//   } catch (error) {
//     dispatch(apiError(error));
//   }
// };