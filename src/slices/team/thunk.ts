import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Include Both Helper File with needed methods
import {
    getTeamData as getTeamDataApi,
    addTeamData as addTeamDataApi,
    updateTeamData as updateTeamDataApi,
    deleteTeamData as deleteTeamDataApi
} from "../../helpers/fakebackend_helper";

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
        toast.success("Team Data Added Successfully", { autoClose: 2000 });
        return response;
    } catch (error) {
        toast.error("Team Data Added Failed", { autoClose: 2000 });
        return error;
    }
});

export const updateTeamData = createAsyncThunk("team/updateTeamData", async (project : any) => {
    try {
        const response = updateTeamDataApi(project);
        toast.success("Team Data Updated Successfully", { autoClose: 2000 });
        return response;
    } catch (error) {
        toast.error("Team Data Updated Failed", { autoClose: 2000 });
        return error;
    }
});

export const deleteTeamData = createAsyncThunk("team/deleteTeamData", async (team : any) => {
    try {
        const response = deleteTeamDataApi(team);
        toast.success("Team Data Delete Successfully", { autoClose: 2000 });
        return response;
    } catch (error) {
        toast.error("Team Data Delete Failed", { autoClose: 2000 });
        return error;
    }
});