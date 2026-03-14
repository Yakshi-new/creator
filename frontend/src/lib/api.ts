import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 and no token in localStorage, redirect to login immediately
        if (error.response?.status === 401 && !localStorage.getItem('accessToken')) {
             window.location.href = '/login';
             return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const data = res.data as any;
                localStorage.setItem('accessToken', data.accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
