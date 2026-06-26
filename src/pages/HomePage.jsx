import { IconPackage, IconShieldCheck, IconTruckDelivery } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/productsApi.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import BeerCarousel from "../components/ui/BeerCarousel.jsx";
import heroVideo from "../assets/video/hero-beer.mov";
import { backendUrl } from "../services/appConfig.js";

function getStableRank(product) {
  const seed = `${product?.id || ""}:${product?.nome || ""}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  return hash;
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const boxHref = "/prodotti?q=box%20degustazione";

  useEffect(() => {
    let active = true;

    fetchProducts({ backendUrl, page: 1, limit: 200 })
      .then(({ items }) => {
        if (!active) return;
        setProducts(items);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Errore nel caricamento dei prodotti");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const newestProducts = useMemo(() => {
    if (!products.length) return [];

    return [...products]
      .sort((a, b) => {
        const dateA = a?.data_creazione ? new Date(a.data_creazione).getTime() : null;
        const dateB = b?.data_creazione ? new Date(b.data_creazione).getTime() : null;

        if (dateA && dateB) return dateB - dateA;
        if (dateA) return -1;
        if (dateB) return 1;

        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
      })
      .slice(0, 8);
  }, [products]);

  const styleChips = useMemo(() => {
    const styles = new Set();
    products.forEach((p) => {
      const value = (p.stile || p.categoria || "").trim();
      if (value) styles.add(value);
    });
    const list = [...styles].filter(Boolean).slice(0, 10);
    if (list.length) return list;
    return ["IPA", "Lager", "Stout", "Pils", "Amber Ale", "Pale Ale"];
  }, [products]);

  const boxProducts = useMemo(() => {
    return products
      .filter((p) => {
        const label = (p.stile || p.categoria || p.nome || "").toUpperCase();
        return label.includes("BOX DEGUSTAZIONE") || p.e_bundle || label.startsWith("BOX ");
      })
      .slice(0, 4);
  }, [products]);

  const bestsellerProducts = useMemo(() => {
    if (!products.length) return [];

    return [...products]
      .sort((a, b) => getStableRank(a) - getStableRank(b))
      .slice(0, 8);
  }, [products]);

  const highlightStats = useMemo(() => {
    const totalStyles = new Set(
      products
        .map((product) => (product.stile || product.categoria || "").trim())
        .filter(Boolean)
    ).size;

    return [
      { value: products.length || 0, label: "etichette online" },
      { value: boxProducts.length || 0, label: "box degustazione" },
      { value: totalStyles || 0, label: "stili selezionati" },
    ];
  }, [boxProducts.length, products]);

  const shopBenefits = useMemo(() => {
    return [
      {
        title: "Catalogo leggibile",
        copy: "Schede essenziali con stile, formato, ABV e promozioni sempre chiare.",
      },
      {
        title: "Selezioni degustazione",
        copy: "Box e percorsi di assaggio costruiti con i prodotti già presenti in catalogo.",
      },
      {
        title: "Spedizione controllata",
        copy: "Sopra 50 euro la spedizione è gratuita e il riepilogo resta sempre trasparente.",
      },
    ];
  }, []);

  return (
    <div className="home-page d-flex flex-column gap-5">
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-6 order-2 order-lg-1">
              <div className="hero-spotlight h-100 d-flex flex-column gap-3 justify-content-center text-center text-lg-start">
                <h1 className="display-5 fw-bold mb-0">Birre artigianali curate per chi vuole bere meglio</h1>
                <p className="mb-0 lead hero-subtitle">
                  Una selezione essenziale di etichette, box degustazione e stili iconici con un percorso d&apos;acquisto semplice,
                  ordinato e pensato per la degustazione.
                </p>
                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                  <Link className="btn btn-brand btn-lg px-4 w-100 w-sm-auto" to="/prodotti">Scopri le birre</Link>
                  <Link className="btn btn-outline-brand btn-lg px-4 w-100 w-sm-auto" to={boxHref}>Prova un box</Link>
                </div>
                <div className="trust-bar justify-content-center justify-content-lg-start">
                  {[
                    { label: "Spedizione veloce", icon: IconTruckDelivery },
                    { label: "Pagamenti sicuri", icon: IconShieldCheck },
                    { label: "Box degustazione", icon: IconPackage },
                    { label: "Reso facile", icon: null },
                  ].map(({ label, icon: IconComp }) => (
                    <span key={label} className="trust-pill d-inline-flex align-items-center gap-2">
                      {IconComp ? <IconComp size={20} /> : null}
                      <span>{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 order-1 order-lg-2">
              <div className="hero-media">
                <video className="hero-video" src={heroVideo} autoPlay muted loop playsInline />
              </div>
              <div className="hero-overlay-card" aria-hidden="true">
                {highlightStats.map((item) => (
                  <div key={item.label} className="hero-overlay-stat">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container shipping-banner">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="fw-semibold text-dark">Spedizione gratis sopra € 50,00</span>
            <span className="text-muted">Seleziona le tue birre preferite, il resto lo gestiamo noi.</span>
          </div>
          <Link className="btn btn-brand btn-sm" to="/prodotti">Vai ai prodotti</Link>
        </div>
      </section>

      <section className="container">
        <div className="row g-3 g-lg-4 home-benefits">
          {shopBenefits.map((benefit) => (
            <div className="col-12 col-md-4" key={benefit.title}>
              <article className="info-card h-100 p-4">
                <span className="section-kicker">Vantaggio</span>
                <h2 className="h5 mb-2">{benefit.title}</h2>
                <p className="mb-0">{benefit.copy}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="section-header">
          <span className="section-kicker">Novità</span>
          <h2 className="section-title">Gli ultimi arrivi artigianali</h2>
          <p className="mb-0">Le referenze più fresche, selezionate per essere degustate al meglio.</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border" role="status" aria-label="Caricamento" />
          </div>
        )}
        {!loading && !error && newestProducts.length === 0 && (
          <div className="alert alert-warning">Nessuna novità disponibile al momento.</div>
        )}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 g-md-4">
          {newestProducts.map((product) => (
            <div className="col" key={product.id || product.nome}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="section-header">
          <span className="section-kicker">Box degustazione</span>
          <h2 className="section-title">Percorsi guidati da scoprire</h2>
          <p className="mb-0">Selezioni tematiche pronte all&apos;assaggio, perfette da condividere.</p>
        </div>
        <BeerCarousel />
        {boxProducts.length > 0 && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 g-md-4 mt-1">
            {boxProducts.map((product) => (
              <div className="col" key={product.id || product.nome}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        {!loading && boxProducts.length === 0 && (
          <div className="alert alert-secondary mt-3">Box in arrivo, torna presto per nuove selezioni.</div>
        )}
      </section>

      <section className="container">
        <div className="section-header">
          <span className="section-kicker">Per stile</span>
          <h2 className="section-title">Scegli l&apos;anima della tua pinta</h2>
        </div>
        <div className="d-flex flex-wrap gap-2 gap-md-3">
          {styleChips.map((style) => (
            <Link key={style} className="chip" to={`/prodotti?q=${encodeURIComponent(style)}`}>
              {style}
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="brand-story section-shell">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-7">
              <div className="section-header mb-0">
                <span className="section-kicker">Il brand</span>
                <h2 className="section-title">JOLBEER seleziona il catalogo con un taglio più curatoriale che enciclopedico</h2>
                <p className="mb-0">
                  Meno rumore, più scelta ragionata: ogni scheda prodotto mette in evidenza ciò che serve davvero per acquistare bene,
                  dal formato alla gradazione, fino alle promozioni e ai box degustazione.
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="brand-story__panel">
                <div>
                  <strong>{products.length || 0}</strong>
                  <span>prodotti già disponibili via API</span>
                </div>
                <div>
                  <strong>{newestProducts.length || 0}</strong>
                  <span>novità in primo piano</span>
                </div>
                <div>
                  <strong>{bestsellerProducts.length || 0}</strong>
                  <span>best seller sempre accessibili</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="section-header">
          <span className="section-kicker">Più vendute</span>
          <h2 className="section-title">Le etichette preferite dalla community</h2>
          <p className="mb-0">Un mix stabile di bestseller, scelto una volta per sessione.</p>
        </div>
        {bestsellerProducts.length === 0 && !loading && (
          <div className="alert alert-light border">Aggiungeremo presto le più amate.</div>
        )}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 g-md-4">
          {bestsellerProducts.map((product) => (
            <div className="col" key={product.id || product.nome}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-5">
        <div className="cta-banner section-shell text-center text-lg-start">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-8">
              <span className="section-kicker">Call to action</span>
              <h2 className="section-title mb-2">Costruisci il tuo ordine tra birre singole e box degustazione</h2>
              <p className="mb-0">Scopri il catalogo completo, salva i preferiti e completa l&apos;acquisto con un checkout più leggibile.</p>
            </div>
            <div className="col-12 col-lg-4 d-grid d-sm-flex justify-content-lg-end gap-2">
              <Link className="btn btn-brand btn-lg" to="/prodotti">Scopri le birre</Link>
              <Link className="btn btn-outline-brand btn-lg" to={boxHref}>Vai ai box</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}