import api from "./axios";

export const register = (data) => api.post("/users/register", data);
export const login = (data) => api.post("/users/login", data);
export const getAllUsers = () => api.get("/users");

export const getProfile = () => api.get("/users/me");
export const updateProfile = (data) => api.put("/users/me", data);
export const changePassword = (data) => api.put("/users/me/password", data);

export const getFavorites = () => api.get("/users/me/favorites");
export const addFavorite = (dogId) => api.post(`/users/me/favorites/${dogId}`);
export const removeFavorite = (dogId) => api.delete(`/users/me/favorites/${dogId}`);
