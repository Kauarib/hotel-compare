import { amadeusProvider } from "../providers/amadeusProvider.js";
import {cacheGet, cacheSet } from "../utils/cache.js";
import { dedupeHotels, dedupeFlightOffers } from "../utils/dedupe.js";

function cacheKey(q){
  return `search:${q.cityCode}:${q.checkin}:${q.checkout}:${q.guests}`;   
  return `flight-search:${q.origin}:${q.destination}:${q.departureDate}:${q.returnDate}:${q.adults}`;
}
export async function runSearch(query){
    const key = cacheKey(query);
    const cached = cacheGet(key);

    if(cached) return cached;

    const results = await amadeusProvider.search(query);

    const deduped = dedupeHotels(results);

    deduped.sort((a, b) => a.bestPrice.total - b.bestPrice.total);

    cacheSet(key, deduped, 60000);

    return deduped;

}
export async function runFlightSearch(query){
  const key = cacheKey(query);
  const cached = cacheGet(key);
  if(cached) return cached;

  const results = await amadeusProvider.searchFlights(query);  
  const deduped = await dedupeFlightOffers(results);

 // results.sort((a, b) => a.bestPrice.total - b.bestPrice.total);
  cacheSet(key, deduped, 60000);

  return deduped; 
}