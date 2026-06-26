import { IconHeart, IconMinus, IconPlus, IconShoppingCart } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { fetchProductById, fetchProducts } from "../api/productsApi.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useFavourites } from "../context/FavouritesContext.jsx";
import { backendUrl, resolveBackendUrl } from "../services/appConfig.js";
import { toast } from "react-toastify";
import { formatEur } from "../utils/price.js";
import { getPromotion } from "../utils/promotions.js";
import { getProductLongDescription } from "../utils/productCopy.js";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();
  const location = useLocation();
  const productFromState = (() => {
    const routeProduct = location.state?.product;
    if (!routeProduct) return null;

    return String(routeProduct.slug || routeProduct.id || "") === String(slug)
      ? routeProduct
      : null;
  })();

  const [product, setProduct] = useState(null);
  const [errorState, setErrorState] = useState({ id: null, message: "" });
  const [allProducts, setAllProducts] = useState([]);

  const error = errorState.id === slug ? errorState.message : "";
  const loadedProduct = String(product?.slug || product?.id || "") === String(slug) ? product : null;
  const currentProduct = productFromState || loadedProduct;
  const loading = !currentProduct && !error;

  const getQty = (pid) => cart.find((item) => item.id === pid)?.quantity || 0;
  const favActive = currentProduct ? isFavourite(currentProduct.id) : false;

  useEffect(() => {
    if (productFromState) return undefined;

    let active = true;

    fetchProductById({ backendUrl, id: slug })
      .then((payload) => {
        if (!active) return;
        setProduct(payload);
      })
      .catch((err) => {
        if (active) {
          setErrorState({
            id: slug,
            message: err?.response?.data?.error || err.message || "Errore",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [productFromState, slug]);

  useEffect(() => {
    fetchProducts({ backendUrl, page: 1, limit: 200 })
      .then(({ items }) => {
        setAllProducts(items);
      })
      .catch(() => setAllProducts([]));
  }, []);

  const relatedProducts = useMemo(() => {
    if (!currentProduct || !allProducts.length) return [];
    const currentId = currentProduct.id;
    const currentStyle = (currentProduct.stile || "").toLowerCase();
    const currentCat = currentProduct.categoria_id;

    const matches = allProducts.filter((p) => {
      if (p.id === currentId) return false;
      const styleMatch = currentStyle && (p.stile || "").toLowerCase() === currentStyle;
      const catMatch = currentCat && p.categoria_id && p.categoria_id === currentCat;
      return styleMatch || catMatch;
    });

    const fillers = allProducts.filter((p) => p.id !== currentId && !matches.includes(p));
    return [...matches, ...fillers].slice(0, 8);
  }, [allProducts, currentProduct]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" aria-label="Caricamento" />
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentProduct) return <div className="alert alert-warning">Prodotto non trovato.</div>;

  const imgUrl = currentProduct?.percorso_immagine ? resolveBackendUrl(currentProduct.percorso_immagine) : null;
  const description = getProductLongDescription(currentProduct);
  const promo = getPromotion(currentProduct);
  const savings = promo.hasDiscount ? Math.max(0, promo.originalPrice - promo.currentPrice) : 0;
  const cartQuantity = getQty(currentProduct.id);

  const handleIncreaseCart = () => {
    if (cartQuantity === 0) {
      addToCart(currentProduct);
      toast.success("Aggiunto al carrello");
      return;
    }

    increaseQuantity(currentProduct.id);
    toast.success("Quantità aumentata");
  };

  const handleDecreaseCart = () => {
    if (cartQuantity <= 1) {
      removeFromCart(currentProduct.id);
      toast.success("Rimosso dal carrello");
      return;
    }

    decreaseQuantity(currentProduct.id);
    toast.success("Quantità ridotta");
  };

  const handleToggleFavourite = () => {
    toggleFavourite(currentProduct);
    toast.success(favActive ? "Rimosso dai preferiti" : "Aggiunto ai preferiti");
  };

  return (
    <div className="product-detail-page d-flex flex-column gap-3 gap-md-4">
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
              alt={currentProduct.nome}
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
              <p className="text-uppercase text-muted small mb-1">{currentProduct.stile}</p>
              <h1 className="mb-2">{currentProduct.nome}</h1>
              <div className="d-flex flex-wrap product-meta text-muted small">
                <span className={`badge ${currentProduct.e_bundle ? "badge-brand" : "badge-soft"}`}>
                  {currentProduct.e_bundle ? "Box" : "Birra"}
                </span>
                <span className="badge badge-soft">{currentProduct.contenitore} {currentProduct.formato_cl}cl</span>
                <span className="badge badge-soft">{currentProduct.grado_alcolico}% ABV</span>
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

            <div className="info-card border-0">
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Stile</div>
                    <div className="fw-semibold">{currentProduct.stile}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Gradazione</div>
                    <div className="fw-semibold">{currentProduct.grado_alcolico}%</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Formato</div>
                    <div className="fw-semibold">{currentProduct.contenitore} {currentProduct.formato_cl}cl</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-cta-card info-card p-3 p-md-4">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
                  <div className="quantity-selector" role="group" aria-label="Controllo quantità prodotto nel carrello">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleDecreaseCart}
                      aria-label="Togli una unità dal carrello"
                      disabled={cartQuantity === 0}
                    >
                      <IconMinus size={18} />
                    </button>
                    <span className="quantity-selector__value" aria-live="polite">{cartQuantity}</span>
                    <button
                      type="button"
                      className="btn btn-brand"
                      onClick={handleIncreaseCart}
                      aria-label="Aggiungi una unità al carrello"
                    >
                      <IconPlus size={18} />
                    </button>
                  </div>
                </div>

                <div className="d-grid d-sm-flex gap-2">
                  <button
                    className={`btn ${favActive ? "btn-danger" : "btn-outline-secondary"} d-inline-flex align-items-center justify-content-center gap-2`}
                    type="button"
                    onClick={handleToggleFavourite}
                    aria-pressed={favActive}
                    aria-label={favActive ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                    title={favActive ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                  >
                    <IconHeart size={20} />
                    <span>Preferiti</span>
                  </button>
                  <Link className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2" to="/carrello">
                    <IconShoppingCart size={20} />
                    <span>Carrello</span>
                  </Link>
                </div>
              </div>
            </div>

            <section className="info-card p-4">
              <div className="section-header mb-0">
                <span className="section-kicker">Descrizione completa</span>
                <h2 className="h4 mb-1">Profilo prodotto</h2>
                <p className="mb-0">{currentProduct.descrizione || description}</p>
              </div>
            </section>
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
            {relatedProducts.map((item) => (
              <div className="col" key={item.id || item.nome}>
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
