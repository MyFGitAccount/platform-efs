import axios from 'axios';


let baseURL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {

  baseURL = 'http://localhost:3000/api';
} else if (window.location.hostname.includes('vercel.app')) {

  baseURL = '/api';  
  // baseURL = 'https://platform-efs.vercel.app/api';
} else {
  baseURL = '/api';
}

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const sid = localStorage.getItem('sid');
  if (sid) {
    config.headers['x-sid'] = sid;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sid');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
