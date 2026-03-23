const STYLE_LIBRARY = [
  {
    match: /ipa|india pale/i,
    mood: "profilo aromatico deciso",
    notes: "agrumi maturi, resina fine e chiusura secca",
    pairing: "burger gourmet e cucina speziata",
  },
  {
    match: /lager|pils|helles/i,
    mood: "bevuta pulita e scorrevole",
    notes: "cereale fresco, luppolo gentile e finale nitido",
    pairing: "fritti leggeri, pizza classica e taglieri",
  },
  {
    match: /stout|porter/i,
    mood: "struttura morbida e avvolgente",
    notes: "cacao, caffe tostato e sfumature di caramello",
    pairing: "carni brasate e dessert al cioccolato",
  },
  {
    match: /sour|gose|lambic/i,
    mood: "sorso vivace e rinfrescante",
    notes: "acidita elegante, frutta chiara e finale asciutto",
    pairing: "aperitivo, crudi di pesce e formaggi freschi",
  },
  {
    match: /wheat|weiss|blanche/i,
    mood: "corpo setoso e aromaticita fine",
    notes: "frumento, agrumi delicati e tocco floreale",
    pairing: "insalate ricche, pesce e cucina mediterranea",
  },
  {
    match: /amber|red|bock|dubbel|tripel|belg/i,
    mood: "equilibrio pieno e carattere rotondo",
    notes: "malto caldo, frutta matura e finale persistente",
    pairing: "cucina di carne, piatti saporiti e stagionati",
  },
];

function pickStyleProfile(styleName) {
  const normalized = String(styleName || "");
  return (
    STYLE_LIBRARY.find((item) => item.match.test(normalized)) || {
      mood: "profilo bilanciato e contemporaneo",
      notes: "malto pulito, luppolo misurato e finale elegante",
      pairing: "taglieri misti e cucina casual premium",
    }
  );
}

function formatAbv(product) {
  const abv = Number(product?.grado_alcolico);
  if (!Number.isFinite(abv) || abv <= 0) return "gradazione non indicata";
  return `${abv}% vol`;
}

function formatPack(product) {
  const container = String(product?.contenitore || "").trim();
  const size = String(product?.formato_cl || "").trim();
  if (container && size) return `${container.toLowerCase()} ${size}cl`;
  if (container) return container.toLowerCase();
  return "formato selezionato";
}

export function getProductShortDescription(product) {
  const style = product?.stile || product?.categoria || "Selezione craft";
  const profile = pickStyleProfile(style);

  if (product?.e_bundle) {
    return `Box degustazione ${style.toLowerCase()} con selezione guidata, ideale per tasting domestici e regali.`;
  }

  return `${style}: ${profile.notes}. ${formatPack(product)}, ${formatAbv(product)}.`;
}

export function getProductLongDescription(product) {
  const style = product?.stile || product?.categoria || "Selezione craft";
  const profile = pickStyleProfile(style);
  const pack = formatPack(product);
  const abv = formatAbv(product);

  if (product?.e_bundle) {
    return `Questa box degustazione ${style.toLowerCase()} e pensata per offrire un percorso completo: etichette complementari, ritmo di assaggio equilibrato e qualita da beer shop specializzato. Ideale per serate tra amici, gift premium e pairing semplici ma curati.`;
  }

  return `${style} dal ${profile.mood}: ${profile.notes}. Proposta in ${pack} con ${abv}, pensata per un acquisto sicuro e una degustazione di livello. Da valorizzare con ${profile.pairing}.`;
}

export function getProductCardTeaser(product) {
  const longText = getProductLongDescription(product);
  const firstSentence = longText.split(".")[0]?.trim() || longText;
  const teaser = `${firstSentence}.`;

  if (teaser.length <= 140) {
    return `${teaser} Scopri i dettagli prodotto.`;
  }

  return `${teaser.slice(0, 136).trimEnd()}...`;
}
