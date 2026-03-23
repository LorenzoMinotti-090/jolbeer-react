import { IconAdjustments } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

const normalize = (value) => String(value || "").trim().toLowerCase();

const getFormatValue = (product) => {
  const container = normalize(product?.contenitore);
  const size = String(product?.formato_cl || "").trim();
  const fallbackFormat = normalize(product?.formato);

  if (container && size) return `${container} ${size}cl`;
  if (container) return container;
  if (fallbackFormat) return fallbackFormat;
  if (size) return `${size}cl`;
  return "";
};

const CATEGORY_OPTIONS = [
  { label: "Tutte", value: "all" },
  { label: "Amber Ale", value: "AMBER ALE" },
  { label: "IPA", value: "IPA" },
  { label: "Lager", value: "LAGER" },
  { label: "Pale Ale", value: "PALE ALE" },
  { label: "Pils", value: "PILS" },
  { label: "Stout", value: "STOUT" },
  { label: "Box degustazione", value: "BUNDLE" },
];

export default function ProductsPage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedAbv, setSelectedAbv] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const searchQuery = normalize(searchParams.get("q"));

  useEffect(() => {
    setError("");
    setProducts(null);

    axios
      .get(`${backendUrl}/api/products`, { params: { page: 1, limit: 1000 } })
      .then((res) => {
        const payload = res.data || {};
        const list = Array.isArray(payload?.prodotti)
          ? payload.prodotti
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
              : [];
        setProducts({ prodotti: list, totale: payload?.totale || list.length });
      })
      .catch((err) => setError(err?.message || "Errore"));
  }, [backendUrl]);

  const dynamicCategories = [...new Set((products?.prodotti || []).map((p) => normalize(p.stile)))]
    .filter(Boolean)
    .map((value) => ({ label: value.toUpperCase(), value: value.toUpperCase() }));

  const categories = CATEGORY_OPTIONS.concat(
    dynamicCategories.filter((dc) => !CATEGORY_OPTIONS.some((c) => c.value === dc.value))
  );

  const formats = useMemo(() => {
    if (!products?.prodotti) return ["all"];

    const set = new Set();
    products.prodotti.forEach((p) => {
      const value = getFormatValue(p);
      if (value && value !== "undefined undefinedcl") {
        set.add(value);
      }
    });
    return ["all", ...set];
  }, [products]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedFormat, selectedAbv, selectedPrice, searchQuery]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!products) return <div>Caricamento...</div>;
  if (!Array.isArray(products?.prodotti)) return <div className="alert alert-warning">Nessun prodotto disponibile.</div>;

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedFormat("all");
    setSelectedAbv("all");
    setSelectedPrice("all");
    setPage(1);
  };

  const filtered = products.prodotti.filter((p) => {
    const styleValue = normalize(p.stile);
    const categoryValue = normalize(p.categoria);
    const selectedCategoryValue = normalize(selectedCategory);
    const formatValue = getFormatValue(p);
    const selectedFormatValue = normalize(selectedFormat);
    const abvValue = Number(p.grado_alcolico);
    const priceValue = Number(p.prezzo);

    const searchableText = [
      p.nome,
      p.stile,
      p.categoria,
      p.descrizione,
      p.contenitore,
      p.formato_cl ? `${p.formato_cl}cl` : "",
      p.formato,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .trim();

    const matchesQuery = !searchQuery || searchableText.includes(searchQuery);

    const matchesCategory =
      selectedCategoryValue === "all" ||
      (selectedCategoryValue === "bundle" && (Boolean(p.e_bundle) || styleValue.includes("box degustazione") || categoryValue.includes("box degustazione"))) ||
      styleValue === selectedCategoryValue;

    const matchesFormat = selectedFormatValue === "all" || formatValue === selectedFormatValue;

    const matchesAbv =
      selectedAbv === "all" ||
      (selectedAbv === "low" && abvValue < 5) ||
      (selectedAbv === "mid" && abvValue >= 5 && abvValue <= 7) ||
      (selectedAbv === "high" && abvValue > 7);

    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "low" && priceValue < 5) ||
      (selectedPrice === "mid" && priceValue >= 5 && priceValue <= 10) ||
      (selectedPrice === "high" && priceValue > 10);

    return matchesQuery && matchesCategory && matchesFormat && matchesAbv && matchesPrice;
  });

  const filteredSorted = [...filtered].sort((a, b) => {
    const dateA = a?.data_creazione ? new Date(a.data_creazione).getTime() : 0;
    const dateB = b?.data_creazione ? new Date(b.data_creazione).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;
    return (Number(b?.id) || 0) - (Number(a?.id) || 0);
  });

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;
  const paginated = filteredSorted.slice(start, end);

  const describe = (p) => {
    const parts = [];
    if (p.stile) parts.push(p.stile);
    if (p.grado_alcolico) parts.push(`${p.grado_alcolico}% ABV`);
    if (p.contenitore && p.formato_cl) parts.push(`${p.contenitore} ${p.formato_cl}cl`);
    parts.push("Note di degustazione: profilo equilibrato, ideale con piatti sapidi o da sola.");
    return parts.join(" · ");
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="bg-white border rounded-4 p-3 p-md-4 shadow-sm">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-lg-8">
            <p className="text-uppercase text-muted small mb-1">Selezione curata</p>
            <h1 className="mb-2">Birre artigianali JOLBEER</h1>
            <p className="mb-0 text-muted">Filtra per stile, formato, gradazione o fascia prezzo e aggiungi al carrello in un clic.</p>
          </div>
          <div className="col-12 col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end align-items-center">
            <span className="badge bg-dark-subtle text-dark">Catalogo {products?.totale || products?.prodotti?.length || 0}</span>
            <span className="badge bg-light text-muted">Filtrati {filteredSorted.length}</span>
            {searchQuery && <span className="badge bg-light text-muted">Ricerca: "{searchQuery}"</span>}
            <div className="btn-group btn-group-sm" role="group" aria-label="Vista">
              <button
                type="button"
                className={`btn ${viewMode === "grid" ? "btn-dark" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("grid")}
              >
                Griglia
              </button>
              <button
                type="button"
                className={`btn ${viewMode === "list" ? "btn-dark" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("list")}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-4 p-3 p-md-4 shadow-sm d-flex flex-column gap-3">
        <div>
          <label className="form-label small text-muted mb-1">Categoria</label>
          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`btn btn-sm rounded-pill ${selectedCategory === cat.value ? "btn-dark" : "btn-outline-secondary"}`}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setPage(1);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 text-muted fw-semibold">
          <IconAdjustments size={20} />
          <span>Filtri</span>
        </div>

        <div className="filters-panel">
          <div className="d-flex flex-column gap-1">
            <label className="form-label small text-muted mb-1">Formato</label>
            <select
              className="form-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f === "all" ? "Tutti i formati" : f}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex flex-column gap-1">
            <label className="form-label small text-muted mb-1">Gradazione (ABV)</label>
            <select
              className="form-select"
              value={selectedAbv}
              onChange={(e) => setSelectedAbv(e.target.value)}
            >
              <option value="all">Tutte</option>
              <option value="low">Sotto 5%</option>
              <option value="mid">5% - 7%</option>
              <option value="high">Oltre 7%</option>
            </select>
          </div>

          <div className="d-flex flex-column gap-1">
            <label className="form-label small text-muted mb-1">Prezzo</label>
            <select
              className="form-select"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            >
              <option value="all">Tutti</option>
              <option value="low">Sotto € 5,00</option>
              <option value="mid">€ 5,00 - € 10,00</option>
              <option value="high">Oltre € 10,00</option>
            </select>
          </div>

          <div className="d-flex flex-column gap-1">
            <label className="form-label small text-muted mb-1">&nbsp;</label>
            <button type="button" className="btn btn-outline-secondary" onClick={handleResetFilters}>
              Reimposta filtri
            </button>
          </div>
        </div>
      </div>

      {filteredSorted.length === 0 && (
        <div className="alert alert-warning mb-0">Nessun prodotto trovato per i filtri selezionati.</div>
      )}

      {viewMode === "grid" && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3 g-md-4">
          {paginated.map((p) => {
            return (
              <div className="col" key={p.id}>
                <ProductCard product={p} description={describe(p)} />
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <div className="d-flex flex-column gap-3">
          {paginated.map((p) => {
            return (
              <ProductCard key={p.id} product={p} variant="list" description={describe(p)} />
            );
          })}
        </div>
      )}

      <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={safePage === 1}
          onClick={() => setPage(1)}
        >
          « Prima
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={safePage === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ‹ Prev
        </button>
        <span className="text-muted small">Pagina {safePage} di {totalPages}</span>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={safePage === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next ›
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={safePage === totalPages}
          onClick={() => setPage(totalPages)}
        >
          Ultima »
        </button>
      </div>
    </div>
  );
}
