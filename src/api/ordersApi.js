import axios from "axios";
import { backendUrl as defaultBackendUrl } from "../services/appConfig.js";

export async function createOrder({ backendUrl, payload }) {
  const resolvedBackendUrl = backendUrl ?? defaultBackendUrl;
  const response = await axios.post(`${resolvedBackendUrl}/api/orders`, payload);
  return response.data;
}

export async function fetchOrderById({ backendUrl, id }) {
  const resolvedBackendUrl = backendUrl ?? defaultBackendUrl;
  const response = await axios.get(`${resolvedBackendUrl}/api/orders/${id}`);
  return response.data;
}