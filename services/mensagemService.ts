import { Mensagem } from "@/types/mensagem";
import { PaginatedResponse } from "@/types/pagination";
import api from "./api";

export const mensagemService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: "pendente" | "enviado" | "falhou";
    telefone?: string;
    data?: string;
  }) => {
    const response = await api.get<PaginatedResponse<Mensagem>>(
      "/mensagemEnviada/pagina",
      { params }
    );
    return response.data;
  },
  update: async (id: string, data: Partial<Mensagem>) => {
    const response = await api.put(`/mensagemEnviada/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/mensagemEnviada/${id}`);
  },
};
