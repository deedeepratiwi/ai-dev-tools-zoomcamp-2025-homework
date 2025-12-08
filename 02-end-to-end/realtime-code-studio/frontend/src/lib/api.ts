import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getOrCreateUser = async (username: string, email: string) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, {
            username,
            email,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to login/create user');
        }
        throw error;
    }
};
