import api from "./api";

export interface Job {
  id: number;
  file_url: string;
  status: string;
  idTipoMensagem: number;
  created_at: string;
  qtdRegistros?: number;
  qtdProcessados?: number;
  detalhesErro?: string;
  usuarioInclusao?: string;
  prompt?: {
    idTipoMensagem: number;
    tipo: string;
    prompt: string;
    unidade: string;
    valor: number;
    associado: boolean;
    status: boolean;
  };
}

export const jobService = {
  uploadFile: async (file: File, idTipoMensagem: number): Promise<Job> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("idTipoMensagem", String(idTipoMensagem));

    const response = await api.post("/job/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getJobs: async (): Promise<Job[]> => {
    const response = await api.get("/job");
    // The response might be an object with results or a direct array. 
    // Usually, the API returns the data directly if it's following the pattern of others.
    return response.data;
  },
};
