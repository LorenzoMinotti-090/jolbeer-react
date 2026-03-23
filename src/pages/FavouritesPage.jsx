import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useFavourites } from "../context/FavouritesContext.jsx";

export default function FavouritesPage() {
  const { favourites, removeFavourite, clearFavourites } = useFavourites();

  if (!favourites.length) {
    return (
      <div className="bg-white border rounded-4 p-4 shadow-sm text-center d-flex flex-column gap-3 align-items-center">
        <h1 className="mb-1">Preferiti</h1>
        <p className="text-muted mb-0">Non hai ancora aggiunto prodotti ai preferiti.</p>
        <Link className="btn btn-dark" to="/prodotti">Scopri i prodotti</Link>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 gap-md-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <p className="text-uppercase text-muted small mb-1">Wishlist</p>
          <h1 className="mb-0">I tuoi preferiti ({favourites.length})</h1>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/prodotti">Torna al catalogo</Link>
          <button className="btn btn-outline-danger" onClick={clearFavourites}>Svuota preferiti</button>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 g-md-4">
        {favourites.map((product) => (
          <div className="col" key={product.id}>
            <div className="d-flex flex-column h-100 gap-2">
              <ProductCard product={product} />
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeFavourite(product.id)}
              >
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
