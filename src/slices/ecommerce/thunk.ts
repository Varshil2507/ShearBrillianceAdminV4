import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Include Both Helper File with needed methods
import {
  getSellers as getSellersApi,
  getCustomers as getCustomersApi,
  addNewCustomer as addNewCustomerApi,
  updateCustomer as updateCustomerApi,
  deleteCustomer as deleteCustomerApi,
} from "../../helpers/fakebackend_helper";

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
    toast.success("Customer Updateded Successfully", { autoClose: 2000 });
    return data;
  } catch (error) {
    toast.error("Customer Updateded Failed", { autoClose: 2000 });
    return error;
  }
});

export const deleteCustomer = createAsyncThunk("ecommerce/deleteCustomer", async (customer:any) => {
  try {
    const response = deleteCustomerApi(customer);
    toast.success("Customer Deleted Successfully", { autoClose: 2000 });
    return { customer, ...response }
  } catch (error) {
    toast.error("Customer Deleted Failed", { autoClose: 2000 });
    return error;
  }
});

export const addNewCustomer = createAsyncThunk("ecommerce/addNewCustomer", async (customer:any) => {
  try {
    const response = addNewCustomerApi(customer);
    const data = await response;
    toast.success("Customer Added Successfully", { autoClose: 2000 });
    return data;
  } catch (error) {
    toast.error("Customer Added Failed", { autoClose: 2000 });
    return error;
  }
});