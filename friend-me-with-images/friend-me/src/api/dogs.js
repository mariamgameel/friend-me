import api from "./axios";

export const getAllDogs = (params) => api.get("/dogs", { params });
export const getBreeds = () => api.get("/dogs/breeds");
export const getDogById = (id) => api.get(`/dogs/${id}`);
export const createDog = (data) => api.post("/dogs", data);
export const updateDog = (id, data) => api.put(`/dogs/${id}`, data);
export const deleteDog = (id) => api.delete(`/dogs/${id}`);
