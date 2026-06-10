import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../api/productsApi.js";
import { backendUrl, resolveBackendUrl } from "../../services/appConfig.js";
import { formatEur } from "../../utils/price.js";
import { getProductShortDescription } from "../../utils/productCopy.js";

const FALLBACK_IMAGE = "/fallback-product.jpg";

export default function BeerCarousel() {
  const [index, setIndex] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts({ backendUrl, page: 1, limit: 200 })
      .then(({ items }) => {
        setProducts(items);
      })
      .catch(() => {
        setProducts([]);
      });
  }, [backendUrl]);

  const slides = useMemo(() => {
    const list = [...products]
      .filter((p) => p && p.id)
      .sort((a, b) => {
        const scoreA = Number(a?.id) || 0;
        const scoreB = Number(b?.id) || 0;
        return scoreB - scoreA;
      })
      .slice(0, 20);

    return list.slice(0, 12).map((p) => ({
      ...p,
      imageUrl: p.percorso_immagine ? resolveBackendUrl(p.percorso_immagine) : FALLBACK_IMAGE,
    }));
  }, [products, backendUrl]);

  useEffect(() => {
    if (!slides.length) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const total = slides.length || 1;
  const current = slides[index % total];

  const goTo = (nextIndex) => {
    const safe = (nextIndex + total) % total;
    setIndex(safe);
  };

  if (!slides.length) return null;

  return (
    <div className="beer-carousel card border-0">
      <div className="beer-carousel__media">
        {current && (
          <Link
            className="beer-carousel__image-frame"
            to={`/prodotti/${current.id}`}
            state={{ product: current }}
          >
            <img
              src={current.imageUrl}
              alt={current.nome || "Prodotto JOLBEER"}
              className="beer-carousel__image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </Link>
        )}
        <div className="beer-carousel__content">
          <div className="beer-carousel__tags">
            <span className="badge bg-warning text-dark">{current?.stile || current?.categoria || "Box degustazione"}</span>
            {current?.grado_alcolico && <span className="badge bg-light text-dark">ABV {current.grado_alcolico}%</span>}
            {current?.prezzo && <span className="badge bg-light text-dark">{formatEur(current.prezzo)}</span>}
          </div>
          <h2 className="beer-carousel__title">{current?.nome || "Selezione JOLBEER"}</h2>
          <p className="beer-carousel__note">{getProductShortDescription(current)}</p>
          <div className="beer-carousel__actions">
            <Link
              className="btn btn-sm btn-outline-brand"
              to={`/prodotti/${current?.id}`}
              state={{ product: current }}
            >
              Vedi prodotto
            </Link>
            <button
              type="button"
              className="beer-carousel__control"
              onClick={() => goTo(index - 1)}
              aria-label="Birra precedente"
            >
              ‹
            </button>
            <button
              type="button"
              className="beer-carousel__control"
              onClick={() => goTo(index + 1)}
              aria-label="Birra successiva"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="beer-carousel__thumbs">
        {slides.map((product, i) => {
          const active = i === index;
          return (
            <button
              key={product.id || product.nome || i}
              className={`beer-carousel__thumb ${active ? "is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Vai a ${product?.nome || "Box"}`}
            >
              <span className="beer-carousel__thumb-title">{product?.nome || "Box degustazione"}</span>
              <span className="beer-carousel__thumb-meta">{(product?.stile || product?.categoria || "Box degustazione")} · {product?.grado_alcolico ? `${product.grado_alcolico}%` : "Mix"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
