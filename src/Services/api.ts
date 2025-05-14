// src/services/api.ts

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import config from "../config";

const { api } = config;

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";
const authUser: any = localStorage.getItem("authUser")
const token = JSON.parse(authUser) ? JSON.parse(authUser).token : null;
if (token) {
  axios.defaults.headers['Authorization'] = `Bearer ${token}`;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Network response was not ok');
    }
    return response.json();
};

const handleError = (error: Error) => {
    // console.error('API call failed:', error);
    throw error;
};

export const get = async <T>(endpoint: string): Promise<T> => {
    const url = `${api.API_URL}/${endpoint}`;
    return fetch(url)
        .then(handleResponse)
        .catch(handleError);
};

export const post = async <T, U>(endpoint: string, data: T): Promise<U> => {
    const url = `${api.API_URL}/${endpoint}`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(handleResponse)
    .catch(handleError);
};

export const put = async <T>(endpoint: string, data: T): Promise<void> => {
    const url = `${api.API_URL}/${endpoint}`;
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(handleResponse)
    .catch(handleError);
};

export const del = async (endpoint: string): Promise<void> => {
    const url = `${api.API_URL}/${endpoint}`;
    return fetch(url, {
        method: 'DELETE',
    })
    .then(handleResponse)
    .catch(handleError);
};
