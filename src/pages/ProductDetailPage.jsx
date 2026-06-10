import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { fetchProductById, fetchProducts } from "../api/productsApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useFavourites } from "../context/FavouritesContext.jsx";
import { backendUrl, resolveBackendUrl } from "../services/appConfig.js";
import { toast } from "react-toastify";
import { formatEur } from "../utils/price.js";
import { getPromotion } from "../utils/promotions.js";
import { getProductLongDescription } from "../utils/productCopy.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();
  const location = useLocation();
  const productFromState = location.state?.product;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  const getQty = (pid) => cart.find((item) => item.id === pid)?.quantity || 0;
  const favActive = product ? isFavourite(product.id) : false;

  const handleDecrease = (pid) => {
    const qty = getQty(pid);
    if (qty <= 1) {
      removeFromCart(pid);
    } else {
      decreaseQuantity(pid);
    }
  };

  useEffect(() => {
    let active = true;
    if (productFromState) {
      setProduct(productFromState);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    fetchProductById({ backendUrl, id })
      .then((payload) => {
        if (!active) return;
        setProduct(payload);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.error || err.message || "Errore");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [backendUrl, id]);

  useEffect(() => {
    fetchProducts({ backendUrl, page: 1, limit: 200 })
      .then(({ items }) => {
        setAllProducts(items);
      })
      .catch(() => setAllProducts([]));
  }, [backendUrl]);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    const currentId = product.id;
    const currentStyle = (product.stile || "").toLowerCase();
    const currentCat = product.categoria_id;

    const matches = allProducts.filter((p) => {
      if (p.id === currentId) return false;
      const styleMatch = currentStyle && (p.stile || "").toLowerCase() === currentStyle;
      const catMatch = currentCat && p.categoria_id && p.categoria_id === currentCat;
      return styleMatch || catMatch;
    });

    const fillers = allProducts.filter((p) => p.id !== currentId && !matches.includes(p));
    return [...matches, ...fillers].slice(0, 8);
  }, [product, allProducts]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" aria-label="Caricamento" />
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="alert alert-warning">Prodotto non trovato.</div>;

  const imgUrl = product?.percorso_immagine ? resolveBackendUrl(product.percorso_immagine) : null;
  const description = getProductLongDescription(product);
  const promo = getPromotion(product);
  const savings = promo.hasDiscount ? Math.max(0, promo.originalPrice - promo.currentPrice) : 0;

  return (
    <div className="d-flex flex-column gap-3 gap-md-4">
      <div>
        <Link className="text-decoration-none text-muted" to="/prodotti">← Torna ai prodotti</Link>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-6 position-relative">
          {promo.hasDiscount && (
            <span className="promo-corner-badge promo-corner-badge--detail">PROMO</span>
          )}
          <div className="product-image-frame product-image-frame--detail rounded-4 bg-light overflow-hidden">
            <img
              src={imgUrl || "/fallback-product.jpg"}
              alt={product.nome}
              className="product-image"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/fallback-product.jpg";
              }}
            />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="d-flex flex-column gap-3">
            <div>
              <p className="text-uppercase text-muted small mb-1">{product.stile}</p>
              <h1 className="mb-2">{product.nome}</h1>
              <div className="d-flex flex-wrap product-meta text-muted small">
                <span className={`badge ${product.e_bundle ? "bg-primary" : "bg-secondary"}`}>
                  {product.e_bundle ? "Box" : "Birra"}
                </span>
                <span className="badge badge-soft">{product.contenitore} {product.formato_cl}cl</span>
                <span className="badge badge-soft">{product.grado_alcolico}% ABV</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-1 detail-price-wrap">
              <div className="d-flex align-items-center gap-2 flex-wrap promo-price-block">
                {promo.hasDiscount && (
                  <span className="price-old">{formatEur(promo.originalPrice)}</span>
                )}
                <div className="price price--detail text-dark promo-price-current">{formatEur(promo.currentPrice)}</div>
                {promo.hasDiscount && (
                  <span className="badge deal-badge mb-2">
                    -{promo.discountPercent}%
                  </span>
                )}
              </div>
              {promo.hasDiscount && (
                <div className="save-chip">Offerta attiva: risparmi {formatEur(savings)}</div>
              )}
              <div className="text-muted small">IVA inclusa</div>
            </div>

            <p className="text-muted mb-0">{description}</p>

            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Stile</div>
                    <div className="fw-semibold">{product.stile}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Gradazione</div>
                    <div className="fw-semibold">{product.grado_alcolico}%</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Formato</div>
                    <div className="fw-semibold">{product.contenitore} {product.formato_cl}cl</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-grid d-sm-flex gap-2">
              <button
                className={`btn ${favActive ? "btn-danger" : "btn-outline-secondary"}`}
                type="button"
                onClick={() => toggleFavourite(product)}
                aria-pressed={favActive}
                aria-label={favActive ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                title={favActive ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
              >
                {favActive ? "♥" : "♡"}
              </button>
              {getQty(product.id) === 0 ? (
                <button
                  className="btn btn-dark"
                  onClick={() => {
                    addToCart(product);
                    toast.success("Aggiunto al carrello");
                  }}
                >
                  Aggiungi al carrello
                </button>
              ) : (
                <div className="btn-group" role="group">
                  <button className="btn btn-outline-secondary" onClick={() => handleDecrease(product.id)}>-</button>
                  <span className="btn btn-outline-secondary disabled quantity-chip">{getQty(product.id)}</span>
                  <button className="btn btn-dark" onClick={() => increaseQuantity(product.id)}>+</button>
                </div>
              )}
              <Link className="btn btn-outline-secondary" to="/carrello">Vai al carrello</Link>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Prodotti correlati</h2>
            <Link className="text-decoration-none" to="/prodotti">Vedi tutti</Link>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {relatedProducts.map((item) => {
              const relImg = item?.percorso_immagine
                ? `${backendUrl}${item.percorso_immagine}`
                : "/fallback-product.jpg";
              return (
                <div className="col" key={item.id || item.nome}>
                  <div className="card h-100 product-card">
                    <div className="product-image-frame product-image-frame--grid bg-light rounded-top">
                      <img
                        src={relImg}
                        alt={item.nome}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/fallback-product.jpg";
                        }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column gap-2">
                      <p className="text-uppercase text-muted small mb-1">{item.stile || item.categoria}</p>
                      <h6 className="mb-1" title={item.nome}>{item.nome}</h6>
                      <div className="fw-semibold">{formatEur(item.prezzo)}</div>
                      <Link className="btn btn-outline-secondary btn-sm mt-auto" to={`/prodotti/${item.id}`} state={{ product: item }}>
                        Vai al prodotto
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
