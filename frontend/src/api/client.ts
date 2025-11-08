import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add interceptors for auth, error handling, etc.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data);
        return Promise.reject(error);
    }
);