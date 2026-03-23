function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function ceil2(value) {
  return Math.ceil((Number(value) || 0) * 100) / 100;
}

function promoHash(product) {
  const token = `${product?.id || ""}-${product?.nome || ""}`;
  let sum = 0;
  for (let i = 0; i < token.length; i += 1) {
    sum += token.charCodeAt(i);
  }
  return sum;
}

function normalizeContainer(value) {
  return String(value || "").trim().toLowerCase();
}

function getDiscountProfile(product) {
  const container = normalizeContainer(product?.contenitore);

  if (container.includes("lattina")) {
    return {
      eligibilityModulo: 4,
      discountTiers: [4, 6, 8],
    };
  }

  if (container.includes("bottiglia") || container.includes("vetro")) {
    return {
      eligibilityModulo: 5,
      discountTiers: [2, 4, 6],
    };
  }

  return {
    eligibilityModulo: 5,
    discountTiers: [3, 5],
  };
}

export function getPromotion(product) {
  const originalPrice = round2(product?.prezzo);
  if (!originalPrice || product?.e_bundle) {
    return {
      hasDiscount: false,
      discountPercent: 0,
      currentPrice: originalPrice,
      originalPrice,
    };
  }

  const hash = promoHash(product);
  const profile = getDiscountProfile(product);
  const hasDiscount = hash % profile.eligibilityModulo === 0;
  const discountPercent = hasDiscount
    ? profile.discountTiers[hash % profile.discountTiers.length]
    : 0;
  const rawDiscountedPrice = hasDiscount
    ? ceil2(originalPrice * (1 - discountPercent / 100))
    : originalPrice;
  const currentPrice = rawDiscountedPrice;

  return {
    hasDiscount,
    discountPercent,
    currentPrice,
    originalPrice,
  };
}
