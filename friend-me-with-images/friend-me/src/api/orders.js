import api from "./axios";

export const createOrder = (data) => api.post("/orders", data);
export const getMyOrders = () => api.get("/orders/me");
export const getAllOrders = (params) => api.get("/orders", { params });
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
