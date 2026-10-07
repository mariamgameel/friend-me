import api from "./axios";

export const sendContactMessage = (data) => api.post("/contact", data);
export const getAllMessages = () => api.get("/contact");
export const markMessageRead = (id) => api.put(`/contact/${id}/read`);
export const deleteMessage = (id) => api.delete(`/contact/${id}`);
