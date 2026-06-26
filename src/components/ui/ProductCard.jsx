import { IconEye, IconHeart, IconMinus, IconPlus } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext.jsx";
import { useFavourites } from "../../context/FavouritesContext.jsx";
import { resolveBackendUrl } from "../../services/appConfig.js";
import { formatEur } from "../../utils/price.js";
import { getPromotion } from "../../utils/promotions.js";
import { getProductCardTeaser } from "../../utils/productCopy.js";

export default function ProductCard({ product, variant = "grid", description }) {
  const navigate = useNavigate();
  const { addToCart, cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();

  const quantity = cart.find((item) => item.id === product.id)?.quantity || 0;
  const favouriteActive = isFavourite(product.id);

  const imgUrl = product?.immagine_url
    || (product?.percorso_immagine ? resolveBackendUrl(product.percorso_immagine) : null);

  const styleLabel = product.stile || product.categoria || "Selezione";
  const formatLabel = product.contenitore && product.formato_cl
    ? `${product.contenitore} ${product.formato_cl}cl`
    : product.formato || "Formato variabile";
  const abvLabel = product.grado_alcolico ? `${product.grado_alcolico}% ABV` : "ABV n/d";
  const typeLabel = product.e_bundle ? "Box" : "Birra";
  const promo = getPromotion(product);
  const savings = promo.hasDiscount ? Math.max(0, promo.originalPrice - promo.currentPrice) : 0;

  const detailDescription = description || getProductCardTeaser(product);
  const detailPath = `/prodotti/${product.slug || product.id}`;
  const containerLabel = product.contenitore || product.formato || "Formato";
  const stockLabel = quantity > 0 ? `${quantity} nel carrello` : currentActionLabel(product);

  function currentActionLabel(item) {
    return item.e_bundle ? "Box degustazione" : "Craft selection";
  }

  const shouldSkipCardNavigation = (target) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("[data-no-card-nav='true'], a, button, input, select, textarea, label"));
  };

  const openProductDetail = () => {
    navigate(detailPath, { state: { product } });
  };

  const handleCardClick = (event) => {
    if (shouldSkipCardNavigation(event.target)) return;
    openProductDetail();
  };

  const handleCardKeyDown = (event) => {
    if (shouldSkipCardNavigation(event.target)) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProductDetail();
    }
  };

  const handleAdd = () => {
    if (quantity === 0) {
      addToCart(product);
      toast.success("Aggiunto al carrello");
      return;
    }

    increaseQuantity(product.id);
    toast.success("Quantità aumentata");
  };

  const handleRemove = () => {
    if (quantity <= 1) {
      removeFromCart(product.id);
      toast.success("Rimosso dal carrello");
      return;
    }

    decreaseQuantity(product.id);
    toast.success("Quantità ridotta");
  };

  const handleToggleFavourite = () => {
    toggleFavourite(product);
    toast.success(favouriteActive ? "Rimosso dai preferiti" : "Aggiunto ai preferiti");
  };

  const renderActions = (size) => {
    const spacingClass = size === "sm" ? "mt-1" : "mt-3 mt-auto";
    const responsiveGrid = size === "sm" ? "d-md-grid" : "";

    return (
      <div className={`d-grid gap-2 ${spacingClass} ${responsiveGrid}`} data-no-card-nav="true">
        <div className={`btn-group ${size === "sm" ? "btn-group-sm" : ""}`} role="group" aria-label="Controllo quantità prodotto">
          <button
            className="btn btn-outline-secondary"
            onClick={handleRemove}
            aria-label="Togli una unità dal carrello"
            disabled={quantity === 0}
          >
            <IconMinus size={18} />
          </button>
          <span className="btn btn-outline-secondary disabled quantity-chip" aria-live="polite">{quantity}</span>
          <button
            className="btn btn-brand"
            onClick={handleAdd}
            aria-label="Aggiungi una unità al carrello"
          >
            <IconPlus size={18} />
          </button>
        </div>
      </div>
    );
  };

  if (variant === "list") {
    return (
      <div
        className={`card product-card product-card--clickable position-relative ${promo.hasDiscount ? "product-card--deal" : ""}`}
        role="link"
        tabIndex={0}
        aria-label={`Apri il dettaglio di ${product.nome}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
      >
        {promo.hasDiscount && (
          <span className="promo-corner-badge" data-no-card-nav="true">PROMO</span>
        )}
        <div className="card-body list-card">
          <div className="list-thumb">
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

          <div className="list-info">
            <p className="text-uppercase text-muted small mb-1">{styleLabel}</p>
            <h5 className="list-title" title={product.nome}>{product.nome}</h5>
            <div className="d-flex flex-wrap product-meta text-muted small mb-1">
              <span className="badge badge-soft">{formatLabel}</span>
              <span className="badge badge-soft">{abvLabel}</span>
              <span className={`badge ${product.e_bundle ? "badge-brand" : "badge-soft"}`}>{typeLabel}</span>
            </div>
            <div className="small text-muted mb-2">{containerLabel} · {stockLabel}</div>
            <div className="list-row">
              <p className="list-desc text-muted small mb-0">{detailDescription}</p>
              <div className="list-price-inline text-dark d-flex align-items-center justify-content-center text-center gap-2 flex-wrap promo-price-block promo-price-block--list">
                {promo.hasDiscount && (
                  <span className="price-old">{formatEur(promo.originalPrice)}</span>
                )}
                <span className="price promo-price-current">{formatEur(promo.currentPrice)}</span>
                {promo.hasDiscount && (
                  <span className="save-chip">Risparmi {formatEur(savings)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="list-actions" data-no-card-nav="true">
            <div className="d-flex align-items-center gap-2">
              <Link
                className="btn btn-sm btn-outline-secondary"
                to={detailPath}
                state={{ product }}
                aria-label="Dettagli prodotto"
                title="Dettagli prodotto"
              >
                <IconEye size={20} />
              </Link>
              <button
                className={`btn btn-sm ${favouriteActive ? "btn-danger" : "btn-outline-secondary"}`}
                onClick={handleToggleFavourite}
                aria-pressed={favouriteActive}
                aria-label="Preferito"
              >
                <IconHeart size={20} />
              </button>
            </div>
            {renderActions("sm")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card product-card product-card--clickable position-relative h-100 ${promo.hasDiscount ? "product-card--deal" : ""}`}
      role="link"
      tabIndex={0}
      aria-label={`Apri il dettaglio di ${product.nome}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {promo.hasDiscount && (
        <span className="promo-corner-badge" data-no-card-nav="true">PROMO</span>
      )}
      <div className="position-absolute top-0 end-0 m-2 d-flex align-items-center gap-2" data-no-card-nav="true">
        <Link
          className="btn btn-sm btn-outline-secondary"
          to={detailPath}
          state={{ product }}
          aria-label="Dettagli prodotto"
          title="Dettagli prodotto"
        >
          <IconEye size={20} />
        </Link>
        <button
          className={`btn btn-sm ${favouriteActive ? "btn-danger" : "btn-outline-secondary"}`}
          onClick={handleToggleFavourite}
          aria-pressed={favouriteActive}
          aria-label="Preferito"
        >
          <IconHeart size={20} />
        </button>
      </div>
      <div className="product-image-frame product-image-frame--grid bg-light rounded-top">
        <img
          src={imgUrl || "/fallback-product.jpg"}
          alt={product.nome}
          className="product-image img-fluid"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/fallback-product.jpg";
          }}
        />
      </div>
      <div className="card-body d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="d-flex flex-column">
            <p className="text-uppercase text-muted small mb-1">{styleLabel}</p>
            <h5 className="card-title mb-1 product-title" title={product.nome}>{product.nome}</h5>
            <div className="small text-muted product-subtitle">{containerLabel} · {abvLabel}</div>
          </div>
        </div>
        <div className="d-flex flex-wrap product-meta text-muted small">
          <span className="badge badge-soft">{formatLabel}</span>
          <span className="badge badge-soft">{abvLabel}</span>
          <span className={`badge ${product.e_bundle ? "badge-brand" : "badge-soft"}`}>{typeLabel}</span>
        </div>
        <div className="text-muted small product-description">{detailDescription}</div>
        <div className="mt-auto d-flex flex-column gap-2">
          <div className="promo-strip promo-strip--card">
            <div className="d-flex align-items-center justify-content-center text-center gap-2 flex-wrap promo-price-block promo-price-block--card">
              {promo.hasDiscount && (
                <span className="price-old">{formatEur(promo.originalPrice)}</span>
              )}
              <span className="price price--card text-dark promo-price-current">{formatEur(promo.currentPrice)}</span>
              {promo.hasDiscount && (
                <span className="save-chip">Risparmi {formatEur(savings)}</span>
              )}
            </div>
            {promo.hasDiscount && (
              <span className="badge deal-badge promo-strip-badge">
                -{promo.discountPercent}%
              </span>
            )}
          </div>
          {renderActions()}
        </div>
      </div>
    </div>
  );
}
