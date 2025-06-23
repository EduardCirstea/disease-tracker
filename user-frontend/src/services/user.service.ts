export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'DOCTOR';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const userService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    return response.json();
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to register');
    }
    return response.json();
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch('/api/users/me');
    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }
    return response.json();
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await fetch('/api/users/me/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!response.ok) {
      throw new Error('Failed to change password');
    }
  }
}; 