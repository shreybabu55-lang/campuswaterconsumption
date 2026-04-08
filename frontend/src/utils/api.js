import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Use the token for the currently active portal in THIS tab
        const activePortal = sessionStorage.getItem('active_portal') || 'student';
        const token = activePortal === 'admin' 
            ? localStorage.getItem('admin_token') 
            : localStorage.getItem('student_token');
            
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const activePortal = sessionStorage.getItem('active_portal') || 'student';
            if (activePortal === 'admin') {
                const hadToken = !!localStorage.getItem('admin_token');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                if (hadToken) window.location.href = '/admin-portal';
            } else {
                const hadToken = !!localStorage.getItem('student_token');
                localStorage.removeItem('student_token');
                localStorage.removeItem('student_user');
                if (hadToken) window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
