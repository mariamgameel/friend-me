import api from "./axios";

export const createAdoptionRequest = (dogId, application = null) =>
  api.post("/adoptions", { dog: dogId, ...(application ? { application } : {}) });

export const getMyRequests = () => api.get("/adoptions/me");
export const cancelMyRequest = (id) => api.put(`/adoptions/${id}/cancel`);

export const getAllRequests = (params) => api.get("/adoptions", { params });
export const updateRequestStatus = (id, status, adminNote = "") =>
  api.put(`/adoptions/${id}`, { status, adminNote });
