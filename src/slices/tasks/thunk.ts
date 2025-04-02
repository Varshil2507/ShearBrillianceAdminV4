import { createAsyncThunk } from "@reduxjs/toolkit";

//Include Both Helper File with needed methods
import {
    getTaskList as getTaskListApi,
    addNewTask as addNewTaskApi,
    updateTask as updateTaskApi,
    deleteTask as deleteTaskApi,
} from "../../helpers/fakebackend_helper";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";
export const getTaskList = createAsyncThunk("tasks/getTaskList", async () => {
    try {
        const response = getTaskListApi();
        return response;
    } catch (error) {
        return error;
    }
});
export const addNewTask = createAsyncThunk("tasks/addNewTask", async (task: any) => {
    try {
        const response = addNewTaskApi(task);
        showSuccessToast("Task Added Successfully");
        return response;
    } catch (error) {
        showErrorToast("Task Added Failed");
        return error;
    }
});
export const updateTask = createAsyncThunk("tasks/updateTask", async (task: any) => {
    try {
        const response = updateTaskApi(task);
        showSuccessToast("Task Updated Successfully");
        return response;
    } catch (error) {
        showErrorToast("Task Updated Failed");
        return error;
    }
});
export const deleteTask = createAsyncThunk("tasks/deleteTask", async (task: any) => {
    try {
        const response = deleteTaskApi(task);
        showSuccessToast("Task Updated Successfully");
        return { task, ...response };
    } catch (error) {
        showErrorToast("Task Updated Failed");
        return error;
    }
});
