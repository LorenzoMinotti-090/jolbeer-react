import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
      const minimal = {
        id: product.id,
        nome: product.nome,
        prezzo: Number(product.prezzo),
        percorso_immagine: product.percorso_immagine,
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

  const totalFavourites = useMemo(() => favourites.length, [favourites]);

  const value = useMemo(
    () => ({
      favourites,
      isFavourite,
      toggleFavourite,
      addFavourite,
      removeFavourite,
      clearFavourites,
      totalFavourites,
    }),
    [favourites, totalFavourites]
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
