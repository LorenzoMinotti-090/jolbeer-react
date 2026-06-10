import axios from "axios";
import { normalizeProductPayload, normalizeProductsPayload } from "../services/productService.js";
import { backendUrl as defaultBackendUrl } from "../services/appConfig.js";

export async function fetchProducts({ backendUrl, page = 1, limit = 200 } = {}) {
  const resolvedBackendUrl = backendUrl ?? defaultBackendUrl;
  const response = await axios.get(`${resolvedBackendUrl}/api/products`, {
    params: { page, limit },
  });

  return normalizeProductsPayload(response.data);
}

export async function fetchProductById({ backendUrl, id }) {
  const resolvedBackendUrl = backendUrl ?? defaultBackendUrl;
  const response = await axios.get(`${resolvedBackendUrl}/api/products/${id}`);
  return normalizeProductPayload(response.data);
}