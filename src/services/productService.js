export function normalizeProductsPayload(payload) {
  const safePayload = payload || {};
  const items = Array.isArray(safePayload?.prodotti)
    ? safePayload.prodotti
    : Array.isArray(safePayload?.items)
      ? safePayload.items
      : Array.isArray(safePayload)
        ? safePayload
        : [];

  return {
    items,
    total: Number(safePayload?.totale) || items.length,
  };
}

export function normalizeProductPayload(payload) {
  return payload?.prodotto || payload || null;
}