import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({ baseURL: `${BASE_URL}/api` });

// Attach JWT token to every request automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const registerUser   = (payload)  => API.post("/auth/register", payload);
export const loginUser      = (payload)  => API.post("/auth/login",    payload);

// Users
export const getLoggedInUser = ()         => API.get("/users/me");
export const getAllUsers      = ()         => API.get("/users");
export const uploadAvatar    = (formData) => API.post("/users/avatar", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// Messages
export const getMessages    = (userId)    => API.get(`/messages/${userId}`);
export const deleteMessage  = (messageId) => API.delete(`/messages/${messageId}`);

// Agora
export const getAgoraToken  = (channel)  => API.get(`/agora/token?channel=${channel}`);

// Whiteboard
export const getWhiteboard    = (boardId) => API.get(`/whiteboard/${boardId}`);
export const saveWhiteboard   = (boardId, imageData) => API.post(`/whiteboard/${boardId}`, { imageData });
export const deleteWhiteboard = (boardId) => API.delete(`/whiteboard/${boardId}`);

export default API;