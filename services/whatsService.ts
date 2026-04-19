import api from "./api";

export const whatsService = {
  getStatus: async (): Promise<{ status: string; qrcode?: string }> => {
    const response = await api.get("/whats/status");
    return response.data;
  },

  getQrCode: async (webhookUrl?: string): Promise<{ qrcode: string; message: string }> => {
    // If webhookUrl is needed, pass it as query param
    const params = webhookUrl ? { webhookUrl } : {};
    const response = await api.get("/whats/qrcode", { params });
    return response.data;
  },

  getPairingCode: async (phone: string, webhookUrl?: string): Promise<{ pairingCode: string; message: string }> => {
    const params: Record<string, string> = { phone };
    if (webhookUrl) params.webhookUrl = webhookUrl;

    const response = await api.get("/whats/pairingCode", { params });
    return response.data;
  },

  clearSession: async (): Promise<{ message: string }> => {
    const response = await api.delete("/whats/clearSession");
    return response.data;
  },
};
