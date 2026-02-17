import axios from "axios";

const BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
const KEY = process.env.AMADEUS_KEY;
const SECRET = process.env.AMADEUS_SECRET;

if (!KEY) throw new Error("AMADEUS_KEY is missing");
if (!SECRET) throw new Error("AMADEUS_SECRET is missing");

let tokenCache = { token: null, exp: 0 };

async function getToken() {
  if (tokenCache.token && Date.now() < tokenCache.exp - 30_000) return tokenCache.token;

  const res = await axios.post(
    `${BASE}/v1/security/oauth2/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: KEY,
      client_secret: SECRET,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  tokenCache.token = res.data.access_token;
  tokenCache.exp = Date.now() + Number(res.data.expires_in) * 1000;
  return tokenCache.token;
}

async function amadeusGet(path, params) {
  const token = await getToken();
  try {
    return await axios.get(`${BASE}${path}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
      timeout: 60_000,
    });
  }    catch (e) {
    // Quando não há resposta HTTP, e.response é undefined
    console.error("Amadeus axios error code:", e.code);
    console.error("Amadeus axios error message:", e.message);

    if (e.response) {
      console.error("Amadeus HTTP status:", e.response.status);
      console.error("Amadeus HTTP body:", JSON.stringify(e.response.data, null, 2));
      const msg =
        e.response.data?.errors?.[0]?.detail ||
        e.response.data?.errors?.[0]?.title ||
        "Amadeus request failed";
      const apiCode = e.response.data?.errors?.[0]?.code;

      throw new Error(`AMADEUS_${e.response.status}_${apiCode ?? "UNKNOWN"}: ${msg}`);
    }

    // Erro de rede/timeout/DNS etc.
    throw new Error(`AMADEUS_NETWORK_${e.code ?? "UNKNOWN"}: ${e.message}`);
  }

}

// 1) Lista hotéis por cidade -> retorna hotelIds
async function listHotelsByCity(cityCode) {
  const res = await amadeusGet("/v1/reference-data/locations/hotels/by-city", {
    cityCode,
    radius: 10,
    radiusUnit: "KM",
    hotelSource: "ALL",
  });

  // cada item tem hotelId
  return (res.data?.data ?? []).map((h) => h.hotelId).filter(Boolean);
}

// 2) Busca ofertas por hotelIds (obrigatório no seu caso)
async function getHotelOffers({ hotelIds, checkin, checkout, guests }) {
  const res = await amadeusGet("/v3/shopping/hotel-offers", {
    hotelIds: hotelIds.join(","),      // <- o que estava faltando
    checkInDate: checkin,
    checkOutDate: checkout,
    adults: guests,
    // currency: "BRL" // opcional
  });

  return res.data?.data ?? [];
}
async function getflightOffers({origin, destination, departureDate, returnDate,adults}) {
  const res = await amadeusGet("/v2/shopping/flight-offers",{
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    returnDate,
    adults,
    currencyCode: "BRL"
  })
  return res.data?.data ?? [];
  
}
function normalize(items) {
  return items
    .map((item) => {
      const hotel = item.hotel || {};
      const offers = Array.isArray(item.offers) ? item.offers : [];
      if (!offers.length) return null;

      // pega a menor oferta
      const best = offers.reduce((min, cur) => {
        const curTotal = Number(cur?.price?.total ?? Infinity);
        const minTotal = Number(min?.price?.total ?? Infinity);
        return curTotal < minTotal ? cur : min;
      }, offers[0]);

      const total = Number(best?.price?.total ?? NaN);
      if (!Number.isFinite(total)) return null;

      return {
        provider: "Amadeus",
        hotel: {
          id: hotel.hotelId ?? null,
          name: hotel.name ?? "Unknown hotel",
          city: hotel.address?.cityName ?? null,
          address: Array.isArray(hotel.address?.lines) ? hotel.address.lines.join(", ") : null,
          geo: hotel.geoCode
            ? { lat: hotel.geoCode.latitude, lng: hotel.geoCode.longitude }
            : null,
        },
        currency: best?.price?.currency ?? "BRL",
        total,
        cancellable: !!best?.policies?.cancellation,
        deepLink: null,
      };
    })
    .filter(Boolean);
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const amadeusProvider = {
  name: "Amadeus",

  async search({ cityCode, checkin, checkout, guests }) {
    const hotelIds = await listHotelsByCity(cityCode);
    if (!hotelIds.length) return [];

    // ✅ lote pequeno para não estourar timeout no sandbox
    const chunks = chunkArray(hotelIds.slice(0, 30), 5); // 30 ids no total, 5 por requisição

    const results = [];
    for (const ids of chunks) {
      try {
        const data = await getHotelOffers({
          hotelIds: ids,
          checkin,
          checkout,
          guests,
        });
        results.push(...data);
      } catch (e) {
        // não derruba tudo por causa de 1 lote
        console.error("Hotel-offers chunk failed:", ids.join(","), e.message);
      }
    }


    return normalize(results);
  },
  async searchFlights({originLocationCode, destinationLocationCode, departureDate, returnDate,adults}){
    const data = await getflightOffers({origin: originLocationCode, destination: destinationLocationCode, departureDate, returnDate,adults});
    if (!data.length) return [];

    const chunks = chunkArray(data.slice(0, 30), 5); // 5 por requisição
    const results = [];
    for (const ids of chunks) {
      try {
        const data = await getflightOffers({origin: originLocationCode, destination: destinationLocationCode, departureDate, returnDate,adults});
        results.push(...data);
      } catch (e) {
        console.error("Flight-offers chunk failed:", e.message); 
      }
    }
    return results;
  }
}