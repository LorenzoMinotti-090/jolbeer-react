import { formatEur } from "../utils/price.js";
import { FREE_GIFT_LABEL } from "./FreeShippingBar.jsx";

export default function FreeShippingBanner({ subtotal, threshold = 50, shippingCost = 6.9 }) {
  const numericSubtotal = Math.round((Number(subtotal) || 0) * 100) / 100;
  const isFreeShipping = numericSubtotal >= threshold;
  const missingForFree = Math.max(0, threshold - numericSubtotal);
  const progressValue = isFreeShipping
    ? 100
    : Math.min(100, Math.round((numericSubtotal / threshold) * 100));

  return (
    <div
      className={`alert ${isFreeShipping ? "alert-success" : "alert-warning"} free-shipping-banner mb-3`}
      role="alert"
    >
      <div className="d-flex flex-column gap-1">
        <div className="fw-semibold">
          {isFreeShipping
            ? `Spedizione gratuita sbloccata 🎉 + Omaggio ${FREE_GIFT_LABEL}`
            : `Ti mancano ${formatEur(missingForFree)} per la spedizione gratuita`}
        </div>
        <div className="small text-muted">
          Ordini sopra {formatEur(threshold)}: spedizione gratuita · Adesso: {isFreeShipping ? "GRATIS (€ 0,00)" : formatEur(shippingCost)}
        </div>

        <div className="free-shipping-progress mt-2">
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={progressValue}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="progress-bar" style={{ width: `${progressValue}%` }} />
          </div>
          <div className="small text-muted mt-1">{`Sei al ${progressValue}% del traguardo`}</div>
        </div>
      </div>
    </div>
  );
}
