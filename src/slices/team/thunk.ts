import { createAsyncThunk } from "@reduxjs/toolkit";

//Include Both Helper File with needed methods
import {
    getTeamData as getTeamDataApi,
    addTeamData as addTeamDataApi,
    updateTeamData as updateTeamDataApi,
    deleteTeamData as deleteTeamDataApi
} from "../../helpers/fakebackend_helper";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";

export const getTeamData = createAsyncThunk("team/getTeamData", async () => {
    try {
        const response = getTeamDataApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addTeamData = createAsyncThunk("team/addTeamData", async (team : any) => {
    try {
        const response = addTeamDataApi(team);
        showSuccessToast("Team Data Added Successfully");
        return response;
    } catch (error) {
        showErrorToast("Team Data Added Failed");
        return error;
    }
});

export const updateTeamData = createAsyncThunk("team/updateTeamData", async (project : any) => {
    try {
        const response = updateTeamDataApi(project);
        showSuccessToast("Team Data Updated Successfully");
        return response;
    } catch (error) {
        showErrorToast("Team Data Updated Failed");
        return error;
    }
});

export const deleteTeamData = createAsyncThunk("team/deleteTeamData", async (team : any) => {
    try {
        const response = deleteTeamDataApi(team);
        showSuccessToast("Team Data Delete Successfully");
        return response;
    } catch (error) {
        showErrorToast("Team Data Delete Failed");
        return error;
    }
});