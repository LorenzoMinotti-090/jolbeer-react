import { useMemo } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { formatEur } from "../../utils/price.js";

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 6.9;
export const FREE_GIFT_LABEL = "JOLBEER IPA Classica 33cl";

export default function FreeShippingBar() {
  const { totalPrice, cart } = useCart();

  const subtotal = useMemo(() => {
    const numericSubtotal = Number(totalPrice);

    const computed = Number.isFinite(numericSubtotal)
      ? numericSubtotal
      : Array.isArray(cart)
        ? cart.reduce((sum, item) => {
            const price = Number(item?.prezzo) || 0;
            const quantity = Number(item?.quantity) || 0;
            return sum + price * quantity;
          }, 0)
        : 0;

    return Math.round(computed * 100) / 100;
  }, [cart, totalPrice]);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const missingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressValue = isFreeShipping
    ? 100
    : Math.max(0, Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)));

  return (
    <div
      className={`free-shipping-bar alert ${isFreeShipping ? "alert-success" : "alert-warning"} mb-0 rounded-0`}
      role="alert"
    >
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-3">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
            <span className="fw-semibold small text-body">
              {isFreeShipping
                ? `Spedizione gratuita sbloccata 🎉 + Omaggio ${FREE_GIFT_LABEL}`
                : `Aggiungi ancora ${formatEur(missingForFree)} per la spedizione gratuita`}
            </span>

            {isFreeShipping ? (
              <span className="badge text-bg-success-subtle border border-success-subtle text-success-emphasis">
                Spedizione: GRATIS (€ 0,00)
              </span>
            ) : (
              <span className="text-muted small">
                Spedizione: {formatEur(SHIPPING_COST)} | Oltre {formatEur(FREE_SHIPPING_THRESHOLD)} gratuita
              </span>
            )}
          </div>

          <div className="free-shipping-progress w-100">
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={progressValue}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="progress-bar" style={{ width: `${progressValue}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
