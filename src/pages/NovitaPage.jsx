import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/productsApi.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import { getPromotion } from "../utils/promotions.js";
import { backendUrl } from "../services/appConfig.js";

export default function NovitaPage() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setProducts(null);
    setError("");

    fetchProducts({ backendUrl, page: 1, limit: 1000 })
      .then(({ items }) => {
        setProducts(items);
      })
      .catch((err) => setError(err?.message || "Errore caricamento novita"));
  }, [backendUrl]);

  const latestNonDiscounted = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return [...products]
      .filter((p) => {
        const promo = getPromotion(p);
        return !promo.hasDiscount && !p.e_bundle;
      })
      .sort((a, b) => {
        const dateA = a?.data_creazione ? new Date(a.data_creazione).getTime() : 0;
        const dateB = b?.data_creazione ? new Date(b.data_creazione).getTime() : 0;
        if (dateA || dateB) return dateB - dateA;
        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
      })
      .slice(0, 12);
  }, [products]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!products) return <div>Caricamento...</div>;

  return (
    <div className="d-flex flex-column gap-4">
      <div className="bg-white border rounded-4 p-3 p-md-4 shadow-sm">
        <p className="text-uppercase text-muted small mb-1">Nuovi arrivi</p>
        <h1 className="mb-2">Novita JOLBEER</h1>
        <p className="mb-0 text-muted">
          Una selezione di birre non scontate appena inserite in catalogo, scelte per offrire varieta e qualita.
        </p>
      </div>

      {latestNonDiscounted.length === 0 ? (
        <div className="alert alert-warning">Nessuna novita disponibile al momento.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 g-md-4">
          {latestNonDiscounted.map((product) => (
            <div className="col" key={product.id || product.nome}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
