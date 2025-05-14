import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Default toast options
const defaultOptions: ToastOptions = {
  autoClose: 2000,
};

// Success Toast
export const showSuccessToast = (message: string, options: ToastOptions = defaultOptions) => {
  toast.success(message, options); // ✅ Call toast.success instead of the function itself
};

// Error Toast
export const showErrorToast = (message: string, options: ToastOptions = defaultOptions) => {
  toast.error(message, options); // ✅ Call toast.error
};

// Warning Toast
export const showWarningToast = (message: string, options: ToastOptions = defaultOptions) => {
  toast.warning(message, options); // ✅ Call toast.warning
};

// Info Toast
export const showInfoToast = (message: string, options: ToastOptions = defaultOptions) => {
  toast.info(message, options); // ✅ Call toast.info
};
