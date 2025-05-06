import { api } from "../lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

const setTokenCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Strict; secure`;
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse, { email: string; password: string }>("/auth/login", { email, password });
    setTokenCookie(response.token);
    return response;
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse, { name: string; email: string; password: string; role: string }>("/auth/register", {
      name,
      email,
      password,
      role,
    });
    setTokenCookie(response.token);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>("/auth/me");
  },

  async addBalance(amount: number): Promise<User> {
    return api.post<User, { amount: number }>("/auth/add-balance", { amount });
  },
}; 