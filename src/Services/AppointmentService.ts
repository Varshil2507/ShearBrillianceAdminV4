import axios from 'axios';

const APPOINTMENT_ENDPOINT = 'appointments';

// Fetch the list of all appointments
export const fetchAppointments = async (page: any, limit: any, startDate: any, endDate: any, status: any, category: any, search: any): Promise<any> => {
    try {
        const statusInfo = status === 'All' ? '' : status;
        const response = await axios.get(`${APPOINTMENT_ENDPOINT}?page=` + page + `&limit=` + limit + `&startDate=` + startDate + `&endDate=` + endDate + `&status=` + statusInfo + `&category=` + category + `&search=` + search ?? '');
        return response;
    } catch (error) {
        throw error;
    }
};

// Fetch the list of all appointments
export const fetchBoardAppointments = async (page: any, limit: any) => {
    try {
        const response = await axios.get(`${APPOINTMENT_ENDPOINT}/board/findAll?page=` + page + `&limit=` + limit);
        return response;
    } catch (error) {
        throw error;
    }
};

// Update an existing role's data
export const updateAppointmentStatus = async (id: number, statusData: any): Promise<void> => {
   
    try {
        await axios.put(`${APPOINTMENT_ENDPOINT}/status/${id}`, statusData);
    } catch (error) {
        throw error;
    }
};

// Update an existing role's data
export const updateAppointmentWaitTime = async (id: number, additionalTime: any): Promise<void> => {
    try {
        await axios.put(`${APPOINTMENT_ENDPOINT}/extend-wait-time/${id}`, additionalTime);
    } catch (error) {
        throw error;
    }
};

// Cancel appointment
export const cancelAppointment = async (id: number): Promise<void> => {
    try {
        await axios.put(`${APPOINTMENT_ENDPOINT}/cancel/${id}`, id);
    } catch (error) {
        throw error;
    }
};

export const createAppointment = async (appointmentData: any): Promise<any> => {

    try {
        const response = await axios.post(`${APPOINTMENT_ENDPOINT}/barber/create`, appointmentData);
        return response;
    } catch (error) {
        throw error;
    }
};
export const deleteAppointment = async (appointmentData: any): Promise<any> => {

    try {
        const response = await axios.put(APPOINTMENT_ENDPOINT, appointmentData);
        return response.data;
    } catch (error) {
        throw error;
    }
};



