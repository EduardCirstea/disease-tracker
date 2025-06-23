import api from './api';
import {jwtDecode} from 'jwt-decode';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  
  // Salvare token și informații utilizator în localStorage
  localStorage.setItem('token', response.data.accessToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUser = (): any => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user && user.role === 'admin';
};
