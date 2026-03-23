export default function AboutPage() {
  return (
    <div className="d-flex flex-column gap-4 gap-lg-5">
      <section className="row gy-3 align-items-center">
        <div className="col-12 col-lg-8">
          <span className="section-kicker">Chi siamo</span>
          <h1 className="mb-3">La nostra idea di beer e-commerce</h1>
          <p className="mb-2">
            JOLBEER nasce per portare online una selezione craft curata, con un catalogo leggibile,
            acquisto semplice e qualità costante. Non inseguiamo numeri infiniti: scegliamo etichette
            con identità chiara, freschezza monitorata e profili affidabili in degustazione.
          </p>
          <p className="mb-0 text-muted">
            Ogni prodotto è raccontato in modo trasparente: stile, gradazione, formato e suggerimenti
            d&apos;abbinamento per aiutarti a comprare bene anche al primo ordine.
          </p>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card h-100 border-0 bg-light">
            <div className="card-body d-flex flex-column gap-2">
              <h5 className="mb-0">Il nostro impegno</h5>
              <p className="small mb-0 text-muted">Catalogo selezionato e aggiornato con criteri chiari.</p>
              <p className="small mb-0 text-muted">Logistica rapida, assistenza concreta, esperienza pulita.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3 g-md-4">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Qualità verificata</h5>
              <p className="card-text mb-0">Selezione basata su freschezza, coerenza produttiva e bevibilità reale.</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Trasparenza totale</h5>
              <p className="card-text mb-0">Schede prodotto chiare, prezzi leggibili e sconti sempre comprensibili.</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Servizio ecommerce</h5>
              <p className="card-text mb-0">Spedizioni curate, supporto rapido e percorso acquisto senza attriti.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 bg-light">
        <div className="card-body">
          <h2 className="h5">Perché scegliere JOLBEER</h2>
          <p className="mb-0">
            Uniamo gusto, scelta e praticità in una piattaforma pensata per chi vuole bere meglio,
            senza perdersi in schede confuse o cataloghi dispersivi. Dal carrello alla consegna,
            ogni passaggio è progettato per un&apos;esperienza premium ma accessibile.
          </p>
        </div>
      </section>
    </div>
  );
}