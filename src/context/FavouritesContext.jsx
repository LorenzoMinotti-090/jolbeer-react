import { createContext, useContext, useEffect, useState } from "react";
import { getPromotion } from "../utils/promotions.js";

const FavouritesContext = createContext();

const STORAGE_KEY = "jolbeer_favourites";

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  const isFavourite = (id) => favourites.some((item) => item.id === id);

  const addFavourite = (product) => {
    setFavourites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      const promo = getPromotion(product);
      const minimal = {
        id: product.id,
        slug: product.slug,
        nome: product.nome,
        stile: product.stile,
        categoria: product.categoria,
        contenitore: product.contenitore,
        formato: product.formato,
        formato_cl: product.formato_cl,
        grado_alcolico: product.grado_alcolico,
        e_bundle: product.e_bundle,
        prezzo: Number(promo.currentPrice),
        prezzo_originale: Number(promo.originalPrice),
        discount_percent: Number(promo.discountPercent || 0),
        percorso_immagine: product.percorso_immagine,
        immagine_url: product.immagine_url,
      };
      return [...prev, minimal];
    });
  };

  const removeFavourite = (productId) => {
    setFavourites((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleFavourite = (product) => {
    if (isFavourite(product.id)) {
      removeFavourite(product.id);
    } else {
      addFavourite(product);
    }
  };

  const clearFavourites = () => setFavourites([]);

  const totalFavourites = favourites.length;

  const value = {
    favourites,
    isFavourite,
    toggleFavourite,
    addFavourite,
    removeFavourite,
    clearFavourites,
    totalFavourites,
  };

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
