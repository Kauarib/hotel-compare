function normalizeText(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")    // remove pontuação
    .replace(/\s+/g, " ");           // normaliza espaços
}

function hotelKey(hotel) {
  const name = normalizeText(hotel?.name);
  const addr = normalizeText(hotel?.address);
  const city = normalizeText(hotel?.city);
  // id ajuda a evitar colisão quando Amadeus vier com hotelId
  const id = normalizeText(hotel?.id);
  return `${id}|${name}|${addr}|${city}`;
}

export function dedupeHotels(list) {
  const map = new Map();

  for (const item of list) {
    const key = hotelKey(item.hotel); // ✅ agora key existe

    if (!map.has(key)) {
      map.set(key, {
        hotel: item.hotel,
        offers: [item],
        bestPrice: {
          total: item.total,
          currency: item.currency,
          provider: item.provider,
          deepLink: item.deepLink ?? null
        }
      });
      continue;
    }

    const existing = map.get(key);
    existing.offers.push(item);

    if (item.total < existing.bestPrice.total) {
      existing.bestPrice = {
        total: item.total,
        currency: item.currency,
        provider: item.provider,
        deepLink: item.deepLink ?? null
      };
    }
  }

  return Array.from(map.values());


}
function flightKey(offer) {
  const origin = normalizeText(offer?.origin);
  const destination = normalizeText(offer?.destination); 
  const departureDate = normalizeText(offer?.departureDate);
  const returnDate = normalizeText(offer?.returnDate);
  const adults = normalizeText(offer?.adults);
  return `${origin}|${destination}|${departureDate}|${returnDate}|${adults}`;
}

export async function dedupeFlightOffers(list) {
  const map = new Map();
  const key = flightKey(list[0]); // assumindo que todas as ofertas têm os mesmos detalhes de voo
  for (const offer of list) {
    if (!map.has(key)) {
      map.set(key, {
        offers: [list[0]],
        bestPrice: {
          total: list[0].total,
          currency: list[0].currency,
          provider: list[0].provider,
          deepLink: list[0].deepLink ?? null
        }
      });
      continue;
    }
    const existing = map.get(key);
    existing.offers.push(offer);

    if (offer.total < existing.bestPrice.total) {
      existing.bestPrice = {
        total: offer.total,
        currency: offer.currency,
        provider: offer.provider,
        deepLink: offer.deepLink ?? null
      };
    }
    
  }
  return Array.from(map.values());
}
