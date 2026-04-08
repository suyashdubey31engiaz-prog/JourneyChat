import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = axios.create({ baseURL: `${BASE_URL}/api` });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;
    if (status === 401 && (code === "TOKEN_EXPIRED" || code === "TOKEN_INVALID" || code === "NO_TOKEN")) {
      localStorage.removeItem("token");
      const onAuthPage = ["/login","/register"].some(p => window.location.pathname.startsWith(p));
      if (!onAuthPage) setTimeout(() => { window.location.href = "/login"; }, 100);
    }
    return Promise.reject(error);
  }
);
export const registerUser    = (payload)  => API.post("/auth/register", payload);
export const loginUser       = (payload)  => API.post("/auth/login",    payload);
export const getLoggedInUser  = ()         => API.get("/users/me");
export const getAllUsers       = ()         => API.get("/users");
export const uploadAvatar     = (fd)       => API.post("/users/avatar", fd, { headers:{"Content-Type":"multipart/form-data"} });
export const updateProfile    = (payload)  => API.put("/users/profile",  payload);
export const changePassword   = (payload)  => API.put("/users/password", payload);
export const getMessages      = (userId)    => API.get(`/messages/${userId}`);
export const deleteMessage    = (mid)       => API.delete(`/messages/${mid}`);
export const getAgoraToken    = (ch)        => API.get(`/agora/token?channel=${ch}`);
export const getWhiteboard    = (id)        => API.get(`/whiteboard/${id}`);
export const saveWhiteboard   = (id,data)   => API.post(`/whiteboard/${id}`, { imageData:data });
export const deleteWhiteboard = (id)        => API.delete(`/whiteboard/${id}`);
export default API;