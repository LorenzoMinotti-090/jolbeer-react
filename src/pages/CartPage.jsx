import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import FreeShippingBanner from "../components/ui/FreeShippingBanner.jsx";
import { FREE_GIFT_LABEL, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../components/ui/FreeShippingBar.jsx";
import { resolveBackendUrl } from "../services/appConfig.js";
import { formatEur } from "../utils/price.js";


const FALLBACK_THUMB =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><rect width='100%' height='100%' fill='%23f1f3f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999999' font-family='Arial, sans-serif' font-size='12'>No image</text></svg>";

export default function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
  } = useCart();

  const subtotal = Number(totalPrice) || 0;
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const isFreeShipping = roundedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const grandTotal = Math.round((roundedSubtotal + shipping) * 100) / 100;
  const [showFreeShippingToast, setShowFreeShippingToast] = useState(false);
  const wasAboveThresholdRef = useRef(isFreeShipping);

  const syncFreeShippingState = (nextCart) => {
    const nextSubtotal = nextCart.reduce((sum, item) => sum + Number(item.prezzo || 0) * Number(item.quantity || 0), 0);
    const isAbove = nextSubtotal >= FREE_SHIPPING_THRESHOLD;

    if (isAbove && !wasAboveThresholdRef.current) {
      setShowFreeShippingToast(true);
    }

    wasAboveThresholdRef.current = isAbove;
  };

  const handleIncreaseQuantity = (id) => {
    const nextCart = cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
    syncFreeShippingState(nextCart);
    increaseQuantity(id);
  };

  const handleDecreaseQuantity = (id) => {
    const nextCart = cart
      .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))
      .filter((item) => item.quantity > 0);

    syncFreeShippingState(nextCart);
    decreaseQuantity(id);
  };

  const handleRemoveFromCart = (id) => {
    const nextCart = cart.filter((item) => item.id !== id);
    syncFreeShippingState(nextCart);
    removeFromCart(id);
  };

  const handleClearCart = () => {
    syncFreeShippingState([]);
    clearCart();
  };

  useEffect(() => {
    if (!showFreeShippingToast) return;

    const timeoutId = window.setTimeout(() => {
      setShowFreeShippingToast(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showFreeShippingToast]);

  const resolveImageSrc = (item) => {
    const path = item?.image || item?.percorso_immagine || item?.percorsoImmagine;
    if (!path) return FALLBACK_THUMB;
    return resolveBackendUrl(path) || FALLBACK_THUMB;
  };

  if (!cart.length) {
    return (
      <div className="cart-empty section-shell text-center d-flex flex-column gap-3 align-items-center">
        <span className="section-kicker">Carrello</span>
        <h1 className="mb-0">Il carrello è vuoto</h1>
        <p className="mb-0">Aggiungi birre singole o box degustazione per iniziare il tuo ordine.</p>
        <Link className="btn btn-brand btn-lg" to="/prodotti">Torna ai prodotti</Link>
      </div>
    );
  }

  return (
    <>
      {showFreeShippingToast && (
        <div className="free-shipping-toast shadow" role="status" aria-live="polite">
          <div className="d-flex align-items-start gap-2">
            <div className="free-shipping-toast__icon" aria-hidden="true">🎉</div>
            <div className="flex-grow-1">
              <div className="fw-semibold">Spedizione gratuita attiva</div>
              <div className="small text-muted">
                Hai superato la soglia di {formatEur(FREE_SHIPPING_THRESHOLD)}. Omaggio incluso: {FREE_GIFT_LABEL}.
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Chiudi notifica spedizione gratuita"
              onClick={() => setShowFreeShippingToast(false)}
            />
          </div>
        </div>
      )}

      <div className="row gy-3">
        <div className="col-12 col-lg-8">
          <div className="section-shell mb-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <span className="section-kicker">Carrello</span>
                <h1 className="mb-1">Rivedi il tuo ordine</h1>
                <p className="mb-0">Quantità, prezzi e spedizione restano sempre leggibili mentre aggiorni il carrello.</p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Link className="btn btn-outline-secondary" to="/prodotti">Continua gli acquisti</Link>
                <button className="btn btn-outline-danger" onClick={handleClearCart}>Svuota carrello</button>
              </div>
            </div>
          </div>

          {cart.map((item) => (
            <div key={item.id} className="card p-3 mb-3 cart-line-card">
              <div className="cart-item-grid">
                <div className="cart-thumb">
                    <Link to={`/prodotti/${item.slug || item.id}`} state={{ product: item }} className="d-inline-block">
                      <img
                        src={resolveImageSrc(item)}
                        alt={item.name || item.nome}
                        className="cart-thumb__img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_THUMB;
                        }}
                      />
                    </Link>
                </div>

                <div className="cart-info">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <h5 className="mb-1 cart-product-title">
                      <Link
                        to={`/prodotti/${item.slug || item.id}`}
                        state={{ product: item }}
                        className="cart-product-link text-decoration-none"
                      >
                        {item.name || item.nome}
                      </Link>
                    </h5>
                    <div className="text-muted small d-none d-md-inline">{formatEur(item.prezzo)}</div>
                  </div>
                  <div className="cart-product-meta d-flex flex-wrap gap-2 small mb-1">
                    {item.stile && <span className="badge cart-info-badge">{item.stile}</span>}
                    {(item.contenitore || item.formato) && (
                      <span className="badge cart-info-badge">
                        {item.contenitore || item.formato} {item.formato_cl ? `${item.formato_cl}cl` : ""}
                      </span>
                    )}
                    {item.grado_alcolico && <span className="badge cart-info-badge">{item.grado_alcolico}% ABV</span>}
                  </div>
                  {item.discount_percent > 0 && (
                    <div className="small cart-product-pricing d-flex align-items-center gap-2 flex-wrap">
                      <span className="price-old">{formatEur(item.prezzo_originale)}</span>
                      <span className="fw-semibold">{formatEur(item.prezzo)}</span>
                      <span className="fw-semibold">-{item.discount_percent}%</span>
                    </div>
                  )}
                  <div className="cart-row-total small">
                    Totale riga: <span className="fw-semibold text-dark">{formatEur(item.prezzo * item.quantity)}</span>
                  </div>
                </div>

                <div className="cart-meta">
                  <div className="cart-qty d-flex align-items-center gap-2">
                    <button className="btn btn-outline-dark btn-sm" onClick={() => handleDecreaseQuantity(item.id)} aria-label="Riduci quantità">
                      -
                    </button>
                    <span className="fw-bold">{item.quantity}</span>
                    <button className="btn btn-outline-dark btn-sm" onClick={() => handleIncreaseQuantity(item.id)} aria-label="Aumenta quantità">
                      +
                    </button>
                  </div>

                  <div className="cart-price text-start text-md-end">
                    <div className="text-muted small">Prezzo</div>
                    <div className="fw-semibold">{formatEur(item.prezzo)}</div>
                  </div>

                  <div className="cart-actions d-flex justify-content-end">
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveFromCart(item.id)}>
                      Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-12 col-lg-4">
          <div className="card p-3 sticky-lg-top cart-summary-card" style={{ top: "6.5rem" }}>
            <FreeShippingBanner
              key={isFreeShipping ? "free" : "paid"}
              subtotal={roundedSubtotal}
              threshold={FREE_SHIPPING_THRESHOLD}
              shippingCost={SHIPPING_COST}
            />
            <h4 className="mb-3">Riepilogo</h4>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Subtotale</span>
              <span className="price">{formatEur(roundedSubtotal)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Spedizione</span>
              <span className="price">{isFreeShipping ? "GRATIS (€ 0,00)" : formatEur(shipping)}</span>
            </div>
            {isFreeShipping && (
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Omaggio</span>
                <span className="fw-semibold text-success">{FREE_GIFT_LABEL}</span>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
              <span className="fw-semibold">Totale ordine</span>
              <span className="price price--total text-dark">{formatEur(grandTotal)}</span>
            </div>
            <div className="d-grid gap-2">
              <Link className="btn btn-brand" to="/checkout">
                Vai al checkout
              </Link>
              <Link className="btn btn-outline-secondary" to="/prodotti">Aggiungi altri prodotti</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}