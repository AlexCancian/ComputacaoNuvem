import axios from "axios";

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Singleton robusto para evitar múltiplos refreshs paralelos
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) {
        prom.config.headers.Authorization = `Bearer ${token}`;
      }
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      console.log(`[API Interceptor] 401 detectado em ${originalRequest.url}. Verificando renovação única...`);

      try {
        const response = await axios.post("/api/auth/refresh");

        if (response.status === 200) {
          const { token } = response.data;
          setAccessToken(token);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          processQueue(null, token);
          return api(originalRequest);
        } else {
          throw new Error("Sessão expirada");
        }
      } catch (err: any) {
        processQueue(err, null);

        // Se o erro NÃO for de rede, forçamos o logout via API Route
        const isNetworkError = err.message?.includes('aborted') || err.message?.includes('ECONNRESET') || err.message?.includes('Network Error');
        
        if (!isNetworkError) {
          try {
            // Chama a API interna de logout para limpar cookies
            await axios.post("/api/auth/logout");
          } catch (e) {
            console.error("Erro ao chamar API de logout", e);
          } finally {
            setAccessToken(null);
            window.location.href = "/login";
          }
        }
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
