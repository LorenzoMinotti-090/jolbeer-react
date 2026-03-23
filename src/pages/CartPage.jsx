import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import FreeShippingBanner from "../components/FreeShippingBanner.jsx";
import { FREE_GIFT_LABEL, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../components/FreeShippingBar.jsx";
import { formatEur } from "../utils/price.js";


const FALLBACK_THUMB =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><rect width='100%' height='100%' fill='%23f1f3f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999999' font-family='Arial, sans-serif' font-size='12'>No image</text></svg>";
const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;

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

  useEffect(() => {
    const isAbove = subtotal >= FREE_SHIPPING_THRESHOLD;
    if (isAbove && !wasAboveThresholdRef.current) {
      setShowFreeShippingToast(true);
    }
    wasAboveThresholdRef.current = isAbove;
  }, [subtotal]);

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
    return /^https?:\/\//i.test(path) ? path : `${backendBaseUrl}${path}`;
  };

  if (!cart.length) return <h3>Il carrello è vuoto.</h3>;

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
          <h1 className="mb-3">Carrello</h1>

          {cart.map((item) => (
            <div key={item.id} className="card p-3 mb-3">
              <div className="cart-item-grid">
                <div className="cart-thumb">
                    <Link to={`/prodotti/${item.id}`} state={{ product: item }} className="d-inline-block">
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
                    <h5 className="mb-1">
                      <Link
                        to={`/prodotti/${item.id}`}
                        state={{ product: item }}
                        className="text-decoration-none text-dark"
                      >
                        {item.name || item.nome}
                      </Link>
                    </h5>
                    <div className="text-muted small d-none d-md-inline">{formatEur(item.prezzo)}</div>
                  </div>
                  {item.discount_percent > 0 && (
                    <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
                      <span className="price-old">{formatEur(item.prezzo_originale)}</span>
                      <span className="fw-semibold">{formatEur(item.prezzo)}</span>
                      <span className="fw-semibold">-{item.discount_percent}%</span>
                    </div>
                  )}
                  <div className="text-muted small">
                    Totale riga: <span className="fw-semibold text-dark">{formatEur(item.prezzo * item.quantity)}</span>
                  </div>
                </div>

                <div className="cart-meta">
                  <div className="cart-qty d-flex align-items-center gap-2">
                    <button className="btn btn-outline-dark btn-sm" onClick={() => decreaseQuantity(item.id)}>
                      -
                    </button>
                    <span className="fw-bold">{item.quantity}</span>
                    <button className="btn btn-outline-dark btn-sm" onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>
                  </div>

                  <div className="cart-price text-start text-md-end">
                    <div className="text-muted small">Prezzo</div>
                    <div className="fw-semibold">{formatEur(item.prezzo)}</div>
                  </div>

                  <div className="cart-actions d-flex justify-content-end">
                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                      Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-12 col-lg-4">
          <div className="card p-3 sticky-lg-top" style={{ top: "6.5rem" }}>
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
              <Link className="btn btn-dark" to="/checkout">
                Vai al checkout
              </Link>
              <button className="btn btn-outline-danger" onClick={clearCart}>
                Svuota carrello
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}