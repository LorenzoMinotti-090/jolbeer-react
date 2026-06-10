import { IconHeart, IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { useFavourites } from "../../context/FavouritesContext.jsx";
import FreeShippingBar, { FREE_SHIPPING_THRESHOLD } from "../ui/FreeShippingBar.jsx";
import AiChatWidget from "../ui/AiChatWidget.jsx";
import logoImage from "../../assets/image/logo-jolbeer.png";

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR"
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export default function MainLayout() {
  const { totalItems, totalPrice } = useCart();
  const { totalFavourites } = useFavourites();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [navbarQuery, setNavbarQuery] = useState(() => searchParams.get("q") || "");

  const subtotal = Number(totalPrice) || 0;
  const isFreeShippingActive = subtotal >= FREE_SHIPPING_THRESHOLD;
  const missingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  useEffect(() => {
    if (location.pathname === "/prodotti") {
      setNavbarQuery(searchParams.get("q") || "");
    }
  }, [location.pathname, searchParams]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = navbarQuery.trim();
    navigate(trimmed ? `/prodotti?q=${encodeURIComponent(trimmed)}` : "/prodotti");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light navbar-premium sticky-top">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            <img src={logoImage} alt="Jolbeer" width={40} height={40} className="rounded-circle brand-logo" />
            <span className="brand-wordmark">JOLBEER</span>
          </NavLink>

          <div className="d-flex align-items-center gap-2 ms-auto d-lg-none navbar-mobile-tools">
            <form className="navbar-search-mobile" onSubmit={handleSearchSubmit} role="search">
              <div className="input-group input-group-sm">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Cerca"
                  value={navbarQuery}
                  onChange={(e) => setNavbarQuery(e.target.value)}
                  aria-label="Cerca"
                />
                <button className="btn btn-dark d-inline-flex align-items-center justify-content-center" type="submit" aria-label="Avvia ricerca">
                  <IconSearch size={18} />
                </button>
              </div>
            </form>

            <button
              className="navbar-toggler navbar-toggler-mobile"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
              aria-controls="mainNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="d-flex flex-column flex-lg-row w-100 align-items-lg-center gap-3 gap-lg-4">
              <div className="navbar-nav align-items-lg-center gap-2 gap-lg-1">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
                  Home
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/prodotti">
                  Prodotti
                </NavLink>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/chi-siamo">
                  Chi siamo
                </NavLink>
              </div>

              <form className="navbar-search ms-lg-auto w-100 order-3 order-lg-0 d-none d-lg-block" onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Cerca birre, stili o descrizioni"
                    value={navbarQuery}
                    onChange={(e) => setNavbarQuery(e.target.value)}
                    aria-label="Cerca"
                  />
                  <button className="btn btn-dark d-inline-flex align-items-center gap-2" type="submit">
                    <IconSearch size={20} />
                    <span>Cerca</span>
                  </button>
                </div>
              </form>

              <div className="navbar-nav flex-row align-items-center gap-2 ms-lg-2 order-2 order-lg-0">
                <NavLink
                  className="nav-link nav-icon-button"
                  to="/preferiti"
                  aria-label="Preferiti"
                  title="Preferiti"
                >
                  <IconHeart size={20} className="nav-icon" />
                  {totalFavourites > 0 && (
                    <span className="nav-badge bg-warning text-dark">{totalFavourites}</span>
                  )}
                </NavLink>
                <NavLink
                  className="nav-link nav-icon-button"
                  to="/carrello"
                  aria-label="Carrello"
                  title="Carrello"
                >
                  <IconShoppingCart size={20} className="nav-icon" />
                  {totalItems > 0 && <span className="nav-badge bg-danger">{totalItems}</span>}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <FreeShippingBar />

      <main className="container py-4 py-lg-5 flex-grow-1">
        <Outlet />
      </main>

      <footer className="footer-premium py-5 mt-auto">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <h5 className="footer-title mb-2">JOLBEER</h5>
              <p className="footer-text mb-0">
                E-commerce specializzato in birre artigianali selezionate. Catalogo curato,
                prezzi trasparenti e spedizioni gestite con attenzione.
              </p>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="footer-title-sm">Shop</h6>
              <div className="footer-links d-flex flex-column gap-2">
                <NavLink to="/prodotti">Catalogo</NavLink>
                <NavLink to="/preferiti">Preferiti</NavLink>
                <NavLink to="/carrello">Carrello</NavLink>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="footer-title-sm">Azienda</h6>
              <div className="footer-links d-flex flex-column gap-2">
                <NavLink to="/chi-siamo">Chi siamo</NavLink>
                <NavLink to="/novita">Novità</NavLink>
                <NavLink to="/prodotti?q=box%20degustazione">Box degustazione</NavLink>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <h6 className="footer-title-sm">Servizio clienti</h6>
              <p className="footer-text mb-2">Supporto rapido per ordini, spedizioni e informazioni prodotto.</p>
              <div className="footer-meta d-flex flex-column gap-1 small">
                <span>Spedizione gratuita sopra € 50,00</span>
                <span>Consegna rapida 24/72h</span>
                <span>Pagamenti sicuri</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-4 pt-3">
            <span className="small text-muted">© {new Date().getFullYear()} JOLBEER</span>
            <span className="small text-muted">Made for craft beer lovers</span>
          </div>
        </div>
      </footer>

      <AiChatWidget />
    </div>
  );
}
