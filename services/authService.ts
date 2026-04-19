import api, { setAccessToken } from "./api";
import axios from "axios";

export interface LoginRequest {
  login: string; 
  senha: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post("/auth/login", data);
    if (response.data?.token) {
      setAccessToken(response.data.token);
    } else {
      console.warn('[AuthService] Token não encontrado na resposta de login');
    }
    return response.data;
  },

  logout: async () => {
    try {
      // 1. Chama a nossa rota interna de API para limpar os cookies HttpOnly
      await api.post("/auth/logout");
      
    } catch (error) {
      console.error("Logout process error", error);
    } finally {
      // 2. Limpa o estado local e redireciona
      setAccessToken(null);
      window.location.href = "/login";
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },
};
