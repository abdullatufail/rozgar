import { api } from "../lib/api";
import { User } from "./auth";

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    return api.get<User[]>("/auth/users");
  },

  async deleteUser(userId: number): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/auth/users/${userId}`);
  }
}; 