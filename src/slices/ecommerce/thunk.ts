import { createAsyncThunk } from "@reduxjs/toolkit";

//Include Both Helper File with needed methods
import {
  getSellers as getSellersApi,
  getCustomers as getCustomersApi,
  addNewCustomer as addNewCustomerApi,
  updateCustomer as updateCustomerApi,
  deleteCustomer as deleteCustomerApi,
} from "../../helpers/fakebackend_helper";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";

export const getCustomers = createAsyncThunk("ecommerce/getCustomers", async () => {
  try {
    const response = getCustomersApi();
    return response;
  } catch (error) {
    return error;
  }
});

export const updateCustomer = createAsyncThunk("ecommerce/updateCustomer", async (customer:any) => {
  try {
    const response = updateCustomerApi(customer);
    const data = await response;
    showSuccessToast("Customer Updateded Successfully");
    return data;
  } catch (error) {
    showErrorToast("Customer Updateded Failed");
    return error;
  }
});

export const deleteCustomer = createAsyncThunk("ecommerce/deleteCustomer", async (customer:any) => {
  try {
    const response = deleteCustomerApi(customer);
    showSuccessToast("Customer Deleted Successfully");
    return { customer, ...response }
  } catch (error) {
    showErrorToast("Customer Deleted Failed");
    return error;
  }
});

export const addNewCustomer = createAsyncThunk("ecommerce/addNewCustomer", async (customer:any) => {
  try {
    const response = addNewCustomerApi(customer);
    const data = await response;
    showSuccessToast("Customer Added Successfully");
    return data;
  } catch (error) {
    showErrorToast("Customer Added Failed");
    return error;
  }
});