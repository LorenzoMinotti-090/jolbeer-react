import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPromotion } from "../utils/promotions.js";

const CartContext = createContext();

const STORAGE_KEY = "jolbeer_cart_v2";

export function CartProvider({ children }) {

  function normalizeCartItem(item) {
    const basePrice = Number(item?.prezzo_originale ?? item?.prezzo);
    const productForPromo = { ...item, prezzo: basePrice };
    const promo = getPromotion(productForPromo);
    return {
      ...item,
      prezzo: Number(promo.currentPrice),
      prezzo_originale: Number(promo.originalPrice),
      discount_percent: Number(promo.discountPercent || 0),
      quantity: Math.max(1, Number(item?.quantity) || 1),
    };
  }

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {

    const promo = getPromotion(product);

    setCart(prev => {

      const exists = prev.find(p => p.id === product.id);

      if (exists) {
        return prev.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          nome: product.nome,
          prezzo: Number(promo.currentPrice),
          prezzo_originale: Number(promo.originalPrice),
          discount_percent: Number(promo.discountPercent || 0),
          percorso_immagine: product.percorso_immagine,
          quantity: 1
        }
      ];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function increaseQuantity(id) {
    setCart(prev =>
      prev.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  }

  function decreaseQuantity(id) {
    setCart(prev =>
      prev.map(p =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const totalItems = useMemo(
    () => cart.reduce((sum, p) => sum + p.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, p) => sum + p.prezzo * p.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}