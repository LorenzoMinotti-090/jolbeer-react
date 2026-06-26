import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api/ordersApi.js";
import { useCart } from "../context/CartContext.jsx";
import FreeShippingBanner from "../components/ui/FreeShippingBanner.jsx";
import { FREE_GIFT_LABEL } from "../components/ui/FreeShippingBar.jsx";
import { backendUrl } from "../services/appConfig.js";
import { formatEur } from "../utils/price.js";


const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 6.9;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();

  const subtotal = Number(totalPrice) || 0;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const grandTotal = subtotal + shipping;

  const [cliente, setCliente] = useState({
    nome_completo: "",
    email: "",
    indirizzo: "",
    citta: "",
    cap: "",
    nazione: "Italia",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  function validate(values) {
    const nextErrors = {};

    if (!values.nome_completo.trim() || values.nome_completo.trim().length < 3) {
      nextErrors.nome_completo = "Inserisci nome e cognome completi.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Inserisci un indirizzo email valido.";
    }

    if (!values.indirizzo.trim() || values.indirizzo.trim().length < 5) {
      nextErrors.indirizzo = "Inserisci un indirizzo completo.";
    }

    if (!values.citta.trim() || values.citta.trim().length < 2) {
      nextErrors.citta = "Inserisci la città.";
    }

    if (!/^\d{5}$/.test(values.cap.trim())) {
      nextErrors.cap = "Il CAP deve contenere 5 cifre.";
    }

    if (!values.nazione.trim() || values.nazione.trim().length < 2) {
      nextErrors.nazione = "Inserisci la nazione.";
    }

    return nextErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const nextValues = { ...cliente, [name]: value };
    setCliente(nextValues);

    if (touched[name]) {
      const nextErrors = validate(nextValues);
      setFieldErrors((prev) => ({ ...prev, [name]: nextErrors[name] }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const nextErrors = validate(cliente);
    setFieldErrors((prev) => ({ ...prev, [name]: nextErrors[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Il carrello è vuoto.");
      return;
    }

    const nextErrors = validate(cliente);
    setFieldErrors(nextErrors);
    setTouched({
      nome_completo: true,
      email: true,
      indirizzo: true,
      citta: true,
      cap: true,
      nazione: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setError("Controlla i campi evidenziati prima di confermare l'ordine.");
      return;
    }

    const payload = {
      cliente,
      items: cart.map((i) => ({
        prodotto_id: i.id,
        quantita: i.quantity,
        discount_percent: Number(i.discount_percent) || 0,
      })),
    };

    try {
      setLoading(true);
      const res = await createOrder({ backendUrl, payload });
      clearCart();
      navigate(`/ordine/${res.ordine_id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Errore");
    } finally {
      setLoading(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="section-shell text-center d-flex flex-column gap-3 align-items-center">
        <span className="section-kicker">Checkout</span>
        <h1 className="mb-0">Non ci sono prodotti da ordinare</h1>
        <p className="mb-0">Aggiungi prima qualche birra o un box degustazione dal catalogo.</p>
        <Link className="btn btn-brand" to="/prodotti">Vai ai prodotti</Link>
      </div>
    );
  }

  const renderField = ({ label, name, type = "text", placeholder, colClass }) => (
    <div className={colClass}>
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        className={`form-control ${fieldErrors[name] ? "is-invalid" : ""}`}
        type={type}
        name={name}
        value={cliente[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required
        aria-invalid={fieldErrors[name] ? "true" : "false"}
      />
      {fieldErrors[name] && <div className="invalid-feedback">{fieldErrors[name]}</div>}
    </div>
  );

  return (
    <div className="d-flex flex-column gap-4">
      <div className="section-shell">
        <span className="section-kicker">Checkout</span>
        <h1 className="mb-2">Completa l'ordine</h1>
        <p className="mb-0">I campi mantengono i nomi richiesti dal backend, ma con una struttura più leggibile e validazioni più chiare.</p>
      </div>

      <div className="row gy-4">
        <div className="col-12 col-lg-5 order-1 order-lg-2">
          <div className="card p-3 sticky-lg-top checkout-summary-card" style={{ top: "6.5rem" }}>
            <FreeShippingBanner
              key={isFreeShipping ? "free" : "paid"}
              subtotal={subtotal}
              threshold={FREE_SHIPPING_THRESHOLD}
              shippingCost={SHIPPING_COST}
            />
            <h4 className="mb-3">Riepilogo ordine</h4>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Subtotale</span>
              <span className="price">{formatEur(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Spedizione</span>
              <span className="price">{formatEur(shipping)}</span>
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
            <ul className="list-group list-group-flush checkout-items-list">
              {cart.map((item) => (
                <li key={item.id} className="list-group-item px-0 d-flex justify-content-between gap-3">
                  <div>
                    <span className="fw-semibold text-dark d-block">{item.nome}</span>
                    <span className="small text-muted">Quantità: {item.quantity}</span>
                  </div>
                  <span className="fw-semibold">{formatEur(item.prezzo * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-12 col-lg-7 order-2 order-lg-1">
          <div className="info-card p-4 p-lg-5">
            <h2 className="h4 mb-3">Dati di spedizione</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="row g-3 checkout-form" noValidate>
              {renderField({
                label: "Nome e Cognome",
                name: "nome_completo",
                placeholder: "Inserisci nome e cognome",
                colClass: "col-12",
              })}

              {renderField({
                label: "Email",
                name: "email",
                type: "email",
                placeholder: "nome@esempio.it",
                colClass: "col-12",
              })}

              {renderField({
                label: "Indirizzo",
                name: "indirizzo",
                placeholder: "Via, numero civico",
                colClass: "col-12",
              })}

              {renderField({
                label: "Città",
                name: "citta",
                placeholder: "Città",
                colClass: "col-12 col-md-6",
              })}

              {renderField({
                label: "CAP",
                name: "cap",
                placeholder: "00000",
                colClass: "col-6 col-md-3",
              })}

              {renderField({
                label: "Nazione",
                name: "nazione",
                placeholder: "Nazione",
                colClass: "col-6 col-md-3",
              })}

              <div className="col-12">
                <div className="checkout-note p-3">
                  <strong className="d-block text-dark mb-1">Invio ordine</strong>
                  <span className="small text-muted">L&apos;ordine verrà inviato al backend esistente con gli stessi nomi campo richiesti dal progetto.</span>
                </div>
              </div>

              <div className="col-12 d-grid d-sm-flex gap-2">
                <button className="btn btn-brand btn-lg" disabled={loading}>
                  {loading ? "Invio in corso..." : "Conferma ordine"}
                </button>
                <Link className="btn btn-outline-secondary btn-lg" to="/carrello">Torna al carrello</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

