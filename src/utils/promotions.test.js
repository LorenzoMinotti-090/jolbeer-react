import { describe, expect, it } from "vitest";
import { getPromotion } from "./promotions.js";

const SAMPLE_NAMES = [
  "Birra Test",
  "Luppolo Vivo",
  "Maltata Classica",
  "Dry Hop",
  "Amber Wave",
  "Pils Lab",
  "Session Ale",
];

function findProductWithDiscount(container = "lattina") {
  for (let i = 1; i <= 1000; i += 1) {
    for (const baseName of SAMPLE_NAMES) {
      const product = {
        id: i,
        nome: `${baseName} ${i}`,
        contenitore: container,
        prezzo: 5.99,
        e_bundle: false,
      };

      const promo = getPromotion(product);
      if (promo.hasDiscount) {
        return { product, promo };
      }
    }
  }

  throw new Error("Impossibile trovare un prodotto con promo nel range testato");
}

function findProductWithoutDiscount(container = "lattina") {
  for (let i = 1; i <= 1000; i += 1) {
    for (const baseName of SAMPLE_NAMES) {
      const product = {
        id: i,
        nome: `${baseName} ${i}`,
        contenitore: container,
        prezzo: 5.99,
        e_bundle: false,
      };

      const promo = getPromotion(product);
      if (!promo.hasDiscount) {
        return { product, promo };
      }
    }
  }

  throw new Error("Impossibile trovare un prodotto senza promo nel range testato");
}

describe("getPromotion", () => {
  it("non deve applicare uno sconto reale superiore alla percentuale dichiarata", () => {
    const { promo } = findProductWithDiscount("lattina");

    const effectiveDiscount = ((promo.originalPrice - promo.currentPrice) / promo.originalPrice) * 100;

    expect(promo.discountPercent).toBeGreaterThan(0);
    expect(effectiveDiscount).toBeLessThanOrEqual(promo.discountPercent);
  });

  it("deve mantenere invariato il prezzo quando il prodotto non e in promo", () => {
    const { promo } = findProductWithoutDiscount("lattina");

    expect(promo.hasDiscount).toBe(false);
    expect(promo.discountPercent).toBe(0);
    expect(promo.currentPrice).toBe(promo.originalPrice);
  });

  it("non deve applicare promozioni ai bundle", () => {
    const promo = getPromotion({
      id: 42,
      nome: "Box Degustazione",
      contenitore: "bottiglia",
      prezzo: 29.9,
      e_bundle: true,
    });

    expect(promo.hasDiscount).toBe(false);
    expect(promo.discountPercent).toBe(0);
    expect(promo.currentPrice).toBe(29.9);
    expect(promo.originalPrice).toBe(29.9);
  });
});
