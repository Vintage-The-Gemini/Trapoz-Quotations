// frontend/src/services/api.js
// Replace with this enhanced version

import axios from 'axios';

// Create axios instance with configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000, // 15 seconds timeout
    withCredentials: true // Important for cookies/sessions if used
});

// Request interceptor
api.interceptors.request.use(
    config => {
        // Add authorization token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        const { response } = error;
        
        // Handle different error scenarios
        if (response) {
            // Server responded with error
            console.error('API Error:', response.status, response.data);
            
            // Handle specific error codes
            switch (response.status) {
                case 401:
                    // Unauthorized - clear auth and redirect to login
                    localStorage.removeItem('token');
                    // Redirect logic here if needed
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found');
                    break;
                case 503:
                    // Service unavailable
                    console.error('Server currently unavailable');
                    break;
                default:
                    // Other errors
                    console.error(`Error: ${response.status}`);
            }
            
            return Promise.reject(response);
        } else if (error.request) {
            // Network error or no response from server
            console.error('Network Error - No response received:', error.request);
            return Promise.reject({
                status: 0,
                data: { message: 'Network error. Please check your connection.' }
            });
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
            return Promise.reject(error);
        }
    }
);

export default api;