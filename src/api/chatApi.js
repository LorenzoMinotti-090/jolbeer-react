import axios from "axios";
import { backendUrl as defaultBackendUrl } from "../services/appConfig.js";

export async function sendChatMessage({ backendUrl, message }) {
  const resolvedBackendUrl = backendUrl ?? defaultBackendUrl;
  const response = await axios.post(`${resolvedBackendUrl}/api/chat`, { message });
  return response.data;
}