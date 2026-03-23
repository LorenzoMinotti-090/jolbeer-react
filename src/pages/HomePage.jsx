import { IconPackage, IconShieldCheck, IconTruckDelivery } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard.jsx";
import BeerCarousel from "../components/BeerCarousel.jsx";
import heroVideo from "../assets/video/hero-beer.mov";

const FALLBACK_IMAGE = "/fallback-product.jpg";

export default function HomePage() {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    axios
      .get(`${backendUrl}/api/products`, { params: { page: 1, limit: 200 } })
      .then((res) => {
        if (!active) return;
        const payload = res.data || {};
        const list = Array.isArray(payload?.prodotti)
          ? payload.prodotti
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
              : [];
        setProducts(list);
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
  }, [backendUrl]);

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
    const copy = [...products];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 8);
  }, [products]);

  return (
    <div className="home-page d-flex flex-column gap-5">
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-6 order-2 order-lg-1">
              <div className="hero-spotlight h-100 d-flex flex-column gap-3 justify-content-center text-center text-lg-start">
                <span className="badge bg-light text-dark align-self-center align-self-lg-start">Artigianale premium</span>
                <h1 className="display-5 fw-bold mb-0">Birre curate, atmosfere da degustazione</h1>
                <p className="mb-0 lead hero-subtitle">
                  Selezione italiana ed europea con box degustazione, stili iconici e formati speciali.
                  Spedizione rapida e pagamenti sicuri.
                </p>
                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                  <Link className="btn btn-brand btn-lg px-4 w-100 w-sm-auto" to="/prodotti">Scopri il catalogo</Link>
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
              <div className="hero-media position-relative">
                <video className="hero-video" src={heroVideo} autoPlay muted loop playsInline />
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
    </div>
  );
}