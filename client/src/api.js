import axios from "axios";
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
const api = axios.create({ baseURL: API_BASE + "/api" });

export const fetchOPCards = (q='') => api.get(`/opcards${q?`?q=${encodeURIComponent(q)}`:''}`).then(r=>r.data);
export const fetchPokeCards = (q='') => api.get(`/pokecards${q?`?q=${encodeURIComponent(q)}`:''}`).then(r=>r.data);
export const unlockOP = (id) => api.patch(`/opcards/${id}/unlock`).then(r=>r.data);
export const unlockPoke = (id) => api.patch(`/pokecards/${id}/unlock`).then(r=>r.data);
