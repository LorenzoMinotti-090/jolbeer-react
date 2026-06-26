import { IconAdjustments } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api/productsApi.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import { backendUrl } from "../services/appConfig.js";

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
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const limit = 12;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedAbv, setSelectedAbv] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const searchQuery = normalize(searchParams.get("q"));
  const filterKey = [selectedCategory, selectedFormat, selectedAbv, selectedPrice, selectedSort, searchQuery].join("|");
  const page = pageState.key === filterKey ? pageState.page : 1;

  const updatePage = (nextPage) => {
    setPageState({ key: filterKey, page: nextPage });
  };

  const resetPagination = () => {
    setPageState({ key: "", page: 1 });
  };

  const updateFilter = (setter, value) => {
    setter(value);
    resetPagination();
  };

  useEffect(() => {
    fetchProducts({ backendUrl, page: 1, limit: 1000 })
      .then(({ items, total }) => {
        setProducts({ prodotti: items, totale: total });
      })
      .catch((err) => setError(err?.message || "Errore"))
      .finally(() => setLoading(false));
  }, []);

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

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (loading && !products) {
    return (
      <div className="section-shell d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" aria-label="Caricamento prodotti" />
      </div>
    );
  }
  if (!products) return <div className="section-shell">Caricamento...</div>;
  if (!Array.isArray(products?.prodotti)) return <div className="section-shell alert alert-warning mb-0">Nessun prodotto disponibile.</div>;

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedFormat("all");
    setSelectedAbv("all");
    setSelectedPrice("all");
    setSelectedSort("newest");
    resetPagination();
  };

  const hasActiveFilters = [selectedCategory, selectedFormat, selectedAbv, selectedPrice].some((value) => value !== "all") || Boolean(searchQuery);

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
    if (selectedSort === "price-asc") return Number(a?.prezzo || 0) - Number(b?.prezzo || 0);
    if (selectedSort === "price-desc") return Number(b?.prezzo || 0) - Number(a?.prezzo || 0);
    if (selectedSort === "name") return String(a?.nome || "").localeCompare(String(b?.nome || ""));

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

  const renderCategoryButtons = () => (
    <div className="d-flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          type="button"
          className={`btn btn-sm rounded-pill ${selectedCategory === cat.value ? "btn-brand" : "btn-outline-secondary"}`}
          onClick={() => updateFilter(setSelectedCategory, cat.value)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );

  const renderFilterControls = ({ compact = false } = {}) => (
    <div className={`d-flex flex-column gap-3 ${compact ? "products-filters--compact" : ""}`}>
      <div>
        <label className="form-label small text-muted mb-2">Stile</label>
        {renderCategoryButtons()}
      </div>

      <div className="filters-panel filters-panel--shop">
        <div className="d-flex flex-column gap-1">
          <label className="form-label small text-muted mb-1">Formato</label>
          <select
            className="form-select"
            value={selectedFormat}
            onChange={(e) => updateFilter(setSelectedFormat, e.target.value)}
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
            onChange={(e) => updateFilter(setSelectedAbv, e.target.value)}
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
            onChange={(e) => updateFilter(setSelectedPrice, e.target.value)}
          >
            <option value="all">Tutti</option>
            <option value="low">Sotto € 5,00</option>
            <option value="mid">€ 5,00 - € 10,00</option>
            <option value="high">Oltre € 10,00</option>
          </select>
        </div>

        <div className="d-flex flex-column gap-1">
          <label className="form-label small text-muted mb-1">Ordina per</label>
          <select
            className="form-select"
            value={selectedSort}
            onChange={(e) => updateFilter(setSelectedSort, e.target.value)}
          >
            <option value="newest">Più recenti</option>
            <option value="price-asc">Prezzo crescente</option>
            <option value="price-desc">Prezzo decrescente</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <div className="d-flex flex-wrap gap-2 small text-muted">
          <span className="filter-pill">Trovati {filteredSorted.length} prodotti</span>
          {searchQuery && <span className="filter-pill">Ricerca: {searchQuery}</span>}
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={handleResetFilters}>
          Cancella filtri
        </button>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column gap-4">
      <div className="section-shell">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-lg-8">
            <p className="text-uppercase text-muted small mb-1">Selezione curata</p>
            <h1 className="mb-2">Birre artigianali JOLBEER</h1>
            <p className="mb-0 text-muted">Filtra per stile, formato, gradazione o fascia prezzo e aggiungi al carrello in un clic.</p>
          </div>
          <div className="col-12 col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end align-items-center">
            <span className="badge bg-dark-subtle text-dark">Catalogo {products?.totale || products?.prodotti?.length || 0}</span>
            <span className="badge bg-light text-muted">Filtrati {filteredSorted.length}</span>
            <div className="btn-group btn-group-sm" role="group" aria-label="Vista">
              <button
                type="button"
                className={`btn ${viewMode === "grid" ? "btn-brand" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("grid")}
              >
                Griglia
              </button>
              <button
                type="button"
                className={`btn ${viewMode === "list" ? "btn-brand" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("list")}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="results-toolbar d-flex d-lg-none justify-content-between align-items-center gap-2">
        <button
          className="btn btn-soft-brand d-inline-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#productsFilters"
          aria-controls="productsFilters"
        >
          <IconAdjustments size={18} />
          <span>Filtri e ordinamento</span>
          {hasActiveFilters && <span className="badge bg-dark-subtle text-dark">Attivi</span>}
        </button>
        <span className="small text-muted">{filteredSorted.length} risultati</span>
      </div>

      <div className="section-shell d-none d-lg-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2 text-muted fw-semibold">
          <IconAdjustments size={20} />
          <span>Filtri e ordinamento</span>
        </div>
        {renderFilterControls()}
      </div>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="productsFilters" aria-labelledby="productsFiltersLabel">
        <div className="offcanvas-header">
          <div>
            <h2 className="offcanvas-title h5 mb-1" id="productsFiltersLabel">Filtri e ordinamento</h2>
            <p className="small text-muted mb-0">Aggiorna il catalogo senza perdere ricerca e preferiti.</p>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Chiudi" />
        </div>
        <div className="offcanvas-body">
          {renderFilterControls({ compact: true })}
        </div>
      </div>

      {filteredSorted.length === 0 && (
        <div className="section-shell text-center d-flex flex-column gap-3 align-items-center">
          <h2 className="h4 mb-0">Nessun prodotto corrisponde ai filtri selezionati</h2>
          <p className="mb-0">Prova a modificare stile, formato o gradazione, oppure riparti dal catalogo completo.</p>
          <button type="button" className="btn btn-brand" onClick={handleResetFilters}>Cancella filtri</button>
        </div>
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

      {filteredSorted.length > 0 && totalPages > 1 && (
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={safePage === 1}
            onClick={() => updatePage(1)}
          >
            « Prima
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={safePage === 1}
            onClick={() => updatePage(Math.max(1, safePage - 1))}
          >
            ‹ Prev
          </button>
          <span className="text-muted small">Pagina {safePage} di {totalPages}</span>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={safePage === totalPages}
            onClick={() => updatePage(Math.min(totalPages, safePage + 1))}
          >
            Next ›
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={safePage === totalPages}
            onClick={() => updatePage(totalPages)}
          >
            Ultima »
          </button>
        </div>
      )}
    </div>
  );
}
