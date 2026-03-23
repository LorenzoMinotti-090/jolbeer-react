import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import FreeShippingBanner from "../components/FreeShippingBanner.jsx";
import { FREE_GIFT_LABEL } from "../components/FreeShippingBar.jsx";
import { formatEur } from "../utils/price.js";


const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 6.9;

export default function CheckoutPage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
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

  function handleChange(e) {
    setCliente((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Il carrello è vuoto.");
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
      const res = await axios.post(`${backendUrl}/api/orders`, payload);
      clearCart();
      navigate(`/ordine/${res.data.ordine_id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Errore");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row gy-4">
      <div className="col-12 col-lg-7">
        <h1 className="mb-3">Checkout</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Nome e Cognome</label>
            <input className="form-control" name="nome_completo" value={cliente.nome_completo} onChange={handleChange} required />
          </div>

          <div className="col-12">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email" value={cliente.email} onChange={handleChange} required />
          </div>

          <div className="col-12">
            <label className="form-label">Indirizzo</label>
            <input className="form-control" name="indirizzo" value={cliente.indirizzo} onChange={handleChange} required />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Città</label>
            <input className="form-control" name="citta" value={cliente.citta} onChange={handleChange} required />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">CAP</label>
            <input className="form-control" name="cap" value={cliente.cap} onChange={handleChange} required />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">Nazione</label>
            <input className="form-control" name="nazione" value={cliente.nazione} onChange={handleChange} />
          </div>

          <div className="col-12 d-grid d-sm-flex gap-2">
            <button className="btn btn-dark" disabled={loading}>
              {loading ? "Invio..." : "Conferma ordine"}
            </button>
          </div>
        </form>
      </div>

      <div className="col-12 col-lg-5">
        <div className="card p-3 sticky-lg-top" style={{ top: "6.5rem" }}>
          <FreeShippingBanner
            key={isFreeShipping ? "free" : "paid"}
            subtotal={subtotal}
            threshold={FREE_SHIPPING_THRESHOLD}
            shippingCost={SHIPPING_COST}
          />
          <h4 className="mb-3">Riepilogo</h4>
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
          <ul className="list-group list-group-flush">
            {cart.map((item) => (
              <li key={item.id} className="list-group-item px-0 d-flex justify-content-between">
                <span className="text-truncate me-2">{item.nome} × {item.quantity}</span>
                <span className="fw-semibold">{formatEur(item.prezzo * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

