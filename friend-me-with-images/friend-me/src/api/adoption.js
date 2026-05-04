import api from "./axios";
export const createAdoptionRequest = (dogId) => api.post("/adoptions", { dog: dogId });
export const getAllRequests = () => api.get("/adoptions");
export const updateRequestStatus = (id, status) => api.put(`/adoptions/${id}`, { status });
