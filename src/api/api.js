import axios from "axios";

// 1) BASE_URL 안전 기본값
const BASE_URL = process.env.REACT_APP_API_URL || "/api";

// 2) 공용 axios 인스턴스
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "any-value",
  },
});

api.interceptors.request.use((config) => {
  if (!config.url || typeof config.url !== "string") return config;
  const isAbsolute = /^https?:\/\//i.test(config.url);
  if (!isAbsolute) {
    let u = config.url.startsWith("/") ? config.url.slice(1) : config.url;
    u = u.replace(/^api\//, ""); // 맨 앞의 api/ 한 번만 제거
    config.url = `/${u}`;
  }
  return config;
});


let isRefreshing = false;
let refreshQueue = []; // { resolve, reject }

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

const reissueAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken || refreshToken === "null") {
      throw Object.assign(new Error("No refresh token"), { status: 401 });
    }

    const response = await axios.post(
      `${BASE_URL}/auth/reissue`,
      null,
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data || {};
    if (!accessToken || !newRefreshToken) {
      throw Object.assign(new Error("Invalid reissue payload"), { status: 500 });
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return accessToken;
  } catch (error) {
    // 리프레시 실패는 즉시 세션 정리
    localStorage.clear();
    // hard redirect로 상태 초기화
    window.location.href = "/login";
    throw error;
  }
};

const AUTH_FREE = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/check-email-auth",
  "/auth/check-nickname",
  "/auth/rejoin",
  "/auth/reissue", 
];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const urlStr = typeof config.url === "string" ? config.url : "";
    const isAuthFree = AUTH_FREE.some((u) => urlStr.includes(u));

    if (token && !isAuthFree) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      // 재발급 자체가 401이면 그냥 실패
      if (typeof originalRequest.url === "string" && originalRequest.url.includes("/auth/reissue")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 이미 리프레시 중이면 큐에 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      // 리프레시 시작
      isRefreshing = true;
      try {
        const newAccessToken = await reissueAccessToken(); // 실패 시 내부에서 세션정리/리다이렉트
        processQueue(null, newAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        throw e;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
