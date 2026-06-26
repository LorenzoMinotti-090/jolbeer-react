import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderById } from "../api/ordersApi.js";
import { backendUrl } from "../services/appConfig.js";
import { formatEur } from "../utils/price.js";

export default function OrderSuccessPage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const payload = await fetchOrderById({ backendUrl, id });
        if (active) setData(payload);
      } catch (err) {
        if (active) setError(err?.response?.data?.error || err.message || "Errore");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="section-shell d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" aria-label="Caricamento" />
      </div>
    );
  }

  if (error) {
    return <div className="section-shell alert alert-danger mb-0">{error}</div>;
  }

  if (!data) return null;

  const { ordine, prodotti } = data;

  return (
    <div className="d-flex flex-column gap-4">
      <div className="section-shell text-center">
        <span className="section-kicker">Ordine confermato</span>
        <h1 className="mb-2">Ordine confermato</h1>
        <p className="text-success fw-semibold mb-1">Grazie per il tuo acquisto!</p>
        <p className="mb-0 text-muted">Ti abbiamo accompagnato dal carrello al checkout: ora trovi tutti i dettagli dell&apos;ordine in un riepilogo più leggibile.</p>
      </div>

      <div className="row gy-4">
      <div className="col-12 col-lg-6">
        <div className="info-card h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Riepilogo ordine</h5>
            <div className="mb-2"><span className="text-muted">Codice:</span> <strong>{ordine.codice_ordine}</strong></div>
            <div className="mb-2"><span className="text-muted">Stato:</span> <strong>{ordine.stato}</strong></div>
            <div className="mb-2"><span className="text-muted">Totale:</span> <strong>{formatEur(ordine.totale)}</strong></div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="info-card h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Cliente</h5>
            <div className="mb-2"><span className="text-muted">Nome:</span> <strong>{ordine.nome_cliente}</strong></div>
            <div className="mb-2"><span className="text-muted">Email:</span> <strong>{ordine.email_cliente}</strong></div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="info-card h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Spedizione</h5>
            <div className="mb-2">{ordine.indirizzo_spedizione}</div>
            <div className="mb-2">{ordine.cap_spedizione} {ordine.citta_spedizione} ({ordine.nazione_spedizione})</div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="info-card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Prodotti ordinati</h5>
            <div className="list-group list-group-flush">
              {prodotti.map((p) => (
                <div key={p.id} className="list-group-item px-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <div className="fw-semibold">{p.nome}</div>
                    <div className="text-muted small">Quantità: {p.quantita}</div>
                  </div>
                  <div className="fw-semibold">{formatEur(p.totale_riga)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 text-center mt-2">
        <Link className="btn btn-brand" to="/prodotti">Continua lo shopping</Link>
      </div>
      </div>
    </div>
  );
}