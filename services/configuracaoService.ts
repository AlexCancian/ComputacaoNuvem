import api from "./api";
import { DiaSemana, IntervaloFuncionamento, Feriado } from "@/types/configuracao";

export const configuracaoService = {
    // Dias da Semana
    getDias: async (): Promise<DiaSemana[]> => {
        const response = await api.get("/dias");
        return response.data;
    },

    getDiaById: async (id: number): Promise<DiaSemana> => {
        const response = await api.get(`/dias/${id}`);
        return response.data;
    },

    updateDia: async (id: number, data: Partial<DiaSemana>): Promise<DiaSemana> => {
        const response = await api.put(`/dias/atuaDiaSemana/${id}`, data);
        return response.data;
    },

    updateStatusDia: async (id: number, data: Partial<DiaSemana>): Promise<DiaSemana> => {
        const response = await api.patch(`/dias/DiaSemanaStatus/${id}`, data);
        return response.data;
    },
    // Intervalos de Funcionamento
    getIntervalosByDia: async (diaSemana: number): Promise<IntervaloFuncionamento[]> => {
        const response = await api.get(`/intervaloFuncionamento/dia/${diaSemana}`);
        return response.data;
    },

    createIntervalo: async (data: Partial<IntervaloFuncionamento>): Promise<IntervaloFuncionamento> => {
        const response = await api.post("/intervaloFuncionamento", data);
        return response.data;
    },

    updateIntervalo: async (id: number, data: Partial<IntervaloFuncionamento>): Promise<IntervaloFuncionamento> => {
        const response = await api.put(`/intervaloFuncionamento/${id}`, data);
        return response.data;
    },

    updateStatusIntervalo: async (id: number, data: Partial<IntervaloFuncionamento>): Promise<IntervaloFuncionamento> => {
        const response = await api.patch(`/intervaloFuncionamento/status/${id}`, data);
        return response.data;
    },

    deleteIntervalo: async (id: number): Promise<void> => {
        await api.delete(`/intervaloFuncionamento/${id}`);
    },

    // Feriados (Bloqueios)
    getFeriados: async (page: number = 1, limit: number = 25) => {
        const response = await api.get(`/feriado/paginada`, { params: { page, limit } });
        return response.data;
    },

    createFeriado: async (data: Partial<Feriado>): Promise<Feriado> => {
        const response = await api.post("/feriado", data);
        return response.data;
    },

    updateFeriado: async (id: number, data: Partial<Feriado>): Promise<Feriado> => {
        const response = await api.put(`/feriado/atuaFeriado/${id}`, data);
        return response.data;
    },

    deleteFeriado: async (id: number): Promise<void> => {
        await api.delete(`/feriado/${id}`);
    },
};
