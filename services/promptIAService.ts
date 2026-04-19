import { PromptIA } from "@/types/prompt-ia";
import api from "./api";

export const promptIAService = {
  getAll: async () => {
    const response = await api.get<PromptIA[]>("/prompt");
    return response.data;
  },
  create: async (data: PromptIA) => {
    const response = await api.post("/prompt", data);
    return response.data;
  },
  update: async (id: number, data: Partial<PromptIA>) => {
    const response = await api.put(`/prompt/atuaprompt/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/prompt/${id}`);
  },
};
