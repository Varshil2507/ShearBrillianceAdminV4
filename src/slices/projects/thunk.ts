import { createAsyncThunk } from "@reduxjs/toolkit";

//Include Both Helper File with needed methods
import {
    getProjectList as getProjectListApi,
    addProjectList as addProjectListApi,
    updateProjectList as updateProjectListApi,
    deleteProjectList as deleteProjectListApi
} from "../../helpers/fakebackend_helper";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";

export const getProjectList = createAsyncThunk("projects/getProjectList", async () => {
    try {
        const response = getProjectListApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addProjectList = createAsyncThunk("projects/addProjectList", async (project:any) => {
    try {
        const response = addProjectListApi(project);
        const data = await response;
        showSuccessToast("project-list Added Successfully");
        return data;
    } catch (error) {
        showErrorToast("project-list Added Failed");
        return error;
    }
});

export const updateProjectList = createAsyncThunk("projects/updateProjectList", async (project:any) => {
    try {
        const response = updateProjectListApi(project);
        const data = await response;
        showSuccessToast("project-list Updated Successfully");
        return data;
    } catch (error) {
        showErrorToast("project-list Updated Failed");
        return error;
    }
});

export const deleteProjectList = createAsyncThunk("projects/deleteProjectList", async (data:any) => {
    try {
        const response = deleteProjectListApi(data);
        const newdata = await response;
        showSuccessToast("project-list Delete Successfully");
        return newdata;
    } catch (error) {
        showErrorToast("project-list Delete Failed");
        return error;
    }
});